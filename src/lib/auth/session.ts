// Auth disabled — hardcoded session for development
// To re-enable auth, restore the original Better Auth implementation

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export type SessionContext = {
  user: SessionUser;
  organizationId: string;
  role: "owner" | "admin" | "manager" | "staff" | "viewer";
};

const HARDCODED_SESSION: SessionContext = {
  user: {
    id: "dev-user-001",
    email: "brian@doublejack.com",
    name: "Brian Strumillo",
  },
  organizationId: "4621f985-b8de-4b19-a243-54821b9adc8c",
  role: "owner",
};

export async function getSession(): Promise<SessionContext | null> {
  return HARDCODED_SESSION;
}

export async function requireSession(): Promise<SessionContext> {
  return HARDCODED_SESSION;
}
