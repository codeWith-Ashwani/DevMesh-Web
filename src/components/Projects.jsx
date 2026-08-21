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
  IconSparkles
} from "./ui/Icons";

const inputClass =
  "mt-1 w-full rounded-lg border border-[#252A30] bg-[#161A1F] px-3.5 py-2 text-xs text-[#F2F4F7] placeholder-[#57606A] outline-none hover:border-[#363E48] focus:border-[#00E5FF] transition-colors";

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
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#252A30] bg-[#111418]">
          <span className="h-4 w-4 rounded-full border-2 border-[#00E5FF] border-t-transparent animate-spin" />
        </div>
        <p className="text-xs text-[#8B949E]">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#252A30] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF]" />
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#00E5FF]">
              Collaborations
            </p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F2F4F7] sm:text-3xl">
            Engineering Projects
          </h1>
          <p className="mt-1 text-xs text-[#8B949E]">
            Assemble cross-functional teams, contribute to open initiatives, and build production apps.
          </p>
        </div>

        <button
          className="btn-cyan flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold"
          onClick={() => setShowCreate(true)}
        >
          <IconPlus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </header>

      {/* Stage filter pills */}
      <div className="mb-6 flex items-center gap-2">
        <span className="font-mono text-[11px] text-[#57606A] mr-1">Stage:</span>
        {["All", "Idea", "Building", "Launched"].map((stage) => (
          <button
            key={stage}
            onClick={() => setFilterStage(stage)}
            className={`tech-tag cursor-pointer transition-colors ${
              filterStage === stage ? "tech-tag-active" : "hover:border-[#363E48] hover:text-[#F2F4F7]"
            }`}
          >
            {stage}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-3 text-xs text-[#F43F5E]">
          {error}
        </div>
      )}

      {/* Project Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-[#252A30] bg-[#111418] p-12 text-center shadow-sm">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[#252A30] bg-[#161A1F] text-[#8B949E] mb-3">
            <IconProjects className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-semibold text-[#F2F4F7]">
            No projects found
          </h2>
          <p className="mt-1 text-xs text-[#8B949E]">
            Be the first to create an engineering project and recruit collaborators.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

  const stageBadge = {
    Idea: "border-[#38BDF8]/30 bg-[#38BDF8]/10 text-[#38BDF8]",
    Building: "border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF]",
    Launched: "border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981]",
  };

  return (
    <article className="surface-card flex flex-col justify-between rounded-xl border border-[#252A30] bg-[#111418] p-5 shadow-lg hover:border-[#363E48]">
      <div>
        {/* Stage & Commitment */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
              stageBadge[project.stage] || "border-[#252A30] bg-[#161A1F] text-[#8B949E]"
            }`}
          >
            {project.stage}
          </span>
          <span className="font-mono text-[11px] text-[#8B949E]">{project.commitment}</span>
        </div>

        {/* Title */}
        <h2 className="mt-3 text-base font-bold text-[#F2F4F7] tracking-tight">{project.title}</h2>

        {/* Description */}
        <p className="mt-2 text-xs leading-relaxed text-[#8B949E] line-clamp-3">
          {project.description}
        </p>

        {/* Stack tags */}
        <div className="mt-4 flex flex-wrap gap-1">
          {project.techStack.map((skill) => (
            <span key={skill} className="tech-tag text-[10px]">
              {skill}
            </span>
          ))}
        </div>

        {/* Roles needed */}
        <div className="mt-4 border-t border-[#252A30] pt-3">
          <p className="font-mono text-[10px] uppercase text-[#57606A]">Roles required</p>
          <p className="mt-0.5 font-mono text-xs text-[#F2F4F7]">
            {project.rolesNeeded.join(" · ")}
          </p>
        </div>
      </div>

      {/* Creator & Action bottom bar */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#252A30] pt-3">
        <div className="flex items-center gap-2 text-xs font-mono text-[#8B949E] min-w-0">
          <img
            className="h-6 w-6 rounded-md border border-[#252A30] object-cover bg-[#0B0D0F] shrink-0"
            src={project.creator?.photoUrl || "https://placehold.co/80x80/161A1F/8B949E?text=DEV"}
            alt=""
          />
          <span className="truncate">
            {project.creator?.firstName} {project.creator?.lastName}
          </span>
        </div>

        {isCreator ? (
          <button
            className="btn-secondary px-3 py-1.5 font-mono text-xs text-[#00E5FF]"
            onClick={() => onReview(project)}
          >
            Applicants ({project.applicationsCount || 0})
          </button>
        ) : (
          <button
            disabled={project.hasApplied}
            className={`px-3 py-1.5 font-mono text-xs font-bold rounded-lg transition-all ${
              project.hasApplied
                ? "bg-[#161A1F] text-[#57606A] border border-[#252A30] cursor-not-allowed"
                : "btn-cyan"
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
            placeholder="Explain the problem architecture, tech constraints, and what assistance is needed."
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
          <p className="rounded-lg border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-3 font-mono text-xs text-[#F43F5E]">
            {error}
          </p>
        )}
        <button className="btn-cyan w-full py-2.5 font-mono text-xs font-bold" type="submit">
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
        <p className="font-mono text-xs text-[#8B949E]">
          State your technical domain background and how you can contribute to this project.
        </p>
        <textarea
          className={`${inputClass} min-h-28`}
          value={message}
          maxLength="500"
          onChange={(event) => setMessage(event.target.value)}
          placeholder="I have experience with Go concurrency and would love to build..."
        />
        {error && (
          <p className="rounded-lg border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-3 font-mono text-xs text-[#F43F5E]">
            {error}
          </p>
        )}
        <button className="btn-cyan w-full py-2.5 font-mono text-xs font-bold" type="submit">
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
        <p className="mb-4 rounded-lg border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-3 font-mono text-xs text-[#F43F5E]">
          {error}
        </p>
      )}
      {applications.length === 0 ? (
        <p className="font-mono text-xs text-[#57606A] text-center py-6">No applications received yet.</p>
      ) : (
        <div className="space-y-3">
          {applications.map((application) => (
            <div
              key={application._id}
              className="rounded-lg border border-[#252A30] bg-[#161A1F] p-4"
            >
              <div className="flex items-center gap-3">
                <img
                  className="h-9 w-9 rounded-lg border border-[#252A30] object-cover bg-[#0B0D0F]"
                  src={application.user?.photoUrl || "https://placehold.co/80x80/161A1F/8B949E?text=DEV"}
                  alt=""
                />
                <div>
                  <p className="text-xs font-bold text-[#F2F4F7]">
                    {application.user?.firstName} {application.user?.lastName}
                  </p>
                  <p className="font-mono text-[10px] text-[#57606A]">
                    {application.user?.skills?.join(" · ")}
                  </p>
                </div>
                <span
                  className={`ml-auto font-mono text-[10px] font-bold uppercase ${
                    application.status === "accepted"
                      ? "text-[#10B981]"
                      : application.status === "rejected"
                      ? "text-[#F43F5E]"
                      : "text-[#00E5FF]"
                  }`}
                >
                  {application.status}
                </span>
              </div>
              {application.message && (
                <p className="mt-3 rounded border border-[#252A30] bg-[#111418] p-2.5 text-xs text-[#8B949E] font-mono">
                  {application.message}
                </p>
              )}
              {application.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button
                    className="btn-cyan px-3 py-1.5 font-mono text-[11px]"
                    onClick={() => review(application._id, "accepted")}
                  >
                    Accept Candidate
                  </button>
                  <button
                    className="btn-secondary px-3 py-1.5 font-mono text-[11px] text-[#F43F5E] hover:border-[#F43F5E]/30"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-[#252A30] bg-[#111418] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-[#252A30] pb-3">
          <h2 className="text-base font-bold text-[#F2F4F7] font-mono">{title}</h2>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#252A30] text-[#8B949E] hover:border-[#363E48] hover:text-[#F2F4F7]"
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
    <label className="block font-mono text-[11px] text-[#8B949E]">
      {label}
      {children}
    </label>
  );
}

export default Projects;

