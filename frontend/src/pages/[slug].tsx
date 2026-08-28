import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { C, FONT_DISPLAY, FONT_BODY } from "@/lib/carecalTheme";
import CareCalGlassStyles from "@/components/CareCalGlassStyles";
import { AmbientGlow } from "@/components/CareCalUI";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://carecal-u2gu.onrender.com";

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

async function getClinic(slug: string): Promise<ClinicPublic | null> {
  const res = await fetch(`${API_BASE}/clinics/${encodeURIComponent(slug)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Status HTTP: ${res.status}`);
  return (await res.json()) as ClinicPublic;
}

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
            <p style={{ color: C.textSecondary }}>Loading…</p>
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
          <div className="carecal-glass rounded-2xl p-8">
            <h1
              className="text-2xl sm:text-3xl text-center"
              style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, color: C.textPrimary }}
            >
              {state.clinic.nombre_clinica}
            </h1>
            <div className="mt-6 flex flex-col gap-4">
              {state.clinic.doctors.map((doc) => (
                <div
                  key={doc.doctor_id}
                  className="rounded-xl p-4"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  <p
                    className="font-semibold"
                    style={{ fontFamily: FONT_DISPLAY, color: C.textPrimary }}
                  >
                    {doc.nombre_doctor}
                  </p>
                  {doc.schedules.map((s, i) => (
                    <p key={i} className="text-xs mt-1" style={{ color: C.textSecondary }}>
                      {s.dia_semana}: {s.hora_inicio} – {s.hora_fin}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}