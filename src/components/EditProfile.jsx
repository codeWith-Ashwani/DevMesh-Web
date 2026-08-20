import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import UserCard from "./UserCard";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";
import { PageTitle } from "./Requests";
import { IconSettings, IconCheck, IconTerminal, IconCode } from "./ui/Icons";

const inputClass =
  "mt-1 w-full rounded-lg border border-[#252A30] bg-[#161A1F] px-3.5 py-2.5 text-xs font-mono text-[#F2F4F7] placeholder-[#57606A] outline-none hover:border-[#363E48] focus:border-[#00E5FF] transition-colors";

const Field = ({ label, children }) => (
  <label className="block font-mono text-[11px] text-[#8B949E]">
    {label}
    {children}
  </label>
);

function EditProfile({ user }) {
  const [form, setForm] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    about: user.about || "",
    skills: user.skills || [],
    age: user.age || "",
    gender: user.gender || "",
    photoUrl: user.photoUrl || "",
    githubUrl: user.githubUrl || "",
    linkedInUrl: user.linkedInUrl || "",
    portfolioUrl: user.portfolioUrl || "",
    lookingFor: user.lookingFor || "",
  });

  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const saveProfile = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await axios.patch(`${BASE_URL}/profile/edit`, form, { withCredentials: true });
      dispatch(addUser(res.data.data));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(
        err?.response?.data || "Could not write identity configuration to registry. Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageTitle
        eyebrow="SYSTEM CONFIGURATION"
        title="Developer Identity & Profile"
        subtitle="Configure public mesh metadata, technical competencies, and external links"
      />

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_24rem]">
        {/* Identity Config Form */}
        <section className="rounded-xl border border-[#252A30] bg-[#111418] p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-[#252A30] pb-3">
            <div className="flex items-center gap-2">
              <IconCode className="h-4 w-4 text-[#00E5FF]" />
              <h2 className="font-mono text-xs font-bold uppercase text-[#F2F4F7]">
                Identity Schema Parameters
              </h2>
            </div>
            <span className="font-mono text-[10px] text-[#57606A]">MUTABLE</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="FIRST NAME">
              <input
                className={inputClass}
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
              />
            </Field>
            <Field label="LAST NAME">
              <input
                className={inputClass}
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
              />
            </Field>
            <Field label="AGE">
              <input
                type="number"
                min="18"
                className={inputClass}
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
              />
            </Field>
            <Field label="GENDER">
              <select
                className={inputClass}
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
              >
                <option value="">Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>
          </div>

          <Field label="AVATAR IMAGE URL">
            <input
              className={inputClass}
              value={form.photoUrl}
              placeholder="https://images.unsplash.com/..."
              onChange={(e) => update("photoUrl", e.target.value)}
            />
          </Field>

          <Field label="COLLABORATION OBJECTIVE (LOOKING FOR)">
            <select
              className={inputClass}
              value={form.lookingFor}
              onChange={(e) => update("lookingFor", e.target.value)}
            >
              <option value="">Select an objective</option>
              <option>Job opportunities</option>
              <option>Project collaborators</option>
              <option>Study partners</option>
              <option>Mentorship</option>
              <option>Freelance work</option>
              <option>Open-source contributors</option>
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="GITHUB URL">
              <input
                type="url"
                className={inputClass}
                placeholder="https://github.com/handle"
                value={form.githubUrl}
                onChange={(e) => update("githubUrl", e.target.value)}
              />
            </Field>
            <Field label="LINKEDIN URL">
              <input
                type="url"
                className={inputClass}
                placeholder="https://linkedin.com/in/handle"
                value={form.linkedInUrl}
                onChange={(e) => update("linkedInUrl", e.target.value)}
              />
            </Field>
            <Field label="PORTFOLIO URL">
              <input
                type="url"
                className={inputClass}
                placeholder="https://domain.dev"
                value={form.portfolioUrl}
                onChange={(e) => update("portfolioUrl", e.target.value)}
              />
            </Field>
          </div>

          <Field label="TECHNICAL BIO & MISSION">
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              value={form.about}
              placeholder="Detail your engineering domain, open-source focus, or architecture interests..."
              onChange={(e) => update("about", e.target.value)}
            />
          </Field>

          <Field label="STACK & COMPETENCIES (COMMA SEPARATED)">
            <input
              className={inputClass}
              value={form.skills.join(", ")}
              placeholder="React, TypeScript, Node.js, Docker, AWS"
              onChange={(e) =>
                update(
                  "skills",
                  e.target.value
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean)
                )
              }
            />
          </Field>

          {error && (
            <p className="rounded-lg border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-3 font-mono text-xs text-[#F43F5E]">
              {error}
            </p>
          )}

          <div className="pt-2">
            <button
              className="btn-cyan flex items-center justify-center gap-2 px-6 py-2.5 font-mono text-xs font-bold disabled:opacity-50"
              onClick={saveProfile}
              disabled={saving}
            >
              <IconCheck className="h-4 w-4" />
              <span>{saving ? "SAVING CONFIG..." : "COMMIT CHANGES"}</span>
            </button>
          </div>
        </section>

        {/* Live Identity Card Preview */}
        <aside className="lg:sticky lg:top-20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8B949E]">
              LIVE NODE PREVIEW
            </span>
            <span className="tech-tag text-[10px]">SYNCED</span>
          </div>

          <UserCard user={form} />
        </aside>
      </div>

      {/* Success Toast */}
      {saved && (
        <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 rounded-xl border border-[#10B981]/40 bg-[#111418] px-4 py-3 font-mono text-xs text-[#10B981] shadow-2xl">
            <IconCheck className="h-4 w-4" />
            <span>Profile schema updated in network registry.</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditProfile;

