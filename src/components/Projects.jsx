import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import Avatar from "./ui/Avatar";
import AccessibleModal from "./ui/Modal";
import { cachedGet, peekResource } from "../utils/resourceCache";
import PageSkeleton from './ui/PageSkeleton';
import {
  IconProjects,
  IconPlus,
  IconExternalLink,
  IconX,
  IconCheck,
  IconSparkles,
  IconActivity,
} from "./ui/Icons";

const inputClass =
  "mt-1 w-full rounded-xl border border-[#293B5B] bg-[#16233D] px-3.5 py-2.5 text-xs text-[#EEF4FF] placeholder-[#7B91B5] outline-none hover:border-[#4C6B94] focus:border-[#82B4FF] transition-colors";

const splitValues = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

function Projects() {
  const currentUser = useSelector((store) => store.user);
  const [projects, setProjects] = useState(() => peekResource('/projects?page=1&limit=12')?.data || []);
  const [loading, setLoading] = useState(() => !peekResource('/projects?page=1&limit=12'));
  const [showCreate, setShowCreate] = useState(false);
  const [applyingTo, setApplyingTo] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [error, setError] = useState("");
  const [filterStage, setFilterStage] = useState("All");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadController = useRef(null);

  const loadProjects = useCallback(async (nextPage = 1, append = false, force = false) => {
    loadController.current?.abort();
    const controller = new AbortController();
    loadController.current = controller;
    setLoadingMore(true);
    try {
      const response = await cachedGet(`/projects?page=${nextPage}&limit=12`, { signal: controller.signal, force });
      if (controller.signal.aborted) return;
      setProjects((previous) =>
        append
          ? [
              ...new Map(
                [...previous, ...response.data.data].map((project) => [
                  project._id,
                  project,
                ]),
              ).values(),
            ]
          : response.data.data,
      );
      setPage(nextPage);
      setHasMore(response.data.data.length === 12);
      setError("");
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(
        err?.response?.data?.message || "Unable to load engineering projects.",
      );
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    loadProjects();
    return () => loadController.current?.abort();
  }, [loadProjects]);

  const filteredProjects = projects.filter(
    (p) => filterStage === "All" || p.stage === filterStage,
  );

  if (loading) {
    return <PageSkeleton label="Loading collaboration projects…" />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#293B5B] pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#EEF4FF] sm:text-3xl">
            Find a problem worth solving.
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#A5B4CE]">
            Small teams. Clear deliverables. Projects you can actually ship.
          </p>
        </div>

        <button
          className="btn-primary flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold"
          onClick={() => setShowCreate(true)}
        >
          <IconPlus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </header>

      {/* Stage filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-[#A5B4CE] mr-1">
          Filter Stage:
        </span>
        {["All", "Idea", "Building", "Launched"].map((stage) => (
          <button
            key={stage}
            onClick={() => setFilterStage(stage)}
            className={`skill-pill cursor-pointer transition-all ${
              filterStage === stage
                ? "skill-pill-active font-semibold shadow-sm"
                : ""
            }`}
          >
            {stage}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-3.5 text-xs text-[#F43F5E]">
          {error}
          <button className="btn-secondary ml-3 px-3 py-2" disabled={loadingMore} onClick={() => loadProjects(1, false, true)}>Try again</button>
        </div>
      )}

      {/* Project Cards Grid */}
      {error && projects.length === 0 ? null : filteredProjects.length === 0 ? (
        <div className="fintech-card rounded-2xl border border-[#293B5B] p-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#293B5B] bg-[#16233D] text-[#A5B4CE] mb-3">
            <IconProjects className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-[#EEF4FF]">
            No projects found
          </h2>
          <p className="mt-1 text-xs text-[#A5B4CE]">
            Start with a problem, a small first deliverable, and the teammates
            you need.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              currentUser={currentUser}
              onApply={setApplyingTo}
              onReview={setReviewing}
              onWithdraw={async (project) => {
                try {
                  await axios.delete(
                    `${BASE_URL}/projects/${project._id}/application`,
                    { withCredentials: true },
                  );
                  loadProjects();
                } catch (e) {
                  setError(e.response?.data?.message || "Unable to withdraw");
                }
              }}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="text-center mt-6">
          <button
            className="btn-secondary px-5 py-3 text-sm"
            disabled={loadingMore}
            onClick={() => loadProjects(page + 1, true)}
          >
            {loadingMore ? "Loading…" : "Load more projects"}
          </button>
          <p className="text-xs text-[#7B91B5] mt-3">
            Stage filters apply to projects loaded so far.
          </p>
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <ProjectForm
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            loadProjects();
          }}
        />
      )}

      {applyingTo && (
        <ApplyModal
          project={applyingTo}
          onClose={() => setApplyingTo(null)}
          onApplied={() => {
            setApplyingTo(null);
            loadProjects();
          }}
        />
      )}

      {reviewing && (
        <ApplicationsModal
          project={reviewing}
          onClose={() => setReviewing(null)}
        />
      )}
    </div>
  );
}

