import { useState, useRef } from "react";
import { C, FONT_DISPLAY, FONT_BODY, EASE_OUT } from "@/lib/carecalTheme";
import CareCalGlassStyles from "@/components/CareCalGlassStyles";
import SimpleAuthGuard from "@/components/SimpleAuthGuard";
import {
  StepTitle,
  Field,
  PrimaryButton,
  AmbientGlow,
  ProgressSteps,
} from "@/components/CareCalUI";
import {
  DoctorEditor,
  PlanCard,
  labelDeHora,
  nuevoDoctor,
  type DoctorForm,
} from "@/components/DoctorEditor";

// Base URL de Render
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://carecal-u2gu.onrender.com";

// Tipos requeridos para la integración con FastAPI
export type SchedulePayload = {
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_slot: number;
};

export type DoctorPayload = {
  doctor_id: string;
  nombre_doctor: string;
  procedimientos: string;
  schedules: SchedulePayload[];
};

export type NewClinicPayload = {
  slug: string;
  nombre_clinica: string;
  plan: "single" | "multi";
  telefono_contacto: string;
  email_contacto?: string;
  doctors: DoctorPayload[];
};

export type CreateClinicResult = { success: boolean; error?: string };

// Helper de slugify
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Petición HTTP al backend para chequear la disponibilidad del Slug
async function checkSlugAvailable(slug: string): Promise<boolean> {
  if (!slug || slug.length < 3) return false;
  try {
    const res = await fetch(`${API_BASE}/clinics/check-slug?slug=${encodeURIComponent(slug)}`);
    if (!res.ok) return false;
    const data = (await res.json()) as { available: boolean };
    return data.available;
  } catch (error) {
    console.error("Error validando el slug con Render:", error);
    return false;
  }
}

