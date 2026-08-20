const crypto = require("crypto");
const { sign, verify, TOKEN_TTL_MS } = require("../utils/authToken");

// Each role logs in with one shared password (set via env vars), not
// individual per-person accounts — matches how this small team operates.
const ROLE_PASSWORD_ENV = {
  Admin: "ADMIN_PASSWORD",
  "Security Manager": "SECURITY_MANAGER_PASSWORD",
  Coordinator: "COORDINATOR_PASSWORD",
};

// Not for secrecy (the password is already a shared env-var secret) — just
// a fingerprint baked into the token at login time so a later password
// change can be detected without storing any session state server-side.
function passwordFingerprint(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

exports.login = async (req, res) => {
  const { name, role, password } = req.body;
  if (!name || !role || !password) {
    return res.status(400).json({ message: "Name, role and password are required" });
  }

  const envKey = ROLE_PASSWORD_ENV[role];
  const expected = envKey && process.env[envKey];
  if (!expected) {
    return res.status(500).json({ message: "No password configured for this role — contact the app admin" });
  }
  if (password !== expected) {
    return res.status(401).json({ message: "Incorrect password for this role" });
  }

  const trimmedName = name.trim();
  const token = sign({
    name: trimmedName,
    role,
    pwFingerprint: passwordFingerprint(expected),
    exp: Date.now() + TOKEN_TTL_MS,
  });
  res.json({ name: trimmedName, role, token });
};

// Lets an already-logged-in client notice a role's password was changed
// (e.g. rotated after a suspected leak) and force that session to log out,
// even though the token itself is still validly signed and unexpired.
exports.verify = async (req, res) => {
  const { token } = req.body;
  const payload = verify(token);
  if (!payload) return res.status(401).json({ ok: false, message: "Session expired — please log in again" });

  const envKey = ROLE_PASSWORD_ENV[payload.role];
  const currentPassword = envKey && process.env[envKey];
  const currentFingerprint = currentPassword ? passwordFingerprint(currentPassword) : null;

  if (!currentFingerprint || payload.pwFingerprint !== currentFingerprint) {
    return res.status(401).json({ ok: false, message: "Password was changed — please log in again" });
  }
  res.json({ ok: true });
};