function ProjectCard({ project, currentUser, onApply, onReview, onWithdraw }) {
  const isCreator = project.creator?._id === currentUser?._id;

  const stageMeta = {
    Idea: {
      badge: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    },
    Building: {
      badge: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    },
    Launched: {
      badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    },
  };

  const meta = stageMeta[project.stage] || {
    badge: "border-[#293B5B] bg-[#16233D] text-[#A5B4CE]",
  };

  return (
    <article className="fintech-card flex flex-col justify-between rounded-2xl border border-[#293B5B] p-5 shadow-xl hover:border-[#4C6B94] transition-all">
      <div>
        {/* Stage & Commitment */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.badge}`}
          >
            {project.stage}
          </span>
          <span className="text-[11px] text-[#A5B4CE] font-medium">
            {project.commitment}
          </span>
        </div>

        {/* Title */}
        <h2 className="mt-3 text-base font-bold text-[#EEF4FF] tracking-tight">
          {project.title}
        </h2>

        {/* Description */}
        <p className="mt-2 text-xs leading-relaxed text-[#A5B4CE] line-clamp-3">
          {project.description}
        </p>

        {/* Actual first deliverable; stage is not a completion percentage. */}
        <p className="mt-4 text-xs text-[#A5B4CE]">
          First deliverable:{" "}
          {project.firstDeliverable || "To be agreed by the team"} ·{" "}
          {project.durationWeeks || 4} weeks
        </p>
        {project.isTeamMember && (
          <Link
            className="block mt-3 text-blue-400 text-sm"
            to={`/projects/${project._id}/workspace`}
          >
            Open team workspace →
          </Link>
        )}
        {project.applicationStatus === "pending" && (
          <button
            className="block mt-2 text-sm text-[#A5B4CE]"
            onClick={() => onWithdraw(project)}
          >
            Withdraw application
          </button>
        )}

        {/* Stack tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {(project.techStack || []).map((skill) => (
            <span key={skill} className="skill-pill text-[10px] py-0.5 px-2">
              {skill}
            </span>
          ))}
        </div>

        {/* Roles needed */}
        {project.rolesNeeded?.length > 0 && (
          <div className="mt-4 border-t border-[#293B5B] pt-3">
            <p className="text-[10px] uppercase font-semibold tracking-wider text-[#7B91B5]">
              Roles required
            </p>
            <p className="mt-0.5 text-xs text-[#EEF4FF] font-medium">
              {(project.roleOpenings || [])
                .map((o) => `${o.title}: ${o.seats - o.filled} open`)
                .join(" · ") || project.rolesNeeded.join(" · ")}
            </p>
          </div>
        )}
      </div>

      {/* Creator & Action bottom bar */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#293B5B] pt-3.5">
        <div className="flex items-center gap-2.5 text-xs text-[#A5B4CE] min-w-0">
          <Avatar user={project.creator} className="h-7 w-7 shrink-0" />
          <span className="truncate font-medium">
            {project.creator?.firstName} {project.creator?.lastName}
          </span>
        </div>

        {isCreator ? (
          <button
            className="btn-secondary px-3 py-1.5 text-xs font-semibold text-[#82B4FF]"
            onClick={() => onReview(project)}
          >
            Applicants ({project.applicationsCount || 0})
          </button>
        ) : (
          <button
            disabled={project.hasApplied}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              project.hasApplied
                ? "bg-[#16233D] text-[#7B91B5] border border-[#293B5B] cursor-not-allowed"
                : "btn-primary"
            }`}
            onClick={() => onApply(project)}
          >
            {project.hasApplied ? "Applied" : "Apply"}
          </button>
        )}
      </div>
    </article>
  );
}

