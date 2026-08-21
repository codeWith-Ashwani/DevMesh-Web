import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import UserCard from "./UserCard";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";
import { PageTitle } from "./Requests";
import { IconCheck, IconCode } from "./ui/Icons";

const inputClass =
  "mt-1 w-full rounded-lg border border-[#252A30] bg-[#161A1F] px-3.5 py-2 text-xs text-[#F2F4F7] placeholder-[#57606A] outline-none hover:border-[#363E48] focus:border-[#00E5FF] transition-colors";

const Field = ({ label, children }) => (
  <label className="block text-xs font-medium text-[#8B949E]">
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
        err?.response?.data || "Could not save profile changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageTitle
        eyebrow="Profile Settings"
        title="Developer Identity & Profile"
        subtitle="Manage your public developer profile, technical skills, and portfolio links"
      />

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_24rem]">
        {/* Identity Config Form */}
        <section className="rounded-xl border border-[#252A30] bg-[#111418] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#252A30] pb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#F2F4F7] font-mono">
              Profile Details
            </h2>
            <span className="tech-tag text-[10px]">EDITABLE</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First Name">
              <input
                className={inputClass}
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
              />
            </Field>
            <Field label="Last Name">
              <input
                className={inputClass}
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
              />
            </Field>
            <Field label="Age">
              <input
                type="number"
                min="18"
                className={inputClass}
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
              />
            </Field>
            <Field label="Gender">
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

          <Field label="Avatar Image URL">
            <input
              className={inputClass}
              value={form.photoUrl}
              placeholder="https://images.unsplash.com/..."
              onChange={(e) => update("photoUrl", e.target.value)}
            />
          </Field>

          <Field label="Objective / Looking For">
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
            <Field label="GitHub URL">
              <input
                type="url"
                className={inputClass}
                placeholder="https://github.com/handle"
                value={form.githubUrl}
                onChange={(e) => update("githubUrl", e.target.value)}
              />
            </Field>
            <Field label="LinkedIn URL">
              <input
                type="url"
                className={inputClass}
                placeholder="https://linkedin.com/in/handle"
                value={form.linkedInUrl}
                onChange={(e) => update("linkedInUrl", e.target.value)}
              />
            </Field>
            <Field label="Portfolio URL">
              <input
                type="url"
                className={inputClass}
                placeholder="https://example.dev"
                value={form.portfolioUrl}
                onChange={(e) => update("portfolioUrl", e.target.value)}
              />
            </Field>
          </div>

          <Field label="About / Bio">
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              value={form.about}
              placeholder="Describe your engineering focus, experience, and interests..."
              onChange={(e) => update("about", e.target.value)}
            />
          </Field>

          <Field label="Skills (comma-separated)">
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
            <p className="rounded-lg border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-3 text-xs text-[#F43F5E]">
              {error}
            </p>
          )}

          <div className="pt-2">
            <button
              className="btn-cyan flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold disabled:opacity-50"
              onClick={saveProfile}
              disabled={saving}
            >
              <IconCheck className="h-4 w-4" />
              <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
            </button>
          </div>
        </section>

        {/* Live Profile Card Preview */}
        <aside className="lg:sticky lg:top-20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8B949E] font-mono">
              Live Preview
            </span>
            <span className="tech-tag text-[10px]">SYNCED</span>
          </div>

          <UserCard user={form} />
        </aside>
      </div>

      {/* Success Toast */}
      {saved && (
        <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 rounded-xl border border-[#10B981]/40 bg-[#111418] px-4 py-3 text-xs text-[#10B981] shadow-2xl">
            <IconCheck className="h-4 w-4" />
            <span>Profile successfully updated.</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditProfile;



