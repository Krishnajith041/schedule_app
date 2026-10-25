import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { downloadLoginDetails, registerAccount, verifyLogin } from "../utils/accounts";
import { ChefHat, Eye, EyeOff, Lock, Phone, User } from "lucide-react";

type Mode = "login" | "register";

const fieldClass =
  "w-full h-12 rounded-xl bg-black/30 border border-white/10 pl-11 pr-4 text-white placeholder:text-white/35 outline-none transition focus:border-orange-400/70 focus:ring-2 focus:ring-orange-400/30";

export function LoginView() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (username.trim().length < 3) next.username = "Username must be at least 3 characters.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    if (mode === "register" && !/^\+?[0-9]{10,13}$/.test(phone.replace(/[\s-]/g, "")))
      next.phone = "Enter a valid phone number (10–13 digits).";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const result = isRegisterMode()
      ? await registerAccount(username, password, phone)
      : await verifyLogin(username, password);
    if (!result.ok) {
      setErrors({ form: result.error });
      return;
    }
    if (isRegisterMode()) downloadLoginDetails([result.account]);
    sessionStorage.setItem("preview-signed-in", "1");
    navigate("/");
  };

  const isRegisterMode = () => mode === "register";

  const switchMode = (m: Mode) => {
    setMode(m);
    setErrors({});
  };

  const isRegister = mode === "register";

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden flex items-center justify-center px-4 py-10 text-white relative">
      <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-2xl shadow-[0_4px_14px_rgba(234,88,12,0.4)] border border-orange-300/30 mb-4">
            <ChefHat className="size-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold">
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-orange-200/80 mt-1">
            {isRegister
              ? "Register to start scheduling catering events"
              : "Sign in to manage your catering events"}
          </p>
        </div>

        <div role="tablist" className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-black/30 border border-white/10 mb-6">
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={`h-10 rounded-lg text-sm font-medium transition ${
                mode === m ? "bg-white/15 text-white shadow-inner" : "text-white/55 hover:text-white"
              }`}
            >
              {m === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {errors.form && (
            <p role="alert" className="text-sm text-red-200 bg-red-500/10 border border-red-400/30 rounded-lg px-3 py-2">{errors.form}</p>
          )}
          <div>
            <label htmlFor="username" className="block text-sm text-white/80 mb-1.5">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/45" />
              <input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. spice_kitchen"
                aria-invalid={!!errors.username}
                className={fieldClass}
              />
            </div>
            {errors.username && <p className="text-xs text-red-300 mt-1.5">{errors.username}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-white/80 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/45" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isRegister ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                aria-invalid={!!errors.password}
                className={`${fieldClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-1"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-300 mt-1.5">{errors.password}</p>}
          </div>

          {isRegister && (
            <div>
              <label htmlFor="phone" className="block text-sm text-white/80 mb-1.5">Phone number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/45" />
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  aria-invalid={!!errors.phone}
                  className={fieldClass}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-300 mt-1.5">{errors.phone}</p>}
            </div>
          )}

          <button
            type="submit"
            className="w-full h-12 mt-2 rounded-xl font-semibold text-white bg-gradient-to-b from-orange-400 to-orange-600 border border-orange-300/40 shadow-[0_5px_0_0_#9a3412,0_8px_16px_rgba(0,0,0,0.4)] transition-all active:translate-y-[4px] active:shadow-[0_1px_0_0_#9a3412,0_2px_6px_rgba(0,0,0,0.4)]"
          >
            {isRegister ? "Create account" : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-white/55 mt-6">
          {isRegister ? "Already registered?" : "New here?"}{" "}
          <button
            type="button"
            onClick={() => switchMode(isRegister ? "login" : "register")}
            className="text-orange-300 hover:text-orange-200 underline underline-offset-4"
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
        <p className="text-center text-[11px] text-white/35 mt-3">
          Accounts are saved on this device only. Registering also downloads a login-details document.
        </p>
      </div>
    </div>
  );
}
