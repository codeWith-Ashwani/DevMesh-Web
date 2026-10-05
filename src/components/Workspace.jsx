import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import Avatar from "./ui/Avatar";
const options = { withCredentials: true };
const input =
  "block w-full bg-[#16233D] border border-[#293B5B] rounded-xl p-2 mt-1";
export default function Workspace() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((s) => s.user);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [milestone, setMilestone] = useState({
    title: "",
    definitionOfDone: "",
    assignee: "",
    dueAt: "",
  });
  const [checkIn, setCheckIn] = useState({
    completed: "",
    blockers: "",
    next: "",
  });
  const [showcase, setShowcase] = useState({ demoUrl: "", outcome: "" });
  const [evidence, setEvidence] = useState({});
  const [matches, setMatches] = useState([]);
  const load = useCallback(async () => {
    const response = await axios.get(
      `${BASE_URL}/projects/${projectId}/workspace`,
      options,
    );
    setData(response.data.data);
  }, [projectId]);
  useEffect(() => {
    let alive = true;
    axios
      .get(`${BASE_URL}/projects/${projectId}/workspace`, options)
      .then((r) => {
        if (alive) setData(r.data.data);
      })
      .catch((e) => {
        if (alive)
          setError(
            e.response?.data?.message || "Unable to load team workspace",
          );
      });
    return () => {
      alive = false;
    };
  }, [projectId]);
  const perform = async (fn) => {
    setBusy(true);
    setError("");
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to save changes");
    } finally {
      setBusy(false);
    }
  };
  const chat = () =>
    perform(async () => {
      const response = await axios.post(
        `${BASE_URL}/conversations/project/${projectId}`,
        {},
        options,
      );
      navigate(`/messages/${response.data.data._id}`);
    });
  const find = () =>
    perform(async () => {
      const response = await axios.get(
        `${BASE_URL}/projects/${projectId}/collaborators`,
        options,
      );
      setMatches(response.data.data);
    });
  if (!data)
    return (
      <div className="p-6" role="status">
        {error || "Loading workspace…"}
      </div>
    );
  const owner = data.project.creator === user?._id;
  const membershipControls = (
    <div className="flex flex-wrap gap-3">
      {owner ? (
        data.members
          .filter((m) => m._id !== user?._id)
          .map((m) => (
            <button
              key={m._id}
              disabled={busy}
              className="text-sm text-red-300"
              onClick={() =>
                perform(() =>
                  axios.delete(
                    `${BASE_URL}/projects/${projectId}/team/${m._id}`,
                    options,
                  ),
                )
              }
            >
              Remove {m.firstName} from team
            </button>
          ))
      ) : (
        <button
          className="text-sm text-red-300"
          onClick={async () => {
            try {
              await axios.delete(
                `${BASE_URL}/projects/${projectId}/team/${user._id}`,
                options,
              );
              navigate("/projects");
            } catch (e) {
              setError(e.response?.data?.message || "Unable to leave team");
            }
          }}
        >
          Leave project team
        </button>
      )}
    </div>
  );
  return (
    <div className="page-wrap text-[#EEF4FF] space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">{data.project.title}</h1>
          <p className="text-[#A5B4CE] mt-2">
            First deliverable:{" "}
            {data.project.firstDeliverable ||
              "Agree on your first milestone together"}
          </p>
        </div>
        <button disabled={busy} onClick={chat} className="btn-primary p-3">
          Open team group chat
        </button>
      </header>
      <details className="text-sm text-[#A5B4CE]">
        <summary>Manage team membership</summary>
        <div className="mt-3">{membershipControls}</div>
      </details>
      {error && (
        <p role="alert" className="bg-red-950 text-red-200 p-3 rounded-xl">
          {error}
        </p>
      )}
      <section className="workbench-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold">Your team</h2>
        <div className="flex flex-wrap gap-4 my-5">
          {data.members.map((member) => (
            <div className="flex items-center gap-3" key={member._id}>
              <Avatar user={member} className="h-9 w-9" />
              <span className="text-sm">
                {member.firstName} {member.lastName}
              </span>
            </div>
          ))}
        </div>
        <div
          role="progressbar"
          aria-label="Completed milestones"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={data.progress}
          className="rounded-full h-1.5 overflow-hidden bg-[#293B5B] mb-3"
        >
          <div
            className="bg-[#82B4FF] h-full"
            style={{ width: data.progress + "%" }}
          />
        </div>
        <p className="text-xs text-[#A5B4CE]">
          {data.progress}% complete across {data.totalMilestones} milestones.
          Code and issue tracking stay in GitHub.
        </p>
        {data.project.githubUrl && (
          <a
            className="text-blue-400"
            target="_blank"
            rel="noreferrer"
            href={data.project.githubUrl}
          >
            Open repository ↗
          </a>
        )}
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3">
          Milestones and contribution evidence
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {data.milestones.map((m) => (
            <article
              key={m._id}
              className="border border-[#293B5B] rounded-xl p-4 space-y-2"
            >
              <h3 className="font-bold">{m.title}</h3>
              <p>{m.definitionOfDone}</p>
              <p className="text-sm text-[#A5B4CE]">
                {data.members.find((p) => p._id === m.assignee)?.firstName ||
                  "Former team member"}{" "}
                · {m.status} · Due {new Date(m.dueAt).toLocaleDateString()}
              </p>
              {m.evidenceUrl && (
                <a
                  className="text-blue-400"
                  href={m.evidenceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Contribution evidence ↗
                </a>
              )}
              {(owner || m.assignee === user?._id) &&
                m.status !== "completed" && (
                  <>
                    <input
                      type="url"
                      aria-label={`Evidence for ${m.title}`}
                      className={input}
                      placeholder="Pull request or demo URL"
                      value={evidence[m._id] || ""}
                      onChange={(e) =>
                        setEvidence({ ...evidence, [m._id]: e.target.value })
                      }
                    />
                    <button
                      disabled={busy}
                      className="btn-primary p-2"
                      onClick={() =>
                        perform(() =>
                          axios.patch(
                            `${BASE_URL}/projects/${projectId}/milestones/${m._id}`,
                            {
                              status:
                                m.status === "planned"
                                  ? "building"
                                  : "completed",
                              evidenceUrl: evidence[m._id] || m.evidenceUrl,
                            },
                            options,
                          ),
                        )
                      }
                    >
                      {m.status === "planned"
                        ? "Start milestone"
                        : "Complete with evidence"}
                    </button>
                  </>
                )}
            </article>
          ))}
        </div>
      </section>
      {owner && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            perform(async () => {
              await axios.post(
                `${BASE_URL}/projects/${projectId}/milestones`,
                milestone,
                options,
              );
              setMilestone({
                title: "",
                definitionOfDone: "",
                assignee: "",
                dueAt: "",
              });
            });
          }}
          className="border border-[#293B5B] rounded-xl p-4 space-y-3"
        >
          <h2 className="text-xl font-bold">Plan the next milestone</h2>
          <label className="block">
            Title
            <input
              required
              minLength={3}
              maxLength={100}
              className={input}
              value={milestone.title}
              onChange={(e) =>
                setMilestone({ ...milestone, title: e.target.value })
              }
            />
          </label>
          <label className="block">
            What does done look like?
            <textarea
              required
              minLength={5}
              maxLength={1000}
              className={input}
              value={milestone.definitionOfDone}
              onChange={(e) =>
                setMilestone({ ...milestone, definitionOfDone: e.target.value })
              }
            />
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            <label>
              Assignee
              <select
                required
                className={input}
                value={milestone.assignee}
                onChange={(e) =>
                  setMilestone({ ...milestone, assignee: e.target.value })
                }
              >
                <option value="">Choose a teammate</option>
                {data.members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.firstName} {m.lastName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Deadline
              <input
                required
                type="date"
                className={input}
                value={milestone.dueAt}
                onChange={(e) =>
                  setMilestone({ ...milestone, dueAt: e.target.value })
                }
              />
            </label>
          </div>
          <button disabled={busy} className="btn-primary p-2">
            Create milestone
          </button>
        </form>
      )}
      <section className="grid md:grid-cols-2 gap-4">
        <form
          className="border border-[#293B5B] rounded-xl p-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            perform(async () => {
              await axios.post(
                `${BASE_URL}/projects/${projectId}/check-ins`,
                checkIn,
                options,
              );
              setCheckIn({ completed: "", blockers: "", next: "" });
            });
          }}
        >
          <h2 className="text-xl font-bold">Team check-in</h2>
          {[
            ["completed", "What did you complete?"],
            ["blockers", "What is blocking you?"],
            ["next", "What will you do next?"],
          ].map(([key, label]) => (
            <label key={key} className="block">
              {label}
              <textarea
                required={key !== "blockers"}
                maxLength={1000}
                className={input}
                value={checkIn[key]}
                onChange={(e) =>
                  setCheckIn({ ...checkIn, [key]: e.target.value })
                }
              />
            </label>
          ))}
          <button disabled={busy} className="btn-primary p-2">
            Share update
          </button>
        </form>
        <div className="space-y-3">
          <h2 className="text-xl font-bold">Recent updates</h2>
          {data.checkIns.map((c) => (
            <article
              key={c._id}
              className="border border-[#293B5B] p-3 rounded-xl"
            >
              <p className="font-bold">
                {c.user?.firstName} ·{" "}
                {new Date(c.createdAt).toLocaleDateString()}
              </p>
              <p>Completed: {c.completed}</p>
              <p>Blockers: {c.blockers}</p>
              <p>Next: {c.next}</p>
            </article>
          ))}
        </div>
      </section>
      {owner && (
        <section className="border border-[#293B5B] rounded-xl p-4">
          <h2 className="text-xl font-bold">Find compatible collaborators</h2>
          <button
            disabled={busy}
            className="btn-secondary p-2 my-3"
            onClick={find}
          >
            Find available developers
          </button>
          {matches.map((m) => (
            <p key={m.user._id} className="py-2">
              {m.user.firstName} · {m.score}% fit · {m.reasons.join(" · ")}
            </p>
          ))}
        </section>
      )}
      {owner && (
        <form
          className="border border-[#293B5B] rounded-xl p-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            perform(() =>
              axios.patch(
                `${BASE_URL}/projects/${projectId}/showcase`,
                showcase,
                options,
              ),
            );
          }}
        >
          <h2 className="text-xl font-bold">Publish your shipped outcome</h2>
          <p className="text-sm text-[#A5B4CE]">
            Share what you built and a demo. Publishing marks the project as
            launched.
          </p>
          <label className="block">
            Demo URL
            <input
              required
              type="url"
              maxLength={500}
              className={input}
              value={showcase.demoUrl}
              onChange={(e) =>
                setShowcase({ ...showcase, demoUrl: e.target.value })
              }
            />
          </label>
          <label className="block">
            Outcome and lessons learned
            <textarea
              required
              minLength={10}
              maxLength={2000}
              className={input}
              value={showcase.outcome}
              onChange={(e) =>
                setShowcase({ ...showcase, outcome: e.target.value })
              }
            />
          </label>
          <button disabled={busy} className="btn-primary p-2">
            Publish showcase
          </button>
        </form>
      )}
    </div>
  );
}
