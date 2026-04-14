export function isAdmin(req: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const given = req.headers.get("x-admin-password");
  return given === expected;
}