// Petición HTTP al backend para registrar la clínica en Neon
async function createClinic(payload: NewClinicPayload): Promise<CreateClinicResult> {
  try {
    const res = await fetch(`${API_BASE}/clinics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 409) {
      return { success: false, error: "slug_taken" };
    }
    if (!res.ok) {
      return { success: false, error: "Failed to create clinic" };
    }
    return { success: true };
  } catch (err) {
    console.error("Error enviando el registro a FastAPI:", err);
    return { success: false, error: "Failed to create clinic" };
  }
}

const WHATSAPP_NUMBER = "584226337515";
const STEPS = ["Practice", "Plan", "Providers", "Review"];

function validPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 10;
}

function validEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());
}

function CreateWizard() {
  const [step, setStep] = useState(0);
  const [nombreClinica, setNombreClinica] = useState("");
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "ok" | "taken">("idle");
  const [plan, setPlan] = useState<"single" | "multi" | null>(null);
  const [telefonoContacto, setTelefonoContacto] = useState("");
  const [telTouched, setTelTouched] = useState(false);
  const [emailContacto, setEmailContacto] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [doctores, setDoctores] = useState<DoctorForm[]>([nuevoDoctor("doc1")]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const slugRequestId = useRef(0);
  const slugDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleNombreChange(nombre: string) {
    setNombreClinica(nombre);
    const s = slugify(nombre);
    setSlug(s);

    if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);

    if (s.length < 3) {
      setSlugStatus("idle");
      return;
    }

    setSlugStatus("checking");
    const myId = ++slugRequestId.current;

    slugDebounceRef.current = setTimeout(async () => {
      const available = await checkSlugAvailable(s);
      if (myId !== slugRequestId.current) return;
      setSlugStatus(available ? "ok" : "taken");
    }, 450);
  }

  const telOk = telefonoContacto.length > 0 && validPhone(telefonoContacto);
  const emailOk = emailContacto.length > 0 && validEmail(emailContacto);

  function handlePlanSelect(p: "single" | "multi") {
    setPlan(p);
    const n = p === "single" ? 1 : 2;
    setDoctores(Array.from({ length: n }, (_, i) => nuevoDoctor(`doc${i + 1}`)));
  }

  function addDoctor() {
    setDoctores([...doctores, nuevoDoctor(`doc${doctores.length + 1}`)]);
  }

  function updateDoctorNombre(index: number, value: string) {
    const copy = [...doctores];
    copy[index].nombre_doctor = value;
    setDoctores(copy);
  }

  function updateDuracion(index: number, value: number) {
    const copy = [...doctores];
    copy[index].duracionCita = value;
    setDoctores(copy);
  }

  function addProcedimiento(index: number, label: string, price: string) {
    if (!label.trim()) return;
    const copy = [...doctores];
    copy[index].procedimientos.push({
      id: `${Date.now()}-${Math.random()}`,
      label: label.trim(),
      price: price.trim() || undefined,
    });
    setDoctores(copy);
  }

  function removeProcedimiento(docIndex: number, procId: string) {
    const copy = [...doctores];
    copy[docIndex].procedimientos = copy[docIndex].procedimientos.filter(
      (p) => p.id !== procId
    );
    setDoctores(copy);
  }

  function toggleDia(docIndex: number, diaIndex: number) {
    const copy = [...doctores];
    copy[docIndex].dias[diaIndex].enabled = !copy[docIndex].dias[diaIndex].enabled;
    setDoctores(copy);
  }

  function updateDiaHora(
    docIndex: number,
    diaIndex: number,
    field: "inicio" | "fin",
    value: string
  ) {
    const copy = [...doctores];
    copy[docIndex].dias[diaIndex][field] = value;
    setDoctores(copy);
  }

  function copiarATodos(docIndex: number, diaIndex: number) {
    const copy = [...doctores];
    const fuente = copy[docIndex].dias[diaIndex];
    copy[docIndex].dias = copy[docIndex].dias.map((d) =>
      d.enabled ? { ...d, inicio: fuente.inicio, fin: fuente.fin } : d
    );
    setDoctores(copy);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);

    const payload: NewClinicPayload = {
      slug,
      nombre_clinica: nombreClinica,
      plan: plan!,
      telefono_contacto: telefonoContacto,
      email_contacto: emailContacto,
      doctors: doctores.map((d) => ({
        doctor_id: d.doctor_id,
        nombre_doctor: d.nombre_doctor,
        procedimientos: d.procedimientos
          .map((p) => `${p.label}|${p.price || ""}`)
          .join(","),
        schedules: d.dias
          .filter((day) => day.enabled)
          .map((day) => ({
            dia_semana: day.day,
            hora_inicio: day.inicio,
            hora_fin: day.fin,
            duracion_slot: d.duracionCita,
          })),
      })),
    };

    const result = await createClinic(payload);
    setSubmitting(false);

    if (!result.success) {
      setSubmitError(
        result.error === "slug_taken"
          ? "That booking link is already in use. Please choose a different practice name."
          : "We couldn't save your practice. Please try again or contact us on WhatsApp."
      );
      return;
    }

    setSubmitted(true);
  }

  function whatsappLink() {
    const precio = plan === "multi" ? "35" : "20";
    const doctoresTxt = doctores
      .map((d) => d.nombre_doctor || "(unnamed)")
      .join(", ");
    const lineas = [
      "Hi! I'd like to activate my CareCal booking page.",
      "",
      `Practice: ${nombreClinica}`,
      `Link: carecal.com/${slug}`,
      `Plan: ${plan === "multi" ? "Multi-provider" : "Single provider"} ($${precio}/mo)`,
      `Providers: ${doctoresTxt}`,
    ];
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lineas.join("\n"))}`;
  }

  const shellStyle = {
    background: `radial-gradient(1200px 600px at 50% -10%, ${C.bgSecondary}, ${C.bgPrimary} 60%)`,
    fontFamily: FONT_BODY,
    color: C.textPrimary,
  };

  if (submitted) {
    return (
      <div
        className="relative min-h-screen w-full overflow-hidden flex items-center justify-center py-12"
        style={shellStyle}
      >
        <CareCalGlassStyles />
        <AmbientGlow />
        <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-6 text-center">
          <div
            className="liquid-glass-circle liquid-glass-active grid h-24 w-24 place-items-center"
            style={{ animation: `carecalPop 500ms ${EASE_OUT}` }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12.5l5 5L20 6"
                stroke="#10B981"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1
            className="mt-8 text-3xl sm:text-4xl"
            style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, color: C.textPrimary }}
          >
            Almost there!
          </h1>
          <p
            className="mt-4 text-base"
            style={{ color: C.textSecondary, lineHeight: 1.7 }}
          >
            Your booking page will live at{" "}
            <strong style={{ color: C.accent }}>carecal.com/{slug}</strong>.
            <br />
            Message us on WhatsApp to activate billing and go live.
          </p>
          
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="carecal-shine mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold"
            style={{ backgroundColor: "#25D366", color: "#FFFFFF", fontFamily: FONT_DISPLAY }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.05-1.35A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.6 0-3.1-.44-4.38-1.2l-.31-.19-3.02.81.8-2.95-.2-.31A7.94 7.94 0 014 12c0-4.42 3.58-8 8-8s8 3.58 8 8-3.58 8-8 8zm4.4-5.99c-.24-.12-1.43-.7-1.65-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42-.14-.01-.3-.01-.46-.01-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.46-.28z" />
            </svg>
            Message on WhatsApp
          </a>

          <a
            href={`/${slug}`}
            className="mt-4 text-sm underline"
            style={{ color: C.textSecondary }}
          >
            Preview my booking page 
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full overflow-y-auto flex items-center justify-center py-10 px-4"
      style={shellStyle}
    >
      <CareCalGlassStyles />
      <AmbientGlow />

      <div className="relative z-10 w-full max-w-md my-auto flex flex-col items-stretch">
        <div className="mb-6 text-center">
          <p
            className="text-[10px] uppercase"
            style={{
              letterSpacing: "0.5em",
              color: C.accentDark,
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
            }}
          >
            CareCal
          </p>
          <h1
            className="mt-2 text-2xl sm:text-4xl"
            style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, color: C.textPrimary }}
          >
            Set up your medical booking page
          </h1>
        </div>

        <ProgressSteps labels={STEPS} currentStep={step} />

        <div className="carecal-glass rounded-2xl p-5 sm:p-8 w-full box-border">
          {step === 0 && (
            <div style={{ animation: `carecalPopIn 300ms ${EASE_OUT} both` }}>
              <StepTitle
                title="Your practice"
                subtitle="This name becomes your public booking link"
              />
              <div className="mt-6 flex flex-col gap-5">
                <Field label="Practice name" error={null}>
                  <input
                    value={nombreClinica}
                    onChange={(e) => handleNombreChange(e.target.value)}
                    placeholder="e.g. Riverside Medical Group"
                    className="mt-2 w-full bg-transparent pb-2 text-lg outline-none"
                    style={{
                      borderBottom: `1.5px solid ${C.border}`,
                      color: C.textPrimary,
                    }}
                  />
                </Field>
                {slug && (
                  <p className="text-sm" style={{ color: C.textSecondary }}>
                    Your link:{" "}
                    <strong style={{ color: C.accent }}>
                      carecal.com/{slug}
                    </strong>{" "}
                    {slugStatus === "checking" && (
                      <span style={{ color: C.textMuted }}>checking…</span>
                    )}
                    {slugStatus === "ok" && (
                      <span style={{ color: C.success }}> available</span>
                    )}
                    {slugStatus === "taken" && (
                      <span style={{ color: C.error }}> already taken</span>
                    )}
                  </p>
                )}
                <Field
                  label="Contact phone"
                  error={
                    telTouched && !telOk
                      ? "Enter a valid phone number (at least 10 digits)"
                      : null
                  }
                >
                  <input
                    value={telefonoContacto}
                    onChange={(e) => setTelefonoContacto(e.target.value)}
                    onBlur={() => setTelTouched(true)}
                    placeholder="+1 (555) 000-0000"
                    className="mt-2 w-full bg-transparent pb-2 text-lg outline-none"
                    style={{
                      borderBottom: `1.5px solid ${telTouched && !telOk ? C.error : C.border}`,
                      color: C.textPrimary,
                    }}
                  />
                </Field>
                <Field
                  label="Practice email"
                  error={
                    emailTouched && !emailOk ? "Enter a valid email address" : null
                  }
                >
                  <input
                    type="email"
                    value={emailContacto}
                    onChange={(e) => setEmailContacto(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="frontdesk@practice.com"
                    className="mt-2 w-full bg-transparent pb-2 text-lg outline-none"
                    style={{
                      borderBottom: `1.5px solid ${emailTouched && !emailOk ? C.error : C.border}`,
                      color: C.textPrimary,
                    }}
                  />
                </Field>
              </div>
              <div className="mt-8">
                <PrimaryButton
                  onClick={() => {
                    setTelTouched(true);
                    setEmailTouched(true);
                    if (slugStatus === "ok" && telOk && emailOk) setStep(1);
                  }}
                  disabled={slugStatus !== "ok" || !telOk || !emailOk}
                >
                  Continue
                </PrimaryButton>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ animation: `carecalSlideLeft 280ms ${EASE_OUT} both` }}>
              <StepTitle
                title="Plan"
                subtitle="How many providers will use this calendar?"
              />
              <div className="mt-6 flex flex-col gap-4">
                <PlanCard
                  active={plan === "single"}
                  onClick={() => handlePlanSelect("single")}
                  title="Single provider"
                  price="$20"
                  desc="Ideal for solo practitioners and small clinics"
                  icon={
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  }
                />
                <PlanCard
                  active={plan === "multi"}
                  onClick={() => handlePlanSelect("multi")}
                  title="Multiple providers"
                  price="$35"
                  desc="For group practices with two or more clinicians"
                  icon={
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="8.5" cy="8" r="3.5" />
                      <circle cx="16" cy="9" r="3" />
                      <path d="M2.5 21c0-3.5 2.9-6 6-6s6 2.5 6 6" />
                      <path d="M14.5 15.2c2.6.3 4.5 2.5 4.5 5.3" />
                    </svg>
                  }
                />
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <PrimaryButton onClick={() => setStep(2)} disabled={!plan}>
                  Continue
                </PrimaryButton>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="w-full rounded-xl py-3 text-sm"
                  style={{ color: C.textMuted, fontStyle: "italic" }}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: `carecalSlideLeft 280ms ${EASE_OUT} both` }}>
              <StepTitle
                title="Providers"
                subtitle="Add names, services, and weekly availability"
              />
              <div className="mt-6 flex flex-col gap-6 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
                {doctores.map((doc, i) => (
                  <DoctorEditor
                    key={doc.doctor_id}
                    doc={doc}
                    index={i}
                    onNombreChange={(v) => updateDoctorNombre(i, v)}
                    onDuracionChange={(v) => updateDuracion(i, v)}
                    onAddProcedimiento={(label, price) =>
                      addProcedimiento(i, label, price)
                    }
                    onRemoveProcedimiento={(id) => removeProcedimiento(i, id)}
                    onToggleDia={(di) => toggleDia(i, di)}
                    onUpdateDiaHora={(di, field, value) =>
                      updateDiaHora(i, di, field, value)
                    }
                    onCopiarATodos={(di) => copiarATodos(i, di)}
                  />
                ))}
                {plan === "multi" && (
                  <button
                    type="button"
                    onClick={addDoctor}
                    className="text-sm self-start"
                    style={{ color: C.accent }}
                  >
                    + Add another provider
                  </button>
                )}
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <PrimaryButton onClick={() => setStep(3)} disabled={false}>
                  Continue
                </PrimaryButton>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full rounded-xl py-3 text-sm"
                  style={{ color: C.textMuted, fontStyle: "italic" }}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ animation: `carecalSlideLeft 280ms ${EASE_OUT} both` }}>
              <StepTitle title="Review" subtitle="Preview before you publish" />

              <div className="mt-6 flex flex-col gap-4">
                <div
                  className="rounded-xl p-4"
                  style={{
                    border: `1px solid ${C.border}`,
                    background: "rgba(16,185,129,0.04)",
                  }}
                >
                  <p
                    className="text-lg font-semibold"
                    style={{ fontFamily: FONT_DISPLAY, color: C.textPrimary }}
                  >
                    {nombreClinica}
                  </p>
                  <p className="text-sm mt-1" style={{ color: C.accent }}>
                    carecal.com/{slug}
                  </p>
                  <p className="text-xs mt-2" style={{ color: C.textMuted }}>
                    {plan === "multi" ? "Multi-provider" : "Single provider"} · $
                    {plan === "multi" ? "35" : "20"}/mo
                  </p>
                  <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                    {telefonoContacto} · {emailContacto}
                  </p>
                </div>

                {doctores.map((d) => {
                  const diasActivos = d.dias.filter((day) => day.enabled);
                  return (
                    <div
                      key={d.doctor_id}
                      className="rounded-xl p-4"
                      style={{ border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.5)" }}
                    >
                      <p
                        className="font-semibold"
                        style={{ fontFamily: FONT_DISPLAY, color: C.textPrimary }}
                      >
                        {d.nombre_doctor || "(unnamed)"}
                      </p>

                      {d.procedimientos.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {d.procedimientos.map((p) => (
                            <span
                              key={p.id}
                              className="rounded-full px-2.5 py-1 text-[11px]"
                              style={{
                                border: `1px solid ${C.border}`,
                                color: C.textSecondary,
                              }}
                            >
                              {p.label}
                              {p.price && (
                                <span style={{ color: C.accent }}> · ${p.price}</span>
                              )}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 space-y-1">
                        {diasActivos.length === 0 && (
                          <p className="text-xs italic" style={{ color: C.textMuted }}>
                            No schedule configured yet
                          </p>
                        )}
                        {diasActivos.map((day) => (
                          <p key={day.day} className="text-xs" style={{ color: C.textSecondary }}>
                            <span style={{ color: C.textMuted }}>{day.day}:</span>{" "}
                            {labelDeHora(day.inicio)} – {labelDeHora(day.fin)}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {submitError && (
                <p className="mt-4 text-center text-sm" style={{ color: C.error }}>
                  {submitError}
                </p>
              )}
              <div className="mt-8 flex flex-col gap-3">
                <PrimaryButton onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Saving…" : "Complete Setup"}
                </PrimaryButton>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full rounded-xl py-3 text-sm"
                  style={{ color: C.textMuted, fontStyle: "italic" }}
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <SimpleAuthGuard>
      <CreateWizard />
    </SimpleAuthGuard>
  );
}