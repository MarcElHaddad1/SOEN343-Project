import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Signs a JWT for the given user document.
 */
export function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email
    },
    env.jwtSecret,
    { expiresIn: "7d" }
  );
}

/**
 * Middleware — requires a valid Bearer token.
 * Sets req.auth = { sub, role, email } on success.
 */
export function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing auth token" });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.auth = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid auth token" });
  }
}

/**
 * Middleware — does NOT block unauthenticated requests.
 * Sets req.auth if a valid token is present, otherwise leaves it undefined.
 * Useful for public routes that can show extra context to logged-in users.
 */
export function authOptional(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (token) {
    try {
      req.auth = jwt.verify(token, env.jwtSecret);
    } catch {
      // Invalid token — treat as unauthenticated, do not block the request
    }
  }

  return next();
}

/**
 * Middleware — must come after authRequired.
 * Rejects the request unless req.auth.role is one of the given roles.
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}
