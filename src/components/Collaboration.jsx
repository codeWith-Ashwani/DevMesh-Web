import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
const options = { withCredentials: true };
const input =
  "block w-full bg-[#142024] border border-[#26383D] rounded-xl p-3 mt-1";
export default function Collaboration() {
  const navigate = useNavigate();
  const user = useSelector((s) => s.user);
  const [form, setForm] = useState({
    hoursPerWeek: 5,
    durationWeeks: 4,
    goal: "Ship a portfolio project",
    roles: "",
  });
  const [recommendations, setRecommendations] = useState([]);
  const [trials, setTrials] = useState([]);
  const [showcase, setShowcase] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [trialEvidence, setTrialEvidence] = useState({});
  useEffect(() => {
    let alive = true;
    Promise.all([
      axios.get(`${BASE_URL}/collaboration/profile`, options),
      axios.get(`${BASE_URL}/collaboration/trials`, options),
      axios.get(`${BASE_URL}/collaboration/showcase`, options),
    ])
      .then(([profile, trials, showcase]) => {
        if (!alive) return;
        if (profile.data.data) {
          const p = profile.data.data;
          setForm({ ...p, roles: p.roles.join(", ") });
        }
        setTrials(trials.data.data);
        setShowcase(showcase.data.data);
      })
      .catch((e) => {
        if (alive)
          setError(
            e.response?.data?.message || "Unable to load collaboration hub",
          );
      });
    return () => {
      alive = false;
    };
  }, []);
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await axios.put(
        `${BASE_URL}/collaboration/profile`,
        {
          ...form,
          hoursPerWeek: Number(form.hoursPerWeek),
          durationWeeks: Number(form.durationWeeks),
          roles: form.roles
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean),
        },
        options,
      );
      const response = await axios.get(
        `${BASE_URL}/collaboration/recommendations`,
        options,
      );
      setRecommendations(response.data.data);
      setNotice(
        "Availability renewed for 30 days. Matches use your profile skills, time commitment, duration, and preferred roles.",
      );
    } catch (e) {
      setError(e.response?.data?.message || "Unable to save availability");
    } finally {
      setBusy(false);
    }
  };
  const decide = async (trial, action) => {
    try {
      await axios.patch(
        `${BASE_URL}/collaboration/trials/${trial._id}`,
        action,
        options,
      );
      const response = await axios.get(
        `${BASE_URL}/collaboration/trials`,
        options,
      );
      setTrials(response.data.data);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to update trial");
    }
  };
  const trialChat = async (trial) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/conversations/trial/${trial._id}`,
        {},
        options,
      );
      navigate(`/messages/${response.data.data._id}`);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to open trial chat");
    }
  };
  return (
    <div className="page-wrap text-[#EDF4F2] space-y-6">
      <header>
        <p className="eyebrow mb-3">
          // from learning alone to shipping together
        </p>
        <h1 className="page-title">Find your team</h1>
        <p className="text-[#9AADAA] mt-2">
          Find people with compatible skills and commitments. Try a small
          milestone before committing to a bigger project.
        </p>
      </header>
      {error && (
        <p role="alert" className="bg-red-950 text-red-200 p-3 rounded-xl">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-green-300">
          {notice}
        </p>
      )}
      <form
        onSubmit={save}
        className="border border-[#26383D] bg-[#10191C] rounded-2xl p-5 space-y-4"
      >
        <h2 className="text-xl font-bold">Your collaboration availability</h2>
        <p className="text-sm text-[#9AADAA]">
          Availability expires after 30 days. Update your{" "}
          <Link className="text-blue-400" to="/profile">
            profile skills
          </Link>{" "}
          for better matches.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <label>
            Hours per week
            <input
              className={input}
              type="number"
              min={1}
              max={40}
              required
              value={form.hoursPerWeek}
              onChange={(e) =>
                setForm({ ...form, hoursPerWeek: e.target.value })
              }
            />
          </label>
          <label>
            Preferred duration in weeks
            <input
              className={input}
              type="number"
              min={1}
              max={52}
              required
              value={form.durationWeeks}
              onChange={(e) =>
                setForm({ ...form, durationWeeks: e.target.value })
              }
            />
          </label>
          <label>
            Goal
            <select
              className={input}
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
            >
              {[
                "Learn together",
                "Ship a portfolio project",
                "Contribute to open source",
                "Launch a product",
              ].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
          <label>
            Preferred roles, separated by commas
            <input
              className={input}
              maxLength={600}
              value={form.roles}
              onChange={(e) => setForm({ ...form, roles: e.target.value })}
              placeholder="Frontend developer, Backend developer"
            />
          </label>
        </div>
        <button disabled={busy} className="btn-primary p-3">
          {busy ? "Finding matches…" : "Renew availability and find projects"}
        </button>
      </form>
      <section>
        <h2 className="text-xl font-bold mb-3">Suggested projects</h2>
        <p className="text-sm text-[#9AADAA] mb-3">
          Scores describe compatibility, not developer ability. Suggestions rank
          the latest 50 opportunities.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {recommendations.map((p) => (
            <article
              key={p._id}
              className="border border-[#26383D] rounded-xl p-4"
            >
              <h3 className="font-bold">
                {p.title} <span className="text-blue-400">{p.score}% fit</span>
              </h3>
              <p>{p.firstDeliverable}</p>
              <p className="text-sm text-[#9AADAA]">{p.reasons.join(" · ")}</p>
              <p className="text-sm my-2">
                {p.rolesNeeded.join(", ")} · {p.commitment}
              </p>
              <Link className="text-blue-400" to="/projects">
                View openings and apply →
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3">Your collaboration trials</h2>
        <p className="text-sm text-[#9AADAA] mb-3">
          A trial is voluntary and scoped. Both people decide whether to
          continue; team membership still requires project-owner acceptance.
        </p>
        {!trials.length && (
          <p>No trial invitations yet. Apply to a project to get started.</p>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          {trials.map((t) => (
            <article
              key={t._id}
              className="border border-[#26383D] rounded-xl p-4 space-y-2"
            >
              <h3 className="font-bold">
                {t.project?.title || "Project no longer available"}
              </h3>
              <p>{t.deliverable}</p>
              <p className="text-sm">
                Due {new Date(t.dueAt).toLocaleDateString()} · {t.status}
              </p>
              <p className="text-sm text-[#9AADAA]">
                Owner: {t.ownerDecision} · Collaborator: {t.participantDecision}
              </p>
              {t.status === "invited" && t.participant === user?._id && (
                <div className="flex gap-2">
                  <button
                    className="btn-primary p-2"
                    onClick={() => decide(t, { status: "active" })}
                  >
                    Accept invitation
                  </button>
                  <button
                    className="btn-secondary p-2"
                    onClick={() => decide(t, { status: "declined" })}
                  >
                    Decline
                  </button>
                </div>
              )}
              {["active", "completed"].includes(t.status) && (
                <button
                  className="text-blue-400 block"
                  onClick={() => trialChat(t)}
                >
                  Open trial chat
                </button>
              )}
              {t.status === "active" && (
                <label className="block text-sm">
                  Evidence link
                  <input
                    type="url"
                    className={input}
                    value={trialEvidence[t._id] || ""}
                    onChange={(e) =>
                      setTrialEvidence({
                        ...trialEvidence,
                        [t._id]: e.target.value,
                      })
                    }
                  />
                </label>
              )}
              {t.status === "active" &&
                (t.owner === user?._id
                  ? t.ownerDecision
                  : t.participantDecision) === "pending" && (
                  <div className="flex gap-2">
                    <button
                      className="btn-primary p-2"
                      onClick={() =>
                        decide(t, {
                          decision: "continue",
                          evidenceUrl: trialEvidence[t._id] || "",
                        })
                      }
                    >
                      I want to continue
                    </button>
                    <button
                      className="btn-secondary p-2"
                      onClick={() =>
                        decide(t, {
                          decision: "stop",
                          evidenceUrl: trialEvidence[t._id] || "",
                        })
                      }
                    >
                      Finish here
                    </button>
                  </div>
                )}
            </article>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3">Shipped by the community</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {showcase.map((p) => (
            <article
              key={p._id}
              className="border border-[#26383D] p-4 rounded-xl"
            >
              <h3 className="font-bold">{p.title}</h3>
              <p className="my-2 whitespace-pre-wrap">{p.outcome}</p>
              <a
                className="text-blue-400"
                href={p.demoUrl}
                target="_blank"
                rel="noreferrer"
              >
                View demo ↗
              </a>
              {p.githubUrl && (
                <a
                  className="text-blue-400 ml-4"
                  href={p.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Repository ↗
                </a>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
