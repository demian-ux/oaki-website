"use client";

import { useState } from "react";
import Image from "next/image";
import { type ContactPageData } from "@/lib/data";
import Button from "@/components/global/Button";

// One step, no wizard. The page copy promises "you don't need the brief
// finished. Send what you have" — so the form asks for exactly that: who you
// are, how to reach you, what you're building, and an optional link to
// whatever exists (plans, references, a folder). Every extra step is friction
// the copy promises not to have.

interface ContactFormProps {
  config?: ContactPageData;
}

const inputBase =
  "w-full border-b border-line bg-transparent py-3 text-body text-ink focus:outline-none focus:border-ink transition-colors duration-200 placeholder:text-muted";

function TextInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
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
        className={inputBase}
      />
    </div>
  );
}

export default function ContactForm({ config }: ContactFormProps = {}) {
  const submitLabel = config?.submitLabel ?? "Start a project";
  const submittingLabel = config?.submittingLabel ?? "Sending…";
  const messagePrompt =
    config?.messagePrompt ??
    "Share the project, the ambition, and what the images need to achieve.";
  const thankYouHeading =
    config?.thankYouHeading ?? "Thank you. We received your note.";
  const successMessage =
    config?.successMessage ?? "We will read it with care and get back to you soon.";

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    website: "",
    message: "",
  });

  const set = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Submission failed");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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
        <TextInput label="Name" name="name" value={form.name} onChange={(v) => set("name", v)} required />
        <TextInput label="Email" name="email" type="email" value={form.email} onChange={(v) => set("email", v)} required />
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
          className="w-full border-b border-line bg-transparent py-3 text-body text-ink focus:outline-none focus:border-ink transition-colors duration-200 resize-none placeholder:text-muted"
          placeholder="Tell us what you are building…"
        />
      </div>

      <TextInput
        label="A link, if you have one (plans, references, a folder)"
        name="website"
        type="url"
        value={form.website}
        onChange={(v) => set("website", v)}
        placeholder="https://"
      />

      {/* Error */}
      {error && (
        <p className="text-meta mt-4" style={{ color: "var(--color-error)" }}>
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
