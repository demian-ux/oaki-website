"use client";

import { useRef, useState } from "react";
import { type ContactPageData } from "@/lib/data";
import {
  contactSchema,
  MESSAGE_MAX,
  ATTACHMENT_ACCEPT,
  ATTACHMENT_MAX_FILES,
  ATTACHMENT_MAX_TOTAL_BYTES,
  attachmentsError,
} from "@/lib/contact-schema";
import Received from "@/components/contact/Received";
import { FOCUS, HAIRLINE, MOTION } from "@/components/contact/ui";
import { upload } from "@vercel/blob/client";
import { track } from "@vercel/analytics";
import type { Lead } from "@/lib/lead-source";

// One step, no wizard. Set as a letter (handoff 1b): the main fields are a
// sentence the visitor completes; link and files drop to a quiet tier.
// The page copy promises "you don't need the brief
// finished. Send what you have" — so the form asks for exactly that: who you
// are, how to reach you, what you're building, and an optional link to
// whatever exists (plans, references, a folder). Every extra step is friction
// the copy promises not to have.
//
// Validation runs client-side with the same schema the API uses, so a slip
// shows up under the field it belongs to, in plain words, before anything is
// sent. The API's own message is the fallback for anything else.

interface ContactFormProps {
  config?: ContactPageData;
  /** Where the lead came from (selected work passes source and from);
   *  travels as hidden fields and in the payload. */
  lead?: Lead;
}

type Field = "name" | "email" | "website" | "message" | "files";
type FieldErrors = Partial<Record<Field, string>>;

/** Inputs set inside the letter sentence: they inherit its type. Placeholder
 *  #9c9892 is literal so Tailwind can see it. */
const letterInput = `inline-block w-full bg-transparent border-b border-ink font-light text-ink placeholder:text-[#9c9892] ${MOTION} ${FOCUS}`;
/** The quiet second tier (link, files): 16px on a hairline. */
const tierInput = `w-full bg-transparent border-b pb-2 text-[16px] text-ink placeholder:text-muted focus:border-ink ${MOTION} ${FOCUS}`;
/** 10px mono-voice labels of the second tier. */
const tierLabel = "coord block mb-2.5";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-meta" style={{ color: "var(--color-error)" }}>
      {message}
    </p>
  );
}

/** Zod issues → one plain message per field (the first issue wins). */
function toFieldErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !(field in out)) {
      out[field as Field] = issue.message;
    }
  }
  return out;
}

