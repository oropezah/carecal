import type { NextApiRequest, NextApiResponse } from "next";
import type { NewClinicPayload } from "@/lib/sheets";

const takenSlugs = new Set<string>();
const clinics: NewClinicPayload[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const slug = typeof req.query.slug === "string" ? req.query.slug : "";
    if (!slug) {
      return res.status(400).json({ error: "slug required" });
    }
    return res.status(200).json({ available: !takenSlugs.has(slug) });
  }

  if (req.method === "POST") {
    const payload = req.body as NewClinicPayload;
    if (!payload?.slug || !payload?.nombre_clinica) {
      return res.status(400).json({ error: "invalid payload" });
    }
    if (takenSlugs.has(payload.slug)) {
      return res.status(409).json({ error: "slug taken" });
    }
    takenSlugs.add(payload.slug);
    clinics.push(payload);
    return res.status(201).json({ ok: true, slug: payload.slug });
  }

  return res.status(405).json({ error: "method not allowed" });
}
