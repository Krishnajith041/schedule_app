const STORAGE_KEY = "catering-accounts";

export interface Account {
  username: string;
  phone: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
}

const norm = (u: string) => u.trim().toLowerCase();

async function hash(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getAccounts(): Account[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export async function registerAccount(username: string, password: string, phone: string) {
  const accounts = getAccounts();
  if (accounts.some((a) => norm(a.username) === norm(username))) {
    return { ok: false as const, error: "That username is already taken." };
  }
  const salt = crypto.randomUUID();
  const account: Account = {
    username: username.trim(),
    phone: phone.trim(),
    salt,
    passwordHash: await hash(password, salt),
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([account, ...accounts]));
  return { ok: true as const, account };
}

export async function verifyLogin(username: string, password: string) {
  const account = getAccounts().find((a) => norm(a.username) === norm(username));
  if (!account || (await hash(password, account.salt)) !== account.passwordHash) {
    return { ok: false as const, error: "Incorrect username or password." };
  }
  return { ok: true as const, account };
}

export function downloadLoginDetails(accounts: Account[] = getAccounts()) {
  const lines = [
    "CATERING SCHEDULER - LOGIN DETAILS",
    `Generated: ${new Date().toLocaleString("en-IN")}`,
    "Passwords are not included (stored as salted hashes).",
    "",
    ...accounts.flatMap((a, i) => [
      `Account ${i + 1}`,
      `  Username   : ${a.username}`,
      `  Phone      : ${a.phone}`,
      `  Registered : ${new Date(a.createdAt).toLocaleString("en-IN")}`,
      "",
    ]),
  ];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "login-details.txt";
  link.click();
  URL.revokeObjectURL(url);
}
