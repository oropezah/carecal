export const AUTH_COOKIE = "carecal_session";

export function parseCookies(header?: string): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => {
        const [key, ...rest] = part.trim().split("=");
        return [key, rest.join("=")];
      })
      .filter(([key]) => key),
  );
}

export function buildAuthCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${AUTH_COOKIE}=authenticated; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${secure}`;
}

export function clearAuthCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${AUTH_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${secure}`;
}

export function isAuthenticated(cookieHeader?: string): boolean {
  return parseCookies(cookieHeader)[AUTH_COOKIE] === "authenticated";
}

export function verifyCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.CARECAL_ADMIN_EMAIL;
  const adminPassword = process.env.CARECAL_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return false;
  return email === adminEmail && password === adminPassword;
}