function ProjectForm({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    techStack: "",
    rolesNeeded: "",
    stage: "Idea",
    commitment: "Flexible",
    githubUrl: "",
    firstDeliverable: "",
    durationWeeks: 4,
    seatsPerRole: 1,
    goal: "Ship a portfolio project",
  });
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (publishing) return;
    setPublishing(true);
    setError("");
    try {
      await axios.post(
        `${BASE_URL}/projects`,
        {
          ...form,
          techStack: splitValues(form.techStack),
          rolesNeeded: splitValues(form.rolesNeeded),
          roleOpenings: splitValues(form.rolesNeeded).map((title) => ({
            title,
            seats: Number(form.seatsPerRole),
          })),
          durationWeeks: Number(form.durationWeeks),
        },
        { withCredentials: true },
      );
      onCreated();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to post your project.");
    } finally {
      setPublishing(false);
    }
  };

  const update = (field) => (event) =>
    setForm({ ...form, [field]: event.target.value });

  return (
    <Modal title="Start a project" onClose={onClose}>
      <form className="space-y-4" onSubmit={submit}>
        <Field label="First deliverable">
          <input
            className={inputClass}
            maxLength={500}
            value={form.firstDeliverable}
            onChange={update("firstDeliverable")}
            placeholder="A working login flow with tests"
          />
        </Field>
        <Field label="COLLABORATION GOAL">
          <select
            className={inputClass}
            value={form.goal}
            onChange={update("goal")}
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
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="DURATION (WEEKS)">
            <input
              className={inputClass}
              required
              type="number"
              min={1}
              max={52}
              value={form.durationWeeks}
              onChange={update("durationWeeks")}
            />
          </Field>
          <Field label="SEATS PER ROLE">
            <input
              className={inputClass}
              required
              type="number"
              min={1}
              max={10}
              value={form.seatsPerRole}
              onChange={update("seatsPerRole")}
            />
          </Field>
        </div>
        <Field label="Project title">
          <input
            className={inputClass}
            value={form.title}
            minLength={5}
            maxLength={100}
            onChange={update("title")}
            placeholder="e.g. Distributed Vector Store in Go"
            required
          />
        </Field>
        <Field label="What are you building?">
          <textarea
            className={`${inputClass} min-h-28`}
            value={form.description}
            minLength={20}
            maxLength={2000}
            onChange={update("description")}
            placeholder="Explain the architecture, tech constraints, and role requirements."
            required
          />
        </Field>
        <Field label="Tech stack, separated by commas">
          <input
            className={inputClass}
            value={form.techStack}
            onChange={update("techStack")}
            placeholder="React, TypeScript, Go, PostgreSQL"
            required
          />
        </Field>
        <Field label="Roles needed, separated by commas">
          <input
            className={inputClass}
            value={form.rolesNeeded}
            onChange={update("rolesNeeded")}
            placeholder="Frontend Lead, Systems Engineer"
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="BUILD STAGE">
            <select
              className={inputClass}
              value={form.stage}
              onChange={update("stage")}
            >
              <option>Idea</option>
              <option>Building</option>
              <option>Launched</option>
            </select>
          </Field>
          <Field label="TIME COMMITMENT">
            <select
              className={inputClass}
              value={form.commitment}
              onChange={update("commitment")}
            >
              <option>Flexible</option>
              <option>5 hrs/week</option>
              <option>10 hrs/week</option>
              <option>20+ hrs/week</option>
            </select>
          </Field>
        </div>
        <Field label="GITHUB REPO URL (OPTIONAL)">
          <input
            className={inputClass}
            value={form.githubUrl}
            onChange={update("githubUrl")}
            placeholder="https://github.com/organization/repo"
          />
        </Field>
        {error && (
          <p className="rounded-xl border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-3 text-xs text-[#F43F5E]">
            {error}
          </p>
        )}
        <button
          className="btn-primary w-full py-2.5 text-xs font-bold"
          type="submit"
          disabled={publishing}
        >
          {publishing ? "Publishing…" : "Publish project"}
        </button>
      </form>
    </Modal>
  );
}

