import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/${isLoginForm ? "login" : "signup"}`,
        isLoginForm ? { email, password } : { firstName, lastName, email, password },
        { withCredentials: true }
      );
      dispatch(addUser(isLoginForm ? response.data : response.data.data));
      navigate(isLoginForm ? "/" : "/profile");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Authentication failed. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#1E2442] bg-[#11152A] px-4 py-2.5 text-xs text-[#F5F7FF] placeholder-[#515870] outline-none hover:border-[#2A335C] focus:border-[#3B82F6] transition-colors";

  return (
    <div className="mx-auto grid w-full max-w-5xl items-center gap-12 px-4 py-12 md:grid-cols-2 md:py-20">
      {/* Left Manifesto / Product Intro */}
      <section className="order-2 md:order-1 space-y-6">
        <div className="flex items-center gap-2 text-xs text-[#3B82F6] font-semibold">
          <span className="status-dot-blue" />
          <span className="tracking-wider uppercase">DevMesh Platform</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-[#F5F7FF] sm:text-4xl md:text-5xl leading-tight">
          The Developer <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
            Network
          </span>
        </h1>

        <p className="max-w-md text-xs sm:text-sm leading-relaxed text-[#8B91A7]">
          Discover peer engineers, form distributed project squads, and build next-generation applications through a high-performance developer workspace.
        </p>

        {/* Feature bullets */}
        <div className="space-y-3 text-xs text-[#8B91A7]">
          <div className="flex items-center gap-3 rounded-2xl border border-[#1E2442] bg-[#0D1020] p-3.5 shadow-md">
            <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-blue-500/10 text-[#3B82F6] font-bold">✓</span>
            <span className="text-[#F5F7FF] font-medium">Developer identity &amp; verified tech stack graphs</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#1E2442] bg-[#0D1020] p-3.5 shadow-md">
            <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-500/10 text-[#10B981] font-bold">✓</span>
            <span className="text-[#F5F7FF] font-medium">Project initiative matching &amp; milestone tracking</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#1E2442] bg-[#0D1020] p-3.5 shadow-md">
            <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 font-bold">✓</span>
            <span className="text-[#F5F7FF] font-medium">Direct peer messaging &amp; dynamic network mesh</span>
          </div>
        </div>
      </section>

      {/* Right Auth Card */}
      <section className="order-1 md:order-2 fintech-card rounded-3xl border border-[#1E2442] p-6 shadow-2xl sm:p-8">
        {/* Switch tabs */}
        <div className="flex border-b border-[#1E2442] mb-6">
          <button
            onClick={() => {
              setIsLoginForm(true);
              setError("");
            }}
            className={`flex-1 pb-3 text-xs font-bold transition-all text-center ${
              isLoginForm
                ? "border-b-2 border-[#3B82F6] text-[#3B82F6]"
                : "text-[#8B91A7] hover:text-[#F5F7FF]"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsLoginForm(false);
              setError("");
            }}
            className={`flex-1 pb-3 text-xs font-bold transition-all text-center ${
              !isLoginForm
                ? "border-b-2 border-[#3B82F6] text-[#3B82F6]"
                : "text-[#8B91A7] hover:text-[#F5F7FF]"
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {!isLoginForm && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#8B91A7] mb-1">
                  First Name
                </label>
                <input
                  className={inputClass}
                  placeholder="Ashwani"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8B91A7] mb-1">
                  Last Name
                </label>
                <input
                  className={inputClass}
                  placeholder="Singh"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#8B91A7] mb-1">
              Email Address
            </label>
            <input
              type="email"
              className={inputClass}
              placeholder="developer@mesh.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8B91A7] mb-1">
              Password
            </label>
            <input
              type="password"
              className={inputClass}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-3.5 text-xs text-[#F43F5E]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 text-xs font-bold disabled:opacity-50"
          >
            {loading
              ? "Signing in..."
              : isLoginForm
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#1E2442] text-center">
          <button
            className="text-xs font-medium text-[#8B91A7] hover:text-[#3B82F6] transition-colors"
            onClick={() => {
              setIsLoginForm(!isLoginForm);
              setError("");
            }}
          >
            {isLoginForm ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default Login;



