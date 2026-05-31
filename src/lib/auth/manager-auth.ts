type SessionPayload = {
  username: string;
  expiresAt: number;
};

export const MANAGER_SESSION_COOKIE = "pm_manager_session";

const DEFAULT_TIMEOUT_MINUTES = 30;

function toBase64Url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function fromBase64Url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

export function getManagerCredentials() {
  return {
    username: process.env.PM_MANAGER_USERNAME ?? "manager",
    password: process.env.PM_MANAGER_PASSWORD ?? "manager123",
  };
}

export function getSessionTimeoutMinutes(): number {
  const configured = Number(process.env.PM_SESSION_TIMEOUT_MINUTES);
  if (!Number.isFinite(configured) || configured <= 0) {
    return DEFAULT_TIMEOUT_MINUTES;
  }

  return Math.min(Math.floor(configured), 24 * 60);
}

export function createSessionToken(username: string): string {
  const expiresAt = Date.now() + getSessionTimeoutMinutes() * 60 * 1000;
  const payload: SessionPayload = {
    username,
    expiresAt,
  };

  return toBase64Url(JSON.stringify(payload));
}

export function readSessionToken(token?: string | null): SessionPayload | null {
  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(token)) as SessionPayload;
    if (!payload.username || typeof payload.expiresAt !== "number") {
      return null;
    }
    if (payload.expiresAt <= Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionTimeoutMinutes() * 60,
  };
}

export function isValidManagerLogin(username: string, password: string): boolean {
  const expected = getManagerCredentials();
  return username === expected.username && password === expected.password;
}
