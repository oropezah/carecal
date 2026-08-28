import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { C, FONT_DISPLAY, FONT_BODY, EASE_OUT } from "@/lib/carecalTheme";
import CareCalGlassStyles from "@/components/CareCalGlassStyles";
import {
  StepTitle,
  Field,
  PrimaryButton,
  NavRow,
  Spinner,
  AmbientGlow,
  ProgressSteps,
} from "@/components/CareCalUI";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://carecal-u2gu.onrender.com";

// --- TIPOS DE TU BACKEND ---
type SchedulePublic = {
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_slot: number | null;
};

type DoctorPublic = {
  doctor_id: string;
  nombre_doctor: string | null;
  procedimientos: string | null;
  schedules: SchedulePublic[];
};

type ClinicPublic = {
  slug: string;
  nombre_clinica: string | null;
  plan: string | null;
  status: string | null;
  telefono_contacto: string | null;
  doctors: DoctorPublic[];
};

type FetchState =
  | { status: "loading" }
  | { status: "not_found" }
  | { status: "error" }
  | { status: "ready"; clinic: ClinicPublic };

// --- MAPEOS DE FECHAS ---
const DIA_A_NUM: Record<string, number> = {
  domingo: 0, sunday: 0,
  lunes: 1, monday: 1,
  martes: 2, tuesday: 2,
  miércoles: 3, miercoles: 3, wednesday: 3,
  jueves: 4, thursday: 4,
  viernes: 5, friday: 5,
  sábado: 6, sabado: 6, saturday: 6,
};

const MESES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DIAS_CORTOS = ["S", "M", "T", "W", "T", "F", "S"];

function startOfDay(d: Date) {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function validPhone(p: string) {
  const digits = p.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function formatFechaLarga(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function nextAvailableDate(allowedDays: number[], from: Date): Date {
  const d = startOfDay(from);
  for (let i = 0; i < 30; i++) {
    if (allowedDays.includes(d.getDay())) return d;
    d.setDate(d.getDate() + 1);
  }
  return from;
}

function diaSemanaToNum(dia: unknown): number | undefined {
  if (typeof dia !== "string") return undefined;
  return DIA_A_NUM[dia.trim().toLowerCase().normalize("NFC")];
}

function formatHora12h(timeStr: string): string {
  const [hStr, mStr] = timeStr.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function generarSlotsMock(schedule: SchedulePublic | undefined): string[] {
  if (!schedule || !schedule.hora_inicio || !schedule.hora_fin) {
    return ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"];
  }

  const slots: string[] = [];
  const [hStart, mStart] = schedule.hora_inicio.split(":").map(Number);
  const [hEnd, mEnd] = schedule.hora_fin.split(":").map(Number);
  const duration = schedule.duracion_slot || 30;

  let currentMin = hStart * 60 + (mStart || 0);
  const endMin = hEnd * 60 + (mEnd || 0);

  while (currentMin + duration <= endMin) {
    const hh = Math.floor(currentMin / 60);
    const mm = currentMin % 60;
    const timeFormatted = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    slots.push(formatHora12h(timeFormatted));
    currentMin += duration;
  }

  return slots;
}

async function getClinic(slug: string): Promise<ClinicPublic | null> {
  const res = await fetch(`${API_BASE}/clinics/${encodeURIComponent(slug)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Status HTTP: ${res.status}`);
  return (await res.json()) as ClinicPublic;
}

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function ClinicPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    if (!router.isReady) return;
    if (typeof slug !== "string") return;

    let cancelled = false;
    setState({ status: "loading" });

    getClinic(slug)
      .then((clinic) => {
        if (cancelled) return;
        if (!clinic) {
          setState({ status: "not_found" });
        } else {
          setState({ status: "ready", clinic });
        }
      })
      .catch((err) => {
        console.error("Error cargando la clínica:", err);
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [router.isReady, slug]);

  const shellStyle = {
    background: `radial-gradient(1200px 600px at 50% -10%, ${C.bgSecondary}, ${C.bgPrimary} 60%)`,
    fontFamily: FONT_BODY,
    color: C.textPrimary,
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-y-auto flex items-center justify-center py-10 px-4"
      style={shellStyle}
    >
      <CareCalGlassStyles />
      <AmbientGlow />

      <div className="relative z-10 w-full max-w-md my-auto">
        {state.status === "loading" && (
          <div className="carecal-glass rounded-2xl p-8 text-center">
            <Spinner />
            <p className="mt-4" style={{ color: C.textSecondary }}>Loading…</p>
          </div>
        )}

        {state.status === "not_found" && (
          <div className="carecal-glass rounded-2xl p-8 text-center">
            <h1
              className="text-2xl"
              style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, color: C.textPrimary }}
            >
              Page not found
            </h1>
            <p className="mt-3 text-sm" style={{ color: C.textSecondary }}>
              There&apos;s no booking page at this link yet.
            </p>
          </div>
        )}

        {state.status === "error" && (
          <div className="carecal-glass rounded-2xl p-8 text-center">
            <h1
              className="text-2xl"
              style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, color: C.textPrimary }}
            >
              Something went wrong
            </h1>
            <p className="mt-3 text-sm" style={{ color: C.textSecondary }}>
              We couldn&apos;t load this page. Please try again in a moment.
            </p>
          </div>
        )}

        {state.status === "ready" && state.clinic.status === "pending" && (
          <div className="carecal-glass rounded-2xl p-8 text-center">
            <h1
              className="text-2xl sm:text-3xl"
              style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, color: C.textPrimary }}
            >
              {state.clinic.nombre_clinica}
            </h1>
            <p className="mt-4 text-sm" style={{ color: C.textSecondary, lineHeight: 1.7 }}>
              This booking page is being set up and isn&apos;t open for
              appointments yet. Please check back soon.
            </p>
          </div>
        )}

        {state.status === "ready" && state.clinic.status !== "pending" && (
          <BookingWizard clinic={state.clinic} />
        )}
      </div>
    </div>
  );
}

