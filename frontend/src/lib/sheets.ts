export type Schedule = {
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_slot: number;
};

export type DoctorPayload = {
  doctor_id: string;
  nombre_doctor: string;
  procedimientos: string;
  schedules: Schedule[];
};

export type NewClinicPayload = {
  action: "create_clinic";
  slug: string;
  nombre_clinica: string;
  plan: "single" | "multi";
  telefono_contacto: string;
  email_contacto?: string;
  doctors: DoctorPayload[];
};

export type CreateClinicResult = { success: boolean; error?: string };

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function checkSlugAvailable(slug: string): Promise<boolean> {
  const res = await fetch(`/api/sheets?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error("Failed to check slug");
  const data = (await res.json()) as { available: boolean };
  return data.available;
}

export async function createClinic(payload: NewClinicPayload): Promise<CreateClinicResult> {
  try {
    const res = await fetch("/api/sheets", {
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
  } catch {
    return { success: false, error: "Failed to create clinic" };
  }
}
