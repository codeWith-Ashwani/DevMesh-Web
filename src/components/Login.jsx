import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";
import { IconTerminal, IconCode, IconSparkles, IconCheck, IconNetwork } from "./ui/Icons";

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
          "Authentication handshake failed. Verify credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-[#252A30] bg-[#161A1F] px-3.5 py-2.5 font-mono text-xs text-[#F2F4F7] placeholder-[#57606A] outline-none hover:border-[#363E48] focus:border-[#00E5FF] transition-colors";

  return (
    <div className="mx-auto grid w-full max-w-5xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
      {/* Left Manifesto / Terminal Brand */}
      <section className="order-2 md:order-1 space-y-6">
        <div className="flex items-center gap-2 font-mono text-xs text-[#00E5FF]">
          <span className="h-2 w-2 rounded-full bg-[#00E5FF] animate-pulse" />
          <span>DEVMESH OS // PROTOCOL ACTIVE</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-[#F2F4F7] sm:text-4xl md:text-5xl leading-tight">
          The Developer <br />
          <span className="text-[#00E5FF]">Network OS</span>
        </h1>

        <p className="max-w-md font-mono text-xs leading-relaxed text-[#8B949E]">
          Discover peer engineers, form distributed project squads, and communicate through an
          information-dense workspace built strictly for builders.
        </p>

        {/* Feature bullets */}
        <div className="space-y-3 font-mono text-xs text-[#8B949E]">
          <div className="flex items-center gap-3 rounded-lg border border-[#252A30] bg-[#111418] p-3">
            <span className="text-[#00E5FF]">&gt;</span>
            <span>Cryptographic developer identity &amp; verified tech stacks</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-[#252A30] bg-[#111418] p-3">
            <span className="text-[#10B981]">&gt;</span>
            <span>Real-time project collaboration &amp; role matching</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-[#252A30] bg-[#111418] p-3">
            <span className="text-[#38BDF8]">&gt;</span>
            <span>High-frequency encrypted communication console</span>
          </div>
        </div>
      </section>

      {/* Right Auth Card */}
      <section className="order-1 md:order-2 surface-card rounded-xl border border-[#252A30] bg-[#111418] p-6 shadow-2xl sm:p-8">
        {/* Switch tabs */}
        <div className="flex border-b border-[#252A30] mb-6">
          <button
            onClick={() => {
              setIsLoginForm(true);
              setError("");
            }}
            className={`flex-1 pb-3 font-mono text-xs font-bold transition-colors text-center ${
              isLoginForm
                ? "border-b-2 border-[#00E5FF] text-[#00E5FF]"
                : "text-[#8B949E] hover:text-[#F2F4F7]"
            }`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => {
              setIsLoginForm(false);
              setError("");
            }}
            className={`flex-1 pb-3 font-mono text-xs font-bold transition-colors text-center ${
              !isLoginForm
                ? "border-b-2 border-[#00E5FF] text-[#00E5FF]"
                : "text-[#8B949E] hover:text-[#F2F4F7]"
            }`}
          >
            INITIALIZE NODE (SIGN UP)
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {!isLoginForm && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-[10px] uppercase text-[#8B949E] mb-1">
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
                <label className="block font-mono text-[10px] uppercase text-[#8B949E] mb-1">
                  Last Name
                </label>
                <input
                  className={inputClass}
                  placeholder="Dev"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-mono text-[10px] uppercase text-[#8B949E] mb-1">
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
            <label className="block font-mono text-[10px] uppercase text-[#8B949E] mb-1">
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
            <div className="rounded-lg border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-3 font-mono text-xs text-[#F43F5E]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-cyan w-full py-2.5 font-mono text-xs font-bold disabled:opacity-50"
          >
            {loading
              ? "AUTHENTICATING..."
              : isLoginForm
              ? "ACCESS DEV NETWORK"
              : "REGISTER IDENTITY"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#252A30] text-center">
          <button
            className="font-mono text-xs text-[#8B949E] hover:text-[#00E5FF] transition-colors"
            onClick={() => {
              setIsLoginForm(!isLoginForm);
              setError("");
            }}
          >
            {isLoginForm ? "> No node registered? Create account" : "> Already provisioned? Sign in"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default Login;