// --- WIZARD INTERACTIVO DE AGENDAMIENTO ---
function BookingWizard({ clinic }: { clinic: ClinicPublic }) {
  const [step, setStep] = useState(0);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [touchedNombre, setTouchedNombre] = useState(false);
  const [touchedTel, setTouchedTel] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState<DoctorPublic | null>(() => {
    return clinic.doctors && clinic.doctors.length === 1 ? clinic.doctors[0] : null;
  });
  const [procedimiento, setProcedimiento] = useState<string | null>(null);
  const [fecha, setFecha] = useState(() => startOfDay(new Date()));

  const [checkingAvail, setCheckingAvail] = useState(false);
  const [horarios, setHorarios] = useState<string[] | null>(null);
  const [horario, setHorario] = useState<string | null>(null);

  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const nombreOk = nombre.trim().length >= 2;
  const telOk = validPhone(telefono);
  const isMulti = (clinic.doctors?.length ?? 0) > 1;

  const diasPermitidos = useMemo(() => {
    if (!selectedDoctor || !Array.isArray(selectedDoctor.schedules)) return [1, 2, 3, 4, 5];
    const set = new Set<number>();
    selectedDoctor.schedules.forEach((s) => {
      const n = diaSemanaToNum(s?.dia_semana);
      if (n !== undefined) set.add(n);
    });
    return set.size ? Array.from(set) : [1, 2, 3, 4, 5];
  }, [selectedDoctor]);

  const procedimientosLista = useMemo(() => {
    if (!selectedDoctor?.procedimientos) return [];
    return selectedDoctor.procedimientos.split(",").filter(Boolean);
  }, [selectedDoctor]);

  const STEPS = isMulti
    ? ["Your info", "Provider", "Service", "Time"]
    : ["Your info", "Service", "Time"];
  const displayStep = isMulti ? step : step === 2 ? 1 : step === 3 ? 2 : step;

  function handleSelectFecha(d: Date) {
    setFecha(d);
    setHorario(null);
    if (!selectedDoctor) return;

    setCheckingAvail(true);
    setTimeout(() => {
      const dayNum = d.getDay();
      const sched = selectedDoctor.schedules?.find(
        (s) => diaSemanaToNum(s.dia_semana) === dayNum
      );
      const generatedSlots = generarSlotsMock(sched);
      setHorarios(generatedSlots);
      setCheckingAvail(false);
    }, 250);
  }

  const elegirDoctor = (doc: DoctorPublic) => {
    setSelectedDoctor(doc);
    setProcedimiento(null);
    const dias = Array.from(
      new Set(
        (doc.schedules || [])
          .map((s) => diaSemanaToNum(s?.dia_semana))
          .filter((n): n is number => n !== undefined)
      )
    );
    const nueva = nextAvailableDate(dias.length ? dias : [1, 2, 3, 4, 5], startOfDay(new Date()));
    setFecha(nueva);
    setStep(2);
  };

  const goNext = () => {
    setStep((s) => {
      const next = isMulti ? s + 1 : s === 0 ? 2 : s + 1;
      if (next === 3) handleSelectFecha(fecha);
      return next;
    });
  };

  const goBack = () => setStep((s) => (isMulti ? s - 1 : s === 2 ? 0 : s - 1));

  async function confirmar() {
    if (!selectedDoctor || !horario || !procedimiento) return;
    setConfirming(true);
    setConfirmError(null);

    try {
      // Simulación de respuesta inmediata o POST al backend
      await new Promise((r) => setTimeout(r, 600));
      setConfirming(false);
      setConfirmed(true);
    } catch {
      setConfirming(false);
      setConfirmError("Unable to confirm appointment. Please try again or reach us via WhatsApp.");
    }
  }

  if (confirmed) {
    return (
      <div className="carecal-glass rounded-2xl p-8 text-center">
        <div
          className="liquid-glass-circle liquid-glass-active mx-auto grid h-20 w-20 place-items-center"
          style={{ animation: `carecalPop 500ms ${EASE_OUT}` }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M4 12.5l5 5L20 6" stroke={C.accent} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="mt-6 text-3xl font-semibold" style={{ fontFamily: FONT_DISPLAY, color: C.textPrimary }}>
          Appointment Confirmed!
        </h1>
        <p className="mt-4 text-sm" style={{ color: C.textSecondary, lineHeight: 1.7 }}>
          See you {nombre.split(" ")[0]} on{" "}
          <strong style={{ color: C.accent }}>{formatFechaLarga(fecha)}</strong> at{" "}
          <strong style={{ color: C.accent }}>{horario}</strong> for your{" "}
          <strong style={{ color: C.accent }}>{procedimiento}</strong> with{" "}
          <strong style={{ color: C.accent }}>{selectedDoctor?.nombre_doctor}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <p
          className="text-[10px] uppercase"
          style={{ letterSpacing: "0.5em", color: C.accentDark, fontFamily: FONT_DISPLAY, fontWeight: 600 }}
        >
          CARECAL · BOOKING
        </p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold" style={{ fontFamily: FONT_DISPLAY, color: C.textPrimary }}>
          Book at {clinic.nombre_clinica}
        </h1>
      </div>

      <ProgressSteps labels={STEPS} currentStep={displayStep} />

      <div className="carecal-glass rounded-2xl p-6 sm:p-8">
        {step === 0 && (
          <div style={{ animation: `carecalPopIn 300ms ${EASE_OUT} both` }}>
            <StepTitle title="Your Info" subtitle="To confirm your appointment" />
            <div className="mt-6 flex flex-col gap-5">
              <Field label="Full name" error={touchedNombre && !nombreOk ? "Please enter your name" : null}>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  onBlur={() => setTouchedNombre(true)}
                  placeholder="e.g. Jane Doe"
                  className="mt-2 w-full bg-transparent pb-2 text-lg outline-none"
                  style={{ borderBottom: `1.5px solid ${touchedNombre && !nombreOk ? C.error : C.border}`, color: C.textPrimary }}
                />
              </Field>
              <Field label="Phone number" error={touchedTel && !telOk ? "Please enter a valid phone number" : null}>
                <input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  onBlur={() => setTouchedTel(true)}
                  placeholder="+1 (555) 000-0000"
                  className="mt-2 w-full bg-transparent pb-2 text-lg outline-none"
                  style={{ borderBottom: `1.5px solid ${touchedTel && !telOk ? C.error : C.border}`, color: C.textPrimary }}
                />
              </Field>
            </div>
            <div className="mt-8">
              <PrimaryButton
                onClick={() => {
                  setTouchedNombre(true);
                  setTouchedTel(true);
                  if (nombreOk && telOk) goNext();
                }}
                disabled={!nombreOk || !telOk}
              >
                Continue
              </PrimaryButton>
            </div>
          </div>
        )}

        {step === 1 && isMulti && (
          <div style={{ animation: `carecalSlideLeft 280ms ${EASE_OUT} both` }}>
            <StepTitle title="Provider" subtitle="Select your preferred practitioner" />
            <div className="mt-6 flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
              {(clinic.doctors || []).map((doc) => {
                const isSelected = String(selectedDoctor?.doctor_id) === String(doc.doctor_id);
                return (
                  <button
                    key={String(doc.doctor_id)}
                    type="button"
                    onClick={() => elegirDoctor(doc)}
                    className="flex flex-col text-left rounded-xl p-4 transition-all"
                    style={{
                      border: `1px solid ${isSelected ? C.accent : C.border}`,
                      backgroundColor: isSelected ? "rgba(16, 185, 129, 0.08)" : "transparent",
                    }}
                  >
                    <span className="font-semibold text-base" style={{ fontFamily: FONT_DISPLAY, color: C.textPrimary }}>
                      {doc.nombre_doctor}
                    </span>
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={goBack} className="mt-8 w-full rounded-xl py-3 text-sm" style={{ color: C.textMuted, fontStyle: "italic" }}>
              Back
            </button>
          </div>
        )}

        {step === 2 && selectedDoctor && (
          <div style={{ animation: `carecalSlideLeft 280ms ${EASE_OUT} both` }}>
            <StepTitle title="Service" subtitle={`Offered by ${selectedDoctor.nombre_doctor}`} />
            <div className="mt-6 flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
              {procedimientosLista.length === 0 && (
                <p className="text-sm italic py-4 text-center" style={{ color: C.textMuted }}>
                  No services configured for this provider.
                </p>
              )}
              {procedimientosLista.map((raw) => {
                const [label, price] = raw.split("|");
                const isSelected = procedimiento === label;
                return (
                  <button
                    key={raw}
                    type="button"
                    onClick={() => setProcedimiento(label)}
                    className="rounded-xl px-4 py-3 text-left text-sm flex items-center justify-between transition-all"
                    style={{
                      border: `1px solid ${isSelected ? C.accent : C.border}`,
                      backgroundColor: isSelected ? "rgba(16, 185, 129, 0.08)" : "transparent",
                      color: isSelected ? C.accent : C.textSecondary,
                    }}
                  >
                    <span>{label}</span>
                    {price && (
                      <span style={{ fontFamily: FONT_DISPLAY, opacity: 0.85 }}>${price}</span>
                    )}
                  </button>
                );
              })}
            </div>
            <NavRow onBack={goBack} onNext={goNext} nextDisabled={!procedimiento} />
          </div>
        )}

        {step === 3 && selectedDoctor && (
          <div style={{ animation: `carecalSlideLeft 280ms ${EASE_OUT} both` }}>
            <StepTitle title="Schedule" subtitle={`With ${selectedDoctor.nombre_doctor}`} />
            <div className="mt-6">
              <MiniCalendar value={fecha} onChange={handleSelectFecha} diasPermitidos={diasPermitidos} />
            </div>

            <div className="mt-6 min-h-[80px]">
              {checkingAvail && (
                <div className="flex justify-center py-6">
                  <Spinner />
                </div>
              )}
              {!checkingAvail && horarios && horarios.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm" style={{ color: C.textMuted, fontStyle: "italic" }}>
                    No available times for {formatFechaLarga(fecha)}.
                  </p>
                </div>
              )}
              {!checkingAvail && horarios && horarios.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {horarios.map((h) => {
                    const isSelected = horario === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHorario(h)}
                        className="rounded-xl py-3 text-sm transition-all"
                        style={{
                          border: `1px solid ${isSelected ? C.accent : C.border}`,
                          backgroundColor: isSelected ? "rgba(16, 185, 129, 0.08)" : "transparent",
                          color: isSelected ? C.accent : C.textSecondary,
                          fontFamily: FONT_DISPLAY,
                        }}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {confirmError && (
              <p className="mt-3 text-center text-sm" style={{ color: C.error }}>
                {confirmError}
              </p>
            )}

            <div className="mt-8">
              <PrimaryButton onClick={confirmar} disabled={!horario || confirming}>
                {confirming ? "Confirming…" : "Confirm Appointment"}
              </PrimaryButton>

              <a
                href={`https://wa.me/${String(clinic.telefono_contacto || "").replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Hi! I'd like to book an appointment.\n\nPractice: ${clinic.nombre_clinica}\nProvider: ${selectedDoctor.nombre_doctor}\nService: ${procedimiento}\nPreferred Date: ${formatFechaLarga(fecha)}\nName: ${nombre}\nPhone: ${telefono}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block w-full rounded-xl py-3 text-center text-sm"
                style={{ color: C.textMuted, fontStyle: "italic" }}
              >
                Prefer to book via WhatsApp?
              </a>
              <button type="button" onClick={goBack} className="mt-1 w-full rounded-xl py-3 text-sm" style={{ color: C.textMuted, fontStyle: "italic" }}>
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- MINI CALENDARIO INTERACTIVO ---
function MiniCalendar({
  value,
  onChange,
  diasPermitidos,
}: {
  value: Date;
  onChange: (d: Date) => void;
  diasPermitidos: number[];
}) {
  const today = startOfDay(new Date());
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());

  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const arr: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(viewYear, viewMonth, d));
    return arr;
  }, [viewYear, viewMonth]);

  const changeMonth = (dir: 1 | -1) => {
    const d = new Date(viewYear, viewMonth + dir, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="grid h-9 w-9 place-items-center rounded-full text-lg"
          style={{ color: C.accent }}
        >
          ‹
        </button>
        <div className="text-center" style={{ fontFamily: FONT_DISPLAY, letterSpacing: "0.08em" }}>
          <div className="text-lg" style={{ color: C.textPrimary }}>{MESES[viewMonth].toUpperCase()}</div>
          <div className="text-[10px] opacity-60" style={{ color: C.textMuted }}>{viewYear}</div>
        </div>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="grid h-9 w-9 place-items-center rounded-full text-lg"
          style={{ color: C.accent }}
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 pb-2">
        {DIAS_CORTOS.map((d, i) => (
          <div key={i} className="text-center text-[10px]" style={{ fontFamily: FONT_DISPLAY, letterSpacing: "0.18em", color: C.textMuted }}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="aspect-square" />;
          const disabled = d < today || !diasPermitidos.includes(d.getDay());
          const isSelected = sameDay(d, value);
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onChange(d)}
              className="relative aspect-square"
            >
              <span
                className="mx-auto grid h-9 w-9 place-items-center rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isSelected ? C.accent : "transparent",
                  color: isSelected ? "#FFFFFF" : disabled ? "rgba(148,163,184,0.3)" : C.textPrimary,
                  fontFamily: FONT_DISPLAY,
                }}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}