function ApplyModal({ project, onClose, onApplied }) {
  const [message, setMessage] = useState("");
  const [role, setRole] = useState(project.rolesNeeded[0]);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    try {
      await axios.post(
        `${BASE_URL}/projects/${project._id}/apply`,
        { message, role },
        { withCredentials: true },
      );
      onApplied();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Unable to send your application.",
      );
    }
  };

  return (
    <Modal title={`Apply to ${project.title}`} onClose={onClose}>
      <form className="space-y-4" onSubmit={submit}>
        <Field label="ROLE">
          <select
            className={inputClass}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {project.rolesNeeded.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
        <p className="text-xs text-[#A5B4CE]">
          State your technical domain background and how you can contribute to
          this project.
        </p>
        <textarea
          className={`${inputClass} min-h-28`}
          value={message}
          maxLength="500"
          onChange={(event) => setMessage(event.target.value)}
          placeholder="I have experience with distributed systems and would love to build..."
        />
        {error && (
          <p className="rounded-xl border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-3 text-xs text-[#F43F5E]">
            {error}
          </p>
        )}
        <button
          className="btn-primary w-full py-2.5 text-xs font-bold"
          type="submit"
        >
          Submit Application
        </button>
      </form>
    </Modal>
  );
}

function ApplicationsModal({ project, onClose }) {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [trial, setTrial] = useState({
    participant: "",
    deliverable: "",
    dueAt: "",
  });
  const invite = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`${BASE_URL}/projects/${project._id}/trials`, trial, {
        withCredentials: true,
      });
      setTrial({ participant: "", deliverable: "", dueAt: "" });
    } catch (e) {
      setError(e.response?.data?.message || "Unable to invite applicant");
    }
  };

  const load = useCallback(async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/projects/${project._id}/applications`,
        {
          withCredentials: true,
        },
      );
      setApplications(response.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load applications.");
    }
  }, [project._id]);

  useEffect(() => {
    let ignore = false;
    const fetchApps = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/projects/${project._id}/applications`,
          {
            withCredentials: true,
          },
        );
        if (!ignore) setApplications(response.data.data);
      } catch (err) {
        if (!ignore)
          setError(
            err?.response?.data?.message || "Unable to load applications.",
          );
      }
    };
    fetchApps();
    return () => {
      ignore = true;
    };
  }, [project._id]);

  const review = async (applicationId, status) => {
    try {
      await axios.patch(
        `${BASE_URL}/projects/${project._id}/applications/${applicationId}`,
        { status },
        { withCredentials: true },
      );
      load();
    } catch {
      setError("Unable to update application.");
    }
  };

  return (
    <Modal title={`Applicants · ${project.title}`} onClose={onClose}>
      <form
        onSubmit={invite}
        className="mb-4 space-y-2 border border-[#293B5B] p-3 rounded-xl"
      >
        <h3 className="font-bold">Invite an applicant to a short trial</h3>
        <label className="block">
          Applicant
          <select
            required
            className={inputClass}
            value={trial.participant}
            onChange={(e) =>
              setTrial({ ...trial, participant: e.target.value })
            }
          >
            <option value="">Choose pending applicant</option>
            {applications
              .filter((a) => a.status === "pending")
              .map((a) => (
                <option key={a._id} value={a.user?._id}>
                  {a.user?.firstName} · {a.role || project.rolesNeeded[0]}
                </option>
              ))}
          </select>
        </label>
        <label className="block">
          Small deliverable
          <input
            required
            minLength={5}
            maxLength={1000}
            className={inputClass}
            value={trial.deliverable}
            onChange={(e) =>
              setTrial({ ...trial, deliverable: e.target.value })
            }
          />
        </label>
        <label className="block">
          Deadline within 14 days
          <input
            required
            type="date"
            className={inputClass}
            value={trial.dueAt}
            onChange={(e) => setTrial({ ...trial, dueAt: e.target.value })}
          />
        </label>
        <button className="btn-secondary p-2">Send trial invitation</button>
      </form>
      {error && (
        <p className="mb-4 rounded-xl border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-3 text-xs text-[#F43F5E]">
          {error}
        </p>
      )}
      {applications.length === 0 ? (
        <p className="text-xs text-[#7B91B5] text-center py-6">
          No applications received yet.
        </p>
      ) : (
        <div className="space-y-3">
          {applications.map((application) => (
            <div
              key={application._id}
              className="rounded-xl border border-[#293B5B] bg-[#16233D] p-4"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  user={application.user}
                  className="h-10 w-10 shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-[#EEF4FF]">
                    {application.user?.firstName} {application.user?.lastName}
                  </p>
                  <p className="text-[11px] text-[#A5B4CE]">
                    {application.user?.skills?.join(" · ")}
                  </p>
                </div>
                <span
                  className={`ml-auto text-[10px] font-bold uppercase rounded-md px-2 py-0.5 border ${
                    application.status === "accepted"
                      ? "text-[#10B981] border-[#10B981]/30 bg-[#10B981]/10"
                      : application.status === "rejected"
                        ? "text-[#F43F5E] border-[#F43F5E]/30 bg-[#F43F5E]/10"
                        : "text-[#82B4FF] border-[#82B4FF]/30 bg-[#82B4FF]/10"
                  }`}
                >
                  {application.status}
                </span>
              </div>
              {application.message && (
                <p className="mt-3 rounded-lg border border-[#293B5B] bg-[#101A2E] p-2.5 text-xs text-[#A5B4CE]">
                  {application.message}
                </p>
              )}
              {application.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button
                    className="btn-primary px-3 py-1.5 text-xs"
                    onClick={() => review(application._id, "accepted")}
                  >
                    Accept Candidate
                  </button>
                  <button
                    className="btn-secondary px-3 py-1.5 text-xs text-[#F43F5E] hover:border-[#F43F5E]/30"
                    onClick={() => review(application._id, "rejected")}
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

function Modal({ title, children, onClose }) {
  const close = useCallback(() => onClose(), [onClose]);
  return (
    <AccessibleModal label={title} onClose={close} className="p-6">
      <div className="mb-5 flex items-center justify-between border-b border-[#293B5B] pb-3">
        <h2 className="text-base font-bold text-[#EEF4FF]">{title}</h2>
        <button
          className="flex h-7 w-7 items-center justify-center rounded-xl border border-[#293B5B] text-[#A5B4CE] hover:border-[#4C6B94] hover:text-[#EEF4FF]"
          onClick={onClose}
          aria-label="Close"
        >
          <IconX className="h-4 w-4" />
        </button>
      </div>
      {children}
    </AccessibleModal>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A5B4CE]">
      {label}
      {children}
    </label>
  );
}

export default Projects;
