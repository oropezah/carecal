import { useState, type ReactNode } from "react";
import { C, FONT_DISPLAY } from "@/lib/carecalTheme";

export type Procedimiento = { id: string; label: string; price?: string };
export type DayRow = { day: string; enabled: boolean; inicio: string; fin: string };
export type DoctorForm = {
  doctor_id: string;
  nombre_doctor: string;
  procedimientos: Procedimiento[];
  duracionCita: number;
  dias: DayRow[];
};

export const DIAS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function defaultDias(): DayRow[] {
  return DIAS.map((d) => ({ day: d, enabled: false, inicio: "09:00", fin: "17:00" }));
}

export function nuevoDoctor(id: string): DoctorForm {
  return { doctor_id: id, nombre_doctor: "", procedimientos: [], duracionCita: 30, dias: defaultDias() };
}

function horaOptions() {
  const opts: { value: string; label: string }[] = [];
  for (let h = 6; h <= 21; h++) {
    for (const m of [0, 30]) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const period = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 === 0 ? 12 : h % 12;
      opts.push({ value: `${hh}:${mm}`, label: `${h12}:${mm} ${period}` });
    }
  }
  return opts;
}

const HORAS = horaOptions();

export function labelDeHora(v: string) {
  return HORAS.find((h) => h.value === v)?.label || v;
}

export function PlanCard({
  active,
  onClick,
  title,
  price,
  desc,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  price: string;
  desc: string;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`carecal-shine flex items-center gap-4 rounded-2xl p-5 text-left transition-all ${active ? "liquid-glass-active" : ""}`}
      style={{
        border: `1px solid ${active ? C.borderHover : C.border}`,
        backgroundColor: active ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.6)",
      }}
    >
      <div
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full"
        style={{ backgroundColor: active ? "rgba(16,185,129,0.12)" : "rgba(241,245,249,0.9)", color: active ? C.accent : C.textSecondary }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold" style={{ fontFamily: FONT_DISPLAY, color: C.textPrimary }}>
          {title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
          {desc}
        </p>
      </div>
      <p className="text-lg font-semibold shrink-0" style={{ color: C.accent, fontFamily: FONT_DISPLAY }}>
        {price}
        <span className="text-xs font-normal" style={{ color: C.textMuted }}>
          /mo
        </span>
      </p>
    </button>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
      style={{ backgroundColor: checked ? C.accent : "rgba(226,232,240,0.9)" }}
    >
      <span
        className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
        style={{ transform: checked ? "translateX(16px)" : "translateX(0px)" }}
      />
    </button>
  );
}

