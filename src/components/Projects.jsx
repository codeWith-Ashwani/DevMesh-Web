import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import {
  IconProjects,
  IconPlus,
  IconExternalLink,
  IconX,
  IconCheck,
  IconSparkles,
  IconActivity
} from "./ui/Icons";

const inputClass =
  "mt-1 w-full rounded-xl border border-[#1E2442] bg-[#11152A] px-3.5 py-2.5 text-xs text-[#F5F7FF] placeholder-[#515870] outline-none hover:border-[#2A335C] focus:border-[#3B82F6] transition-colors";

const splitValues = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

function Projects() {
  const currentUser = useSelector((store) => store.user);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [applyingTo, setApplyingTo] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [error, setError] = useState("");
  const [filterStage, setFilterStage] = useState("All");

  const loadProjects = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/projects`, { withCredentials: true });
      setProjects(response.data.data);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load engineering projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filteredProjects = projects.filter(
    (p) => filterStage === "All" || p.stage === filterStage
  );

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1E2442] bg-[#0D1020] shadow-xl">
          <span className="h-5 w-5 rounded-full border-2 border-[#3B82F6] border-t-transparent animate-spin" />
        </div>
        <p className="text-xs font-medium text-[#8B91A7]">Loading collaboration projects...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#1E2442] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="status-dot-blue" />
            <p className="text-xs uppercase font-bold tracking-wider text-[#3B82F6]">
              Collaborations &amp; Initiatives
            </p>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#F5F7FF] sm:text-3xl">
            Engineering Projects
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#8B91A7]">
            Assemble cross-functional teams, contribute to open initiatives, and build production apps.
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
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-[#8B91A7] mr-1">Filter Stage:</span>
        {["All", "Idea", "Building", "Launched"].map((stage) => (
          <button
            key={stage}
            onClick={() => setFilterStage(stage)}
            className={`skill-pill cursor-pointer transition-all ${
              filterStage === stage ? "skill-pill-active font-semibold shadow-sm" : ""
            }`}
          >
            {stage}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-3.5 text-xs text-[#F43F5E]">
          {error}
        </div>
      )}

      {/* Project Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div className="fintech-card rounded-2xl border border-[#1E2442] p-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1E2442] bg-[#11152A] text-[#8B91A7] mb-3">
            <IconProjects className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-[#F5F7FF]">
            No projects found
          </h2>
          <p className="mt-1 text-xs text-[#8B91A7]">
            Be the first to initialize an engineering initiative and recruit collaborators.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              currentUser={currentUser}
              onApply={setApplyingTo}
              onReview={setReviewing}
            />
          ))}
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

function ProjectCard({ project, currentUser, onApply, onReview }) {
  const isCreator = project.creator?._id === currentUser?._id;

  const stageMeta = {
    Idea: { progress: 25, color: "from-sky-500 to-cyan-400", badge: "border-sky-500/30 bg-sky-500/10 text-sky-400" },
    Building: { progress: 65, color: "from-blue-600 to-indigo-500", badge: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
    Launched: { progress: 100, color: "from-emerald-500 to-teal-400", badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
  };

  const meta = stageMeta[project.stage] || { progress: 40, color: "from-blue-600 to-cyan-400", badge: "border-[#1E2442] bg-[#11152A] text-[#8B91A7]" };

  return (
    <article className="fintech-card flex flex-col justify-between rounded-2xl border border-[#1E2442] p-5 shadow-xl hover:border-[#2A335C] transition-all">
      <div>
        {/* Stage & Commitment */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.badge}`}
          >
            {project.stage}
          </span>
          <span className="text-[11px] text-[#8B91A7] font-medium">{project.commitment}</span>
        </div>

        {/* Title */}
        <h2 className="mt-3 text-base font-bold text-[#F5F7FF] tracking-tight">{project.title}</h2>

        {/* Description */}
        <p className="mt-2 text-xs leading-relaxed text-[#8B91A7] line-clamp-3">
          {project.description}
        </p>

        {/* Visual Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-medium text-[#8B91A7]">
            <span>Milestone Progress</span>
            <span className="font-mono text-[#F5F7FF] font-bold">{meta.progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#11152A] border border-[#1E2442]">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${meta.color}`}
              style={{ width: `${meta.progress}%` }}
            />
          </div>
        </div>

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
          <div className="mt-4 border-t border-[#1E2442] pt-3">
            <p className="text-[10px] uppercase font-semibold tracking-wider text-[#515870]">Roles required</p>
            <p className="mt-0.5 text-xs text-[#F5F7FF] font-medium">
              {project.rolesNeeded.join(" · ")}
            </p>
          </div>
        )}
      </div>

      {/* Creator & Action bottom bar */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#1E2442] pt-3.5">
        <div className="flex items-center gap-2.5 text-xs text-[#8B91A7] min-w-0">
          <img
            className="h-6 w-6 rounded-lg border border-[#1E2442] object-cover bg-[#0D1020] shrink-0"
            src={project.creator?.photoUrl || "https://placehold.co/80x80/11152A/8B91A7?text=DEV"}
            alt=""
          />
          <span className="truncate font-medium">
            {project.creator?.firstName} {project.creator?.lastName}
          </span>
        </div>

        {isCreator ? (
          <button
            className="btn-secondary px-3 py-1.5 text-xs font-semibold text-[#3B82F6]"
            onClick={() => onReview(project)}
          >
            Applicants ({project.applicationsCount || 0})
          </button>
        ) : (
          <button
            disabled={project.hasApplied}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              project.hasApplied
                ? "bg-[#11152A] text-[#515870] border border-[#1E2442] cursor-not-allowed"
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
  });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    try {
      await axios.post(
        `${BASE_URL}/projects`,
        {
          ...form,
          techStack: splitValues(form.techStack),
          rolesNeeded: splitValues(form.rolesNeeded),
        },
        { withCredentials: true }
      );
      onCreated();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to post your project.");
    }
  };

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  return (
    <Modal title="Initialize Collaboration Project" onClose={onClose}>
      <form className="space-y-4" onSubmit={submit}>
        <Field label="PROJECT TITLE">
          <input
            className={inputClass}
            value={form.title}
            onChange={update("title")}
            placeholder="e.g. Distributed Vector Store in Go"
            required
          />
        </Field>
        <Field label="TECHNICAL SPECIFICATION & OVERVIEW">
          <textarea
            className={`${inputClass} min-h-28`}
            value={form.description}
            onChange={update("description")}
            placeholder="Explain the architecture, tech constraints, and role requirements."
            required
          />
        </Field>
        <Field label="TECH STACK (COMMA SEPARATED)">
          <input
            className={inputClass}
            value={form.techStack}
            onChange={update("techStack")}
            placeholder="React, TypeScript, Go, PostgreSQL"
            required
          />
        </Field>
        <Field label="ROLES SOUGHT (COMMA SEPARATED)">
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
            <select className={inputClass} value={form.stage} onChange={update("stage")}>
              <option>Idea</option>
              <option>Building</option>
              <option>Launched</option>
            </select>
          </Field>
          <Field label="TIME COMMITMENT">
            <select className={inputClass} value={form.commitment} onChange={update("commitment")}>
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
        <button className="btn-primary w-full py-2.5 text-xs font-bold" type="submit">
          Publish Project to Registry
        </button>
      </form>
    </Modal>
  );
}

