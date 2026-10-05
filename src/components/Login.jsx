import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";
import GuideAvatar from "./ui/GuideAvatar";
import { IconCheck } from "./ui/Icons";
export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(
        BASE_URL + "/" + (isLogin ? "login" : "signup"),
        isLogin ? { email: form.email, password: form.password } : form,
        { withCredentials: true },
      );
      dispatch(addUser(isLogin ? response.data : response.data.data));
      navigate(isLogin ? "/" : "/profile");
    } catch (error) {
      setError(
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Could not sign in. Check your details and try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  const change = (field) => (event) =>
    setForm({ ...form, [field]: event.target.value });
  const fieldClass =
    "mt-2 w-full rounded-lg border border-[#344D70] bg-[#16233D] px-4 py-3 text-sm";
  return (
    <div className="w-full max-w-6xl mx-auto px-5 sm:px-10 py-10 md:py-16">
      <div className="flex items-center gap-3 mb-10 md:mb-14">
        <span className="brand-mark">{"<>"}</span>
        <span className="text-xl font-semibold tracking-tight">
          DevMesh<span className="text-[#82B4FF]">.</span>
        </span>
        <span className="hidden sm:block ml-4 eyebrow">
          a space for developers
        </span>
      </div>
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-20 items-center">
        <section>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] leading-[1.08] font-semibold tracking-[-.05em]">
            You bring the idea.
            <br />
            <span className="text-[#82B4FF]">Find your people.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#A5B4CE] leading-7 mt-6 max-w-md">
            A workspace for developers who want to turn side projects into
            shipped work. Meet a teammate, try a small task, and build something
            that matters.
          </p>
          <div className="mt-8 space-y-3">
            {[
              "Match by skills, role, and time to commit",
              "Start small with a collaboration trial",
              "Ship milestones and show your contribution",
            ].map((text) => (
              <p
                key={text}
                className="flex items-center gap-3 text-sm text-[#B6C7E2]"
              >
                <IconCheck className="h-4 w-4 text-[#82B4FF] shrink-0" />
                {text}
              </p>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-4 mt-10 border-t border-[#293B5B] pt-6">
            <GuideAvatar className="h-20 w-20 shrink-0" />
            <div>
              <p className="text-sm font-medium">A little help from Patch.</p>
              <p className="text-xs text-[#A5B4CE] mt-1 leading-5 max-w-xs">
                Your tiny workspace companion will help you find your way
                around.
              </p>
            </div>
          </div>
        </section>
        <section className="workbench-card rounded-2xl p-6 sm:p-8">
          <div className="flex gap-2 bg-[#0B1020] rounded-lg p-1 mb-7">
            {[
              [true, "Sign in"],
              [false, "Create account"],
            ].map(([value, label]) => (
              <button
                key={label}
                disabled={loading}
                aria-pressed={isLogin === value}
                className={
                  "flex-1 py-2.5 rounded-md text-sm " +
                  (isLogin === value
                    ? "bg-[#1D3050] text-[#EEF4FF]"
                    : "text-[#A5B4CE]")
                }
                onClick={() => {
                  setIsLogin(value);
                  setError("");
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <h2 className="text-2xl font-medium tracking-tight">
            {isLogin ? "Welcome back, builder." : "Make yourself at home."}
          </h2>
          <p className="text-xs text-[#A5B4CE] mt-2 mb-6">
            {isLogin
              ? "Your next project is waiting."
              : "Start with your profile. Find your first collaborator."}
          </p>
          <form onSubmit={submit} className="space-y-5">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-[#A5B4CE]">
                  First name
                  <input
                    className={fieldClass}
                    autoComplete="given-name"
                    maxLength={50}
                    value={form.firstName}
                    onChange={change("firstName")}
                    required
                  />
                </label>
                <label className="text-xs text-[#A5B4CE]">
                  Last name
                  <input
                    className={fieldClass}
                    autoComplete="family-name"
                    maxLength={50}
                    value={form.lastName}
                    onChange={change("lastName")}
                    required
                  />
                </label>
              </div>
            )}
            <label className="block text-xs text-[#A5B4CE]">
              Email address
              <input
                type="email"
                className={fieldClass}
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={change("email")}
                required
              />
            </label>
            <div>
              <div className="flex justify-between items-center">
                <label
                  htmlFor="auth-password"
                  className="text-xs text-[#A5B4CE]"
                >
                  Password
                </label>
                <button
                  type="button"
                  aria-pressed={showPassword}
                  className="text-xs text-[#82B4FF]"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? "Hide password" : "Show password"}
                </button>
              </div>
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className={fieldClass}
                value={form.password}
                onChange={change("password")}
                required
              />
              {!isLogin && (
                <p className="text-[11px] text-[#A5B4CE] leading-5 mt-2">
                  Use a strong password with uppercase and lowercase letters, a
                  number, and a symbol.
                </p>
              )}
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-lg border border-rose-400/30 bg-rose-400/5 p-3 text-sm text-rose-300"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm"
            >
              {loading
                ? "Please wait…"
                : isLogin
                  ? "Enter your workspace →"
                  : "Create your workspace →"}
            </button>
          </form>
          <p className="text-xs text-center text-[#7B91B5] mt-6 font-mono">
            less solo building. more shared momentum.
          </p>
        </section>
      </div>
    </div>
  );
}