export function DoctorEditor({
  doc,
  index,
  onNombreChange,
  onDuracionChange,
  onAddProcedimiento,
  onRemoveProcedimiento,
  onToggleDia,
  onUpdateDiaHora,
  onCopiarATodos,
}: {
  doc: DoctorForm;
  index: number;
  onNombreChange: (v: string) => void;
  onDuracionChange: (v: number) => void;
  onAddProcedimiento: (label: string, price: string) => void;
  onRemoveProcedimiento: (id: string) => void;
  onToggleDia: (diaIndex: number) => void;
  onUpdateDiaHora: (diaIndex: number, field: "inicio" | "fin", value: string) => void;
  onCopiarATodos: (diaIndex: number) => void;
}) {
  const [procInput, setProcInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const primerDiaActivo = doc.dias.findIndex((d) => d.enabled);

  function submitProc() {
    if (!procInput.trim()) return;
    onAddProcedimiento(procInput, priceInput);
    setProcInput("");
    setPriceInput("");
  }

  return (
    <div className="rounded-2xl p-4 sm:p-5 w-full box-border" style={{ border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.5)" }}>
      <p className="text-xs uppercase mb-3" style={{ letterSpacing: "0.2em", color: C.textMuted, fontFamily: FONT_DISPLAY }}>
        Provider {index + 1}
      </p>

      <input
        className="w-full bg-transparent pb-2 mb-5 text-base outline-none"
        placeholder="Provider name"
        value={doc.nombre_doctor}
        onChange={(e) => onNombreChange(e.target.value)}
        style={{ borderBottom: `1.5px solid ${C.border}`, color: C.textPrimary }}
      />

      <p className="text-[11px] mb-1" style={{ color: C.textMuted }}>
        Services Offered
      </p>
      <p className="text-[11px] mb-3" style={{ color: C.textMuted, fontStyle: "italic" }}>
        You can add more services later — only add what you need for now.
      </p>

      {doc.procedimientos.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {doc.procedimientos.map((p) => (
            <span
              key={p.id}
              className="liquid-glass-active flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs max-w-full break-all"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              <span className="truncate">{p.label}</span>
              {p.price && <span style={{ opacity: 0.75 }}>· ${p.price}</span>}
              <button type="button" onClick={() => onRemoveProcedimiento(p.id)} className="ml-1 shrink-0 opacity-70 hover:opacity-100" aria-label={`Remove ${p.label}`}>
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <form
        className="flex items-center gap-1.5 mb-5 w-full min-w-0"
        onSubmit={(e) => {
          e.preventDefault();
          submitProc();
        }}
      >
        <input
          value={procInput}
          onChange={(e) => setProcInput(e.target.value)}
          placeholder="e.g. Cleaning"
          enterKeyHint="done"
          className="flex-1 min-w-0 rounded-lg px-2.5 py-2 text-xs sm:text-sm outline-none"
          style={{ backgroundColor: C.bgPrimary, border: `1px solid ${C.border}`, color: C.textPrimary }}
        />
        <input
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value)}
          placeholder="$ (opt)"
          enterKeyHint="done"
          className="w-16 sm:w-20 shrink-0 rounded-lg px-2 py-2 text-xs sm:text-sm outline-none"
          style={{ backgroundColor: C.bgPrimary, border: `1px solid ${C.border}`, color: C.textPrimary }}
        />
        <button
          type="submit"
          aria-label="Add service"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition-transform active:scale-90"
          style={{ backgroundColor: C.accent, color: "#FFFFFF" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </form>

      <p className="text-[11px] mb-2" style={{ color: C.textMuted }}>
        Appointment duration
      </p>
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {[15, 20, 30, 45, 60].map((min) => (
          <button
            key={min}
            type="button"
            onClick={() => onDuracionChange(min)}
            className="rounded-lg px-2.5 py-1.5 text-xs"
            style={{
              border: `1px solid ${doc.duracionCita === min ? C.borderHover : C.border}`,
              backgroundColor: doc.duracionCita === min ? "rgba(16,185,129,0.08)" : "transparent",
              color: doc.duracionCita === min ? C.accentDark : C.textSecondary,
            }}
          >
            {min} min
          </button>
        ))}
      </div>

      <p className="text-[11px] mb-2.5" style={{ color: C.textMuted }}>
        Weekly Schedule
      </p>
      <div className="flex flex-col gap-2 w-full">
        {doc.dias.map((day, di) => (
          <div
            key={day.day}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl p-2.5 transition-all w-full box-border"
            style={{
              backgroundColor: day.enabled ? "rgba(16, 185, 129, 0.04)" : "rgba(248, 250, 252, 0.8)",
              border: `1px solid ${day.enabled ? C.borderHover : C.border}`,
            }}
          >
            <div className="flex items-center gap-3 shrink-0">
              <ToggleSwitch checked={day.enabled} onChange={() => onToggleDia(di)} />
              <span
                className="text-xs font-medium"
                style={{
                  color: day.enabled ? C.textPrimary : C.textMuted,
                  fontFamily: FONT_DISPLAY,
                }}
              >
                {day.day}
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap min-w-0 w-full sm:w-auto">
              {day.enabled ? (
                <>
                  <div
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1 shrink-0"
                    style={{ backgroundColor: "#FFFFFF", border: `1px solid ${C.border}` }}
                  >
                    <select
                      value={day.inicio}
                      onChange={(e) => onUpdateDiaHora(di, "inicio", e.target.value)}
                      className="bg-transparent text-xs outline-none cursor-pointer font-medium"
                      style={{ color: C.textPrimary }}
                    >
                      {HORAS.map((h) => (
                        <option key={h.value} value={h.value}>
                          {h.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] opacity-50" style={{ color: C.textMuted }}>to</span>
                    <select
                      value={day.fin}
                      onChange={(e) => onUpdateDiaHora(di, "fin", e.target.value)}
                      className="bg-transparent text-xs outline-none cursor-pointer font-medium"
                      style={{ color: C.textPrimary }}
                    >
                      {HORAS.map((h) => (
                        <option key={h.value} value={h.value}>
                          {h.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {primerDiaActivo === di && doc.dias.filter((d) => d.enabled).length > 1 && (
                    <button
                      type="button"
                      onClick={() => onCopiarATodos(di)}
                      className="text-[10px] font-medium px-2 py-1 rounded-lg transition-colors shrink-0 ml-auto sm:ml-0"
                      style={{
                        color: C.accent,
                        border: `1px solid ${C.borderHover}`,
                        backgroundColor: "rgba(16,185,129,0.06)",
                      }}
                    >
                      Apply to all
                    </button>
                  )}
                </>
              ) : (
                <span className="text-xs italic py-0.5 px-1 ml-auto sm:ml-0" style={{ color: C.textMuted }}>
                  Unavailable
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