export default function ContactForm({ config, lead }: ContactFormProps = {}) {
  const submittingLabel = config?.submittingLabel ?? "Sending…";
  const messagePrompt =
    config?.messagePrompt ??
    "Share a bit about your project";
  const thankYouHeading =
    config?.thankYouHeading ?? "Thank you. We received your note.";
  const successMessage =
    config?.successMessage ?? "We will read it with care and get back to you soon.";

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  // 0..100 while files are going to the Blob store, null otherwise.
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Merge newly picked files into the list (same name + size = same file),
  // then check the whole list against the shared limits.
  const addFiles = (picked: FileList | File[]) => {
    const next = [...files];
    for (const f of Array.from(picked)) {
      if (!next.some((g) => g.name === f.name && g.size === f.size)) next.push(f);
    }
    const problem = attachmentsError(next);
    setFieldErrors((prev) => ({ ...prev, files: problem ?? undefined }));
    if (!problem) setFiles(next);
  };
  const removeFile = (i: number) => {
    const next = files.filter((_, idx) => idx !== i);
    setFiles(next);
    setFieldErrors((prev) => ({ ...prev, files: attachmentsError(next) ?? undefined }));
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    website: "",
    message: "",
  });

  const set = (field: Field, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // A field being edited drops its error immediately; the next submit
    // re-checks everything.
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Trim before checking so a name that is only spaces does not pass.
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      website: form.website.trim(),
      message: form.message.trim(),
      ...(lead?.source ? { source: lead.source } : {}),
      ...(lead?.from ? { from: lead.from } : {}),
    };
    const parsed = contactSchema.safeParse(payload);
    const fileProblem = attachmentsError(files);
    if (!parsed.success || fileProblem) {
      const errors: FieldErrors = parsed.success ? {} : toFieldErrors(parsed.error.issues);
      if (fileProblem) errors.files = fileProblem;
      setFieldErrors(errors);
      const first = (["name", "email", "message", "website"] as Field[]).find((f) => errors[f]);
      if (first) document.getElementById(first)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      // Files go browser → Blob store directly; the form then sends only
      // their references. Progress is tracked across all files together.
      const total = files.reduce((n, f) => n + f.size, 0);
      const loaded = files.map(() => 0);
      const attachments = [];
      for (const [i, f] of files.entries()) {
        setUploadPct(0);
        const blob = await upload(`contact/${f.name}`, f, {
          access: "private",
          handleUploadUrl: "/api/contact/upload",
          contentType: f.type || "application/octet-stream",
          multipart: f.size > 5 * 1024 * 1024,
          onUploadProgress: (e) => {
            loaded[i] = e.loaded;
            setUploadPct(Math.round((loaded.reduce((a, b) => a + b, 0) / total) * 100));
          },
        });
        attachments.push({
          name: f.name,
          size: f.size,
          type: f.type,
          pathname: blob.pathname,
          url: blob.url,
        });
      }
      setUploadPct(null);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, attachments }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data.error === "string" ? data.error : "We could not send your note. Please try again."
        );
      }
      track("Brief sent", {
        source: lead?.source ?? "site",
        from: lead?.from ?? null,
        attachments: attachments.length,
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not send your note. Please try again, or write to info@oaki.studio."
      );
    } finally {
      setSubmitting(false);
      setUploadPct(null);
    }
  };

  if (submitted) {
    return <Received heading={thankYouHeading}>{successMessage}</Received>;
  }

  const errorBorder = (f: Field) => (fieldErrors[f] ? { borderColor: "var(--color-error)" } : undefined);
  // The sentence's inputs have no visible labels, so their errors share
  // one line under it.
  const sentenceError = fieldErrors.name ?? fieldErrors.email;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* The origin, as the hidden fields a plain form would carry. */}
      {lead?.source && <input type="hidden" name="source" value={lead.source} />}
      {lead?.from && <input type="hidden" name="from" value={lead.from} />}
      <div
        className="font-light text-ink tracking-[-0.012em]"
        style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", lineHeight: 1.7 }}
      >
        <span>Hello, I&rsquo;m </span>
        <input
          id="name"
          name="name"
          aria-label="Name"
          autoComplete="name"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="your name"
          aria-invalid={fieldErrors.name ? true : undefined}
          aria-describedby={sentenceError ? "sentence-error" : undefined}
          className={`${letterInput} sm:w-[11ch]`}
          style={errorBorder("name")}
        />
        <span>, you can reach me at </span>
        <input
          id="email"
          name="email"
          type="email"
          aria-label="Email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="email"
          aria-invalid={fieldErrors.email ? true : undefined}
          aria-describedby={sentenceError ? "sentence-error" : undefined}
          className={`${letterInput} sm:w-[14ch]`}
          style={errorBorder("email")}
        />
        <span>. Here&rsquo;s what we&rsquo;re building:</span>
      </div>
      <div className="mt-2">
        <FieldError id="sentence-error" message={sentenceError} />
      </div>

      <textarea
        id="message"
        name="message"
        aria-label={messagePrompt}
        value={form.message}
        onChange={(e) => set("message", e.target.value)}
        rows={5}
        required
        aria-invalid={fieldErrors.message ? true : undefined}
        aria-describedby={fieldErrors.message ? "message-error" : undefined}
        className={`${letterInput} mt-5 block resize-none text-[22px] leading-[1.5]`}
        style={errorBorder("message")}
        placeholder="Tell us what you are building…"
      />
      {/* Counter and error share one line: error left, count right. The
          count turns to the error color once the cap is passed. */}
      <div className="flex items-baseline justify-between gap-6 mt-2">
        <FieldError id="message-error" message={fieldErrors.message} />
        <p
          className="coord ml-auto tabular-nums"
          aria-live="polite"
          style={{
            letterSpacing: "0.08em",
            color: form.message.length > MESSAGE_MAX ? "var(--color-error)" : "var(--color-muted)",
          }}
        >
          {form.message.length.toLocaleString("en-US")} / {MESSAGE_MAX.toLocaleString("en-US")}
        </p>
      </div>

      {/* The quiet second tier. */}
      <div className="grid gap-8 mt-10" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div>
          <label htmlFor="website" className={tierLabel} style={{ fontSize: 10, color: "var(--color-muted)" }}>
            A link, if you have one
          </label>
          <input
            id="website"
            name="website"
            type="url"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            placeholder="https://"
            aria-invalid={fieldErrors.website ? true : undefined}
            aria-describedby={fieldErrors.website ? "website-error" : undefined}
            className={tierInput}
            style={errorBorder("website") ?? { borderColor: HAIRLINE }}
          />
          <div className="mt-2">
            <FieldError id="website-error" message={fieldErrors.website} />
          </div>
        </div>

        <div>
          <label htmlFor="files" className={tierLabel} style={{ fontSize: 10, color: "var(--color-muted)" }}>
            Attach files, if it helps
          </label>
          <input
            ref={fileInputRef}
            id="files"
            name="files"
            type="file"
            multiple
            accept={ATTACHMENT_ACCEPT}
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            aria-describedby={fieldErrors.files ? "files-error" : "files-hint"}
            className={`w-full flex justify-between gap-3 border-b pb-2 text-left text-[16px] text-ink ${MOTION} ${FOCUS}`}
            style={{
              borderColor: fieldErrors.files ? "var(--color-error)" : dragging ? "var(--color-ink)" : HAIRLINE,
              background: dragging ? "var(--color-gris)" : "transparent",
            }}
          >
            <span>{dragging ? "Drop to add" : "Drop files here, or click to choose"}</span>
            <span aria-hidden className="text-warm-deep">+</span>
          </button>
          <p id="files-hint" className="text-[12px] text-muted mt-2">
            Up to {ATTACHMENT_MAX_FILES} files, {ATTACHMENT_MAX_TOTAL_BYTES / 1024 / 1024} MB in total. PDF,
            images, ZIP.
          </p>
          {files.length > 0 && (
            <ul className="mt-3">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${f.size}`}
                  className="flex items-baseline justify-between gap-4 py-2 border-b"
                  style={{ borderColor: HAIRLINE }}
                >
                  <span className="text-[13px] text-ink truncate">{f.name}</span>
                  <span className="flex items-baseline gap-3 shrink-0">
                    <span className="text-[12px] text-muted tabular-nums">
                      {f.size >= 1024 * 1024
                        ? `${(f.size / 1024 / 1024).toFixed(1)} MB`
                        : `${Math.max(1, Math.round(f.size / 1024))} KB`}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      aria-label={`Remove ${f.name}`}
                      className={`text-[12px] text-muted hover:text-ink ${MOTION} ${FOCUS}`}
                    >
                      Remove
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2">
            <FieldError id="files-error" message={fieldErrors.files} />
          </div>
        </div>
      </div>

      {/* Submit-level error (network, server) */}
      {error && (
        <p role="alert" className="text-meta mt-8" style={{ color: "var(--color-error)" }}>
          {error}
        </p>
      )}

      {/* Submit: the claim itself is the button. */}
      <div className="mt-12 flex items-center gap-6 flex-wrap">
        <button
          type="submit"
          disabled={submitting}
          className={`text-volume flex items-baseline gap-3.5 text-ink hover:text-warm-deep disabled:opacity-60 ${MOTION} ${FOCUS}`}
          style={{ fontSize: 40, lineHeight: 0.9 }}
        >
          {uploadPct !== null ? `Uploading ${uploadPct}%` : submitting ? submittingLabel : "Send it"}
          <span aria-hidden className="text-warm">→</span>
        </button>
        <span className="text-[14px] text-muted">
          or write to{" "}
          <a href="mailto:info@oaki.studio" className={`text-ink border-b border-ink ${FOCUS}`}>
            info@oaki.studio
          </a>
        </span>
      </div>
    </form>
  );
}
