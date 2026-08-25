import type { ReactNode } from "react";
import { C, FONT_DISPLAY, FONT_BODY, EASE_OUT } from "@/lib/carecalTheme";

export function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl" style={{ color: C.textPrimary, fontFamily: FONT_DISPLAY, fontWeight: 600, letterSpacing: "0.01em" }}>
        {title}
      </h2>
      <p className="mt-1 text-sm" style={{ color: C.textSecondary, fontFamily: FONT_BODY }}>
        {subtitle}
      </p>
    </div>
  );
}

export function Field({ label, error, children }: { label: string; error: string | null; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase" style={{ letterSpacing: "0.22em", fontFamily: FONT_DISPLAY, color: C.textMuted }}>
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs" style={{ color: C.error, fontFamily: FONT_BODY, fontStyle: "italic" }}>
          {error}
        </span>
      )}
    </label>
  );
}

export function PrimaryButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="carecal-shine w-full rounded-xl py-4 text-base disabled:cursor-not-allowed"
      style={{
        backgroundColor: disabled ? "rgba(16,185,129,0.15)" : C.accent,
        color: disabled ? "rgba(15,23,42,0.35)" : "#FFFFFF",
        fontFamily: FONT_DISPLAY,
        fontWeight: 600,
        letterSpacing: "0.04em",
        boxShadow: disabled ? "none" : `0 18px 40px -20px ${C.glow}`,
        transition: `transform 180ms ${EASE_OUT}, background-color 200ms ${EASE_OUT}, box-shadow 200ms ${EASE_OUT}`,
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}

export function NavRow({ onBack, onNext, nextDisabled }: { onBack: () => void; onNext: () => void; nextDisabled: boolean }) {
  return (
    <div className="mt-8 flex flex-col gap-3">
      <PrimaryButton onClick={onNext} disabled={nextDisabled}>
        Continue
      </PrimaryButton>
      <button
        type="button"
        onClick={onBack}
        className="rounded-xl py-3 text-sm"
        style={{ color: C.textMuted, fontFamily: FONT_BODY, fontStyle: "italic" }}
      >
        Back
      </button>
    </div>
  );
}

export function Spinner() {
  return (
    <div
      className="h-10 w-10 rounded-full border-[2.5px]"
      style={{ borderColor: "rgba(16,185,129,0.2)", borderTopColor: C.accent, animation: `carecalSpin 900ms linear infinite` }}
    />
  );
}

export function AmbientGlow() {
  return (
    <>
      <div
        className="pointer-events-none absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full"
        style={{
          background: `radial-gradient(closest-side, ${C.glow}, transparent 70%)`,
          filter: "blur(60px)",
          animation: `carecalFloat 14s ease-in-out infinite`,
        }}
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-32 h-[380px] w-[380px] rounded-full"
        style={{
          background: `radial-gradient(closest-side, rgba(16,185,129,0.08), transparent 70%)`,
          filter: "blur(70px)",
          animation: `carecalFloat 18s ease-in-out -6s infinite reverse`,
        }}
      />
    </>
  );
}

export function ProgressSteps({ labels, currentStep }: { labels: string[]; currentStep: number }) {
  return (
    <div className="mb-8 flex items-center justify-between w-full">
      {labels.map((s, i) => (
        <div key={s} className={`flex items-center ${i < labels.length - 1 ? "flex-1" : ""}`}>
          <div
            className={`liquid-glass-circle grid h-10 w-10 shrink-0 place-items-center text-xs font-semibold ${
              i <= currentStep ? "liquid-glass-active" : "liquid-glass-inactive"
            }`}
            style={{ fontFamily: FONT_DISPLAY }}
          >
            {i + 1}
          </div>
          {i < labels.length - 1 && (
            <div
              className="h-0.5 flex-1 mx-2 rounded-full"
              style={{
                backgroundColor: i < currentStep ? C.accent : "rgba(226,232,240,0.8)",
                boxShadow: i < currentStep ? `0 0 10px ${C.glow}` : "none",
                transition: `all 300ms ${EASE_OUT}`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
