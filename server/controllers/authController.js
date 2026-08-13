const { sign, TOKEN_TTL_MS } = require("../utils/authToken");

// Each role logs in with one shared password (set via env vars), not
// individual per-person accounts — matches how this small team operates.
const ROLE_PASSWORD_ENV = {
  Admin: "ADMIN_PASSWORD",
  "Security Manager": "SECURITY_MANAGER_PASSWORD",
  Coordinator: "COORDINATOR_PASSWORD",
};

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
  const token = sign({ name: trimmedName, role, exp: Date.now() + TOKEN_TTL_MS });
  res.json({ name: trimmedName, role, token });
};
