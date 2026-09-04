"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { type ContactPageData } from "@/lib/data";
import {
  contactSchema,
  MESSAGE_MAX,
  ATTACHMENT_ACCEPT,
  ATTACHMENT_MAX_FILES,
  ATTACHMENT_MAX_TOTAL_BYTES,
  attachmentsError,
} from "@/lib/contact-schema";
import Button from "@/components/global/Button";

// One step, no wizard. The page copy promises "you don't need the brief
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
}

type Field = "name" | "email" | "website" | "message" | "files";
type FieldErrors = Partial<Record<Field, string>>;

const inputBase =
  "w-full border-b bg-transparent py-3 text-body text-ink focus:outline-none focus:border-ink transition-colors duration-200 placeholder:text-muted";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-meta" style={{ color: "var(--color-error)" }}>
      {message}
    </p>
  );
}

function TextInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}) {
  const errorId = `${name}-error`;
  return (
    <div>
      <label htmlFor={name} className="text-label text-muted block mb-2">
        {label}
        {required && <span className="text-warm-deep ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={inputBase}
        style={error ? { borderColor: "var(--color-error)" } : undefined}
      />
      <div className="mt-2">
        <FieldError id={errorId} message={error} />
      </div>
    </div>
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

export default function ContactForm({ config }: ContactFormProps = {}) {
  const submitLabel = config?.submitLabel ?? "Send";
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
      const body = new FormData();
      for (const [k, v] of Object.entries(payload)) body.append(k, v);
      for (const f of files) body.append("files", f, f.name);
      const res = await fetch("/api/contact", { method: "POST", body });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data.error === "string" ? data.error : "We could not send your note. Please try again."
        );
      }
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not send your note. Please try again, or write to info@oaki.studio."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-20 max-w-md">
        <Image
          src="/brand/oaki-isotipo.png"
          alt=""
          aria-hidden={true}
          width={48}
          height={48}
          className="mb-10 opacity-30"
        />
        <p className="text-quote mb-6">{thankYouHeading}</p>
        <p className="text-editorial text-muted">{successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        <TextInput
          label="Name"
          name="name"
          value={form.name}
          onChange={(v) => set("name", v)}
          required
          error={fieldErrors.name}
        />
        <TextInput
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(v) => set("email", v)}
          required
          error={fieldErrors.email}
        />
      </div>

      <div className="mb-12">
        <label htmlFor="message" className="text-label text-muted block mb-2">
          {messagePrompt}
          <span className="text-warm-deep ml-1">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          rows={8}
          required
          aria-invalid={fieldErrors.message ? true : undefined}
          aria-describedby={fieldErrors.message ? "message-error" : undefined}
          className={`${inputBase} resize-none`}
          style={fieldErrors.message ? { borderColor: "var(--color-error)" } : undefined}
          placeholder="Tell us what you are building…"
        />
        {/* Counter and error share one line: error left, count right. The
            count turns to the error color once the cap is passed. */}
        <div className="flex items-baseline justify-between gap-6 mt-2">
          <FieldError id="message-error" message={fieldErrors.message} />
          <p
            className="text-meta ml-auto tabular-nums"
            aria-live="polite"
            style={{
              color:
                form.message.length > MESSAGE_MAX ? "var(--color-error)" : "var(--color-muted)",
            }}
          >
            {form.message.length.toLocaleString("en-US")} / {MESSAGE_MAX.toLocaleString("en-US")}
          </p>
        </div>
      </div>

      <TextInput
        label="A link, if you have one (plans, references, a folder)"
        name="website"
        type="url"
        value={form.website}
        onChange={(v) => set("website", v)}
        placeholder="https://"
        error={fieldErrors.website}
      />

      {/* Attachments, optional. A quiet drop zone in the form's own
          hairline language; the list below it is the only feedback. */}
      <div className="mt-12">
        <label htmlFor="files" className="text-label text-muted block mb-2">
          Attach files, if it helps (plans, references, a PDF)
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
          className="w-full text-left py-5 px-5 border transition-colors duration-200 focus:outline-none focus:border-ink"
          style={{
            borderStyle: "dashed",
            borderColor: fieldErrors.files
              ? "var(--color-error)"
              : dragging
              ? "var(--color-ink)"
              : "var(--color-line)",
            background: dragging ? "var(--color-gris)" : "transparent",
          }}
        >
          <span className="text-body text-ink block">
            {dragging ? "Drop to add" : "Drop files here, or click to choose"}
          </span>
          <span id="files-hint" className="text-meta text-muted block mt-1">
            Up to {ATTACHMENT_MAX_FILES} files, {ATTACHMENT_MAX_TOTAL_BYTES / 1024 / 1024} MB in
            total. PDF, images, ZIP.
          </span>
        </button>
        {files.length > 0 && (
          <ul className="mt-3 divide-y divide-line border-b border-line">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${f.size}`}
                className="flex items-baseline justify-between gap-6 py-2"
              >
                <span className="text-meta text-ink truncate">{f.name}</span>
                <span className="flex items-baseline gap-4 shrink-0">
                  <span className="text-meta text-muted tabular-nums">
                    {f.size >= 1024 * 1024
                      ? `${(f.size / 1024 / 1024).toFixed(1)} MB`
                      : `${Math.max(1, Math.round(f.size / 1024))} KB`}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    aria-label={`Remove ${f.name}`}
                    className="text-meta text-muted hover:text-ink transition-colors duration-200"
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

      {/* Submit-level error (network, server) */}
      {error && (
        <p role="alert" className="text-meta mt-8" style={{ color: "var(--color-error)" }}>
          {error}
        </p>
      )}

      {/* Submit */}
      <div className="flex items-center justify-end mt-16 pt-8 border-t border-line">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