function ApplyModal({ project, onClose, onApplied }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    try {
      await axios.post(
        `${BASE_URL}/projects/${project._id}/apply`,
        { message },
        { withCredentials: true }
      );
      onApplied();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to send your application.");
    }
  };

  return (
    <Modal title={`Apply to ${project.title}`} onClose={onClose}>
      <form className="space-y-4" onSubmit={submit}>
        <p className="text-xs text-[#8B91A7]">
          State your technical domain background and how you can contribute to this project.
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
        <button className="btn-primary w-full py-2.5 text-xs font-bold" type="submit">
          Submit Application
        </button>
      </form>
    </Modal>
  );
}

function ApplicationsModal({ project, onClose }) {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/projects/${project._id}/applications`, {
        withCredentials: true,
      });
      setApplications(response.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load applications.");
    }
  }, [project._id]);

  useEffect(() => {
    let ignore = false;
    const fetchApps = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/projects/${project._id}/applications`, {
          withCredentials: true,
        });
        if (!ignore) setApplications(response.data.data);
      } catch (err) {
        if (!ignore) setError(err?.response?.data?.message || "Unable to load applications.");
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
        { withCredentials: true }
      );
      load();
    } catch {
      setError("Unable to update application.");
    }
  };

  return (
    <Modal title={`Applicants · ${project.title}`} onClose={onClose}>
      {error && (
        <p className="mb-4 rounded-xl border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-3 text-xs text-[#F43F5E]">
          {error}
        </p>
      )}
      {applications.length === 0 ? (
        <p className="text-xs text-[#515870] text-center py-6">No applications received yet.</p>
      ) : (
        <div className="space-y-3">
          {applications.map((application) => (
            <div
              key={application._id}
              className="rounded-xl border border-[#1E2442] bg-[#11152A] p-4"
            >
              <div className="flex items-center gap-3">
                <img
                  className="h-9 w-9 rounded-xl border border-[#1E2442] object-cover bg-[#0D1020]"
                  src={application.user?.photoUrl || "https://placehold.co/80x80/11152A/8B91A7?text=DEV"}
                  alt=""
                />
                <div>
                  <p className="text-xs font-bold text-[#F5F7FF]">
                    {application.user?.firstName} {application.user?.lastName}
                  </p>
                  <p className="text-[11px] text-[#8B91A7]">
                    {application.user?.skills?.join(" · ")}
                  </p>
                </div>
                <span
                  className={`ml-auto text-[10px] font-bold uppercase rounded-md px-2 py-0.5 border ${
                    application.status === "accepted"
                      ? "text-[#10B981] border-[#10B981]/30 bg-[#10B981]/10"
                      : application.status === "rejected"
                      ? "text-[#F43F5E] border-[#F43F5E]/30 bg-[#F43F5E]/10"
                      : "text-[#3B82F6] border-[#3B82F6]/30 bg-[#3B82F6]/10"
                  }`}
                >
                  {application.status}
                </span>
              </div>
              {application.message && (
                <p className="mt-3 rounded-lg border border-[#1E2442] bg-[#0D1020] p-2.5 text-xs text-[#8B91A7]">
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#1E2442] bg-[#0D1020] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-[#1E2442] pb-3">
          <h2 className="text-base font-bold text-[#F5F7FF]">{title}</h2>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-xl border border-[#1E2442] text-[#8B91A7] hover:border-[#2A335C] hover:text-[#F5F7FF]"
            onClick={onClose}
            aria-label="Close"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8B91A7]">
      {label}
      {children}
    </label>
  );
}

export default Projects;


