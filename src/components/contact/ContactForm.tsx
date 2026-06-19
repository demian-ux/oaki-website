"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { type ContactFormData } from "@/lib/contact-schema";
import { type ContactPageData } from "@/lib/data";
import SectionLabel from "@/components/global/SectionLabel";
import Button from "@/components/global/Button";
import DurationSlider from "./DurationSlider";

const TOTAL_STEPS = 6;

type FormState = Partial<ContactFormData> & {
  servicesNeeded: string[];
  mainGoal: string[];
  startWeeks: number;
  endWeeks: number;
};

interface ContactFormProps {
  config?: ContactPageData;
}

const SERVICES = [
  "Still images",
  "Film / animation",
  "Narrative direction",
  "Competition visuals",
  "Marketing package",
  "Design exploration",
  "Not sure yet",
];

const GOALS = [
  "Sell the project",
  "Get approval",
  "Win a competition",
  "Align stakeholders",
  "Shape the design",
  "Launch a campaign",
];

const PROJECT_TYPES = [
  "Residential",
  "Hospitality",
  "Education",
  "Cultural",
  "Commercial",
  "Competition",
  "Interior",
  "Mixed-use",
];

const PROJECT_STAGES = [
  "Concept",
  "Schematic Design",
  "Design Development",
  "Construction Documents",
  "Under Construction",
];

const BUDGETS = [
  "Under $5,000",
  "$5,000 – $15,000",
  "$15,000 – $30,000",
  "$30,000 – $60,000",
  "$60,000+",
  "To be discussed",
];

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

function CheckGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    onChange(
      selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]
    );
  };

  return (
    <div>
      <SectionLabel className="mb-4">{label}</SectionLabel>
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`pill ${selected.includes(opt) ? "selected" : ""}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function SelectInput({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label htmlFor={name} className="text-label text-muted block mb-2">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-line bg-transparent py-3 text-body text-ink focus:outline-none focus:border-ink transition-colors duration-200 appearance-none cursor-pointer"
      >
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

const defaultStepTitles = [
  "Who are you?",
  "What are you building?",
  "What do you need?",
  "What should the work achieve?",
  "Timeline and scope",
  "Tell us the story.",
];

export default function ContactForm({ config }: ContactFormProps = {}) {
  // Resolve all editable strings — Sanity → fallbacks
  const stepTitles =
    config?.stepTitles && config.stepTitles.length === 6
      ? config.stepTitles
      : defaultStepTitles;
  const servicesOpts = config?.services && config.services.length > 0 ? config.services : SERVICES;
  const goalsOpts = config?.goals && config.goals.length > 0 ? config.goals : GOALS;
  const projectTypesOpts =
    config?.projectTypeOptions && config.projectTypeOptions.length > 0
      ? config.projectTypeOptions
      : PROJECT_TYPES;
  const projectStagesOpts =
    config?.projectStageOptions && config.projectStageOptions.length > 0
      ? config.projectStageOptions
      : PROJECT_STAGES;
  const budgetOpts =
    config?.budgetOptions && config.budgetOptions.length > 0
      ? config.budgetOptions
      : BUDGETS;
  const continueLabel = config?.continueLabel ?? "Continue →";
  const backLabel = config?.backLabel ?? "← Back";
  const submitLabel = config?.submitLabel ?? "Begin the conversation";
  const submittingLabel = config?.submittingLabel ?? "Sending…";
  const messagePrompt =
    config?.messagePrompt ??
    "Share the project, the ambition, and what the images need to achieve.";
  const thankYouHeading =
    config?.thankYouHeading ?? "Thank you. We received your note.";
  const successMessage =
    config?.successMessage ?? "We will read it with care and get back to you soon.";

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    company: "",
    role: "",
    website: "",
    projectName: "",
    projectLocation: "",
    projectType: "",
    projectStage: "",
    servicesNeeded: [],
    mainGoal: [],
    timeline: "",
    estimatedImages: "",
    videoNeeds: "",
    budgetRange: "",
    message: "",
    startWeeks: 4,
    endWeeks: 12,
  });

  // Keep the human-readable timeline string in sync with the slider window.
  useEffect(() => {
    const d = (w: number) => {
      const x = new Date();
      x.setDate(x.getDate() + w * 7);
      return x.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };
    const dur = (form.endWeeks ?? 12) - (form.startWeeks ?? 4);
    setForm((p) => ({
      ...p,
      timeline: `${dur} weeks (${d(form.startWeeks ?? 4)} → ${d(form.endWeeks ?? 12)})`,
    }));
  }, [form.startWeeks, form.endWeeks]);

  const set = (field: keyof FormState, value: string | string[] | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

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
      {/* Progress */}
      <div className="flex gap-1 mb-14">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className="h-px flex-1 transition-colors duration-300"
            style={{
              background: i < step ? "var(--color-ink)" : "var(--color-line)",
            }}
          />
        ))}
      </div>

      <SectionLabel className="mb-2">
        Step {step} of {TOTAL_STEPS}
      </SectionLabel>
      <h2 className="text-title mb-12">{stepTitles[step - 1]}</h2>

      {/* Steps */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <TextInput label="Name" name="name" value={form.name ?? ""} onChange={(v) => set("name", v)} required />
          <TextInput label="Email" name="email" type="email" value={form.email ?? ""} onChange={(v) => set("email", v)} required />
          <TextInput label="Company" name="company" value={form.company ?? ""} onChange={(v) => set("company", v)} />
          <TextInput label="Role" name="role" value={form.role ?? ""} onChange={(v) => set("role", v)} />
          <TextInput label="Website" name="website" type="url" value={form.website ?? ""} onChange={(v) => set("website", v)} placeholder="https://" />
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <TextInput label="Project Name" name="projectName" value={form.projectName ?? ""} onChange={(v) => set("projectName", v)} required />
          <TextInput label="Project Location" name="projectLocation" value={form.projectLocation ?? ""} onChange={(v) => set("projectLocation", v)} />
          <SelectInput label="Project Type" name="projectType" value={form.projectType ?? ""} onChange={(v) => set("projectType", v)} options={projectTypesOpts} />
          <SelectInput label="Project Stage" name="projectStage" value={form.projectStage ?? ""} onChange={(v) => set("projectStage", v)} options={projectStagesOpts} />
        </div>
      )}

      {step === 3 && (
        <CheckGroup
          label="Select what you need"
          options={servicesOpts}
          selected={form.servicesNeeded}
          onChange={(v) => set("servicesNeeded", v)}
        />
      )}

      {step === 4 && (
        <CheckGroup
          label="Select what this work should achieve"
          options={goalsOpts}
          selected={form.mainGoal}
          onChange={(v) => set("mainGoal", v)}
        />
      )}

      {step === 5 && (
        <div className="flex flex-col gap-16">
          <DurationSlider
            startWeeks={form.startWeeks}
            endWeeks={form.endWeeks}
            onChange={({ startWeeks, endWeeks }) =>
              setForm((p) => ({ ...p, startWeeks, endWeeks }))
            }
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <TextInput label="Estimated number of images" name="estimatedImages" value={form.estimatedImages ?? ""} onChange={(v) => set("estimatedImages", v)} placeholder="e.g. 12 stills" />
            <TextInput label="Video needs" name="videoNeeds" value={form.videoNeeds ?? ""} onChange={(v) => set("videoNeeds", v)} placeholder="e.g. 60s walkthrough" />
            <SelectInput label="Budget range" name="budgetRange" value={form.budgetRange ?? ""} onChange={(v) => set("budgetRange", v)} options={budgetOpts} />
          </div>
        </div>
      )}

      {step === 6 && (
        <div>
          <label htmlFor="message" className="text-label text-muted block mb-2">
            {messagePrompt}
            <span className="text-warm-deep ml-1">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={form.message ?? ""}
            onChange={(e) => set("message", e.target.value)}
            rows={8}
            required
            className="w-full border-b border-line bg-transparent py-3 text-body text-ink focus:outline-none focus:border-ink transition-colors duration-200 resize-none placeholder:text-muted"
            placeholder="Tell us what you are building…"
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-meta mt-4" style={{ color: "var(--color-error)" }}>
          {error}
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-16 pt-8 border-t border-line">
        {step > 1 ? (
          <button
            type="button"
            onClick={back}
            className="text-label text-muted hover:text-ink transition-colors duration-200"
          >
            {backLabel}
          </button>
        ) : (
          <span />
        )}

        {step < TOTAL_STEPS ? (
          <Button type="button" onClick={next} variant="primary">
            {continueLabel}
          </Button>
        ) : (
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? submittingLabel : submitLabel}
          </Button>
        )}
      </div>
    </form>
  );
}
