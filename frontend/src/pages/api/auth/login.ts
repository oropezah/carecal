import type { NextApiRequest, NextApiResponse } from "next";
import { buildAuthCookie, verifyCredentials } from "@/lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  if (!verifyCredentials(email, password)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  res.setHeader("Set-Cookie", buildAuthCookie());
  return res.status(200).json({ ok: true });
}
