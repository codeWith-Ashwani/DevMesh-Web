import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";

const inputClass = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
const splitValues = (value) => value.split(",").map((item) => item.trim()).filter(Boolean);

function Projects() {
  const currentUser = useSelector((store) => store.user);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [applyingTo, setApplyingTo] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [error, setError] = useState("");

  const loadProjects = useCallback(async () => {
    try { const response = await axios.get(`${BASE_URL}/projects`, { withCredentials: true }); setProjects(response.data.data); setError(""); }
    catch (err) { setError(err?.response?.data?.message || "Unable to load projects."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadProjects(); }, [loadProjects]);

  if (loading) return <div className="flex justify-center py-24"><span className="loading loading-spinner loading-lg text-blue-600" /></div>;
  return <main className="mx-auto max-w-6xl px-5 py-10"><header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-widest text-pink-500">Collaboration board</p><h1 className="mt-1 text-3xl font-extrabold text-slate-900 sm:text-4xl">Build something worth sharing.</h1><p className="mt-2 max-w-xl text-slate-500">Find teammates, turn an idea into a project, and grow your developer network.</p></div><button className="brand-gradient rounded-xl px-5 py-3 font-bold text-white shadow-lg shadow-pink-200 hover:-translate-y-0.5" onClick={() => setShowCreate(true)}>Post a project</button></header>{error && <p className="mt-6 rounded-xl bg-pink-50 p-4 text-pink-700">{error}</p>}{projects.length === 0 ? <div className="mt-10 rounded-3xl border border-blue-100 bg-white p-12 text-center soft-card"><p className="font-mono text-4xl text-blue-600">&lt;/&gt;</p><h2 className="mt-4 text-2xl font-bold text-slate-900">Be the first to start something.</h2><p className="mt-2 text-slate-500">Share an idea and find developers to build it with.</p></div> : <section className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <ProjectCard key={project._id} project={project} currentUser={currentUser} onApply={setApplyingTo} onReview={setReviewing} />)}</section>}{showCreate && <ProjectForm onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadProjects(); }} />}{applyingTo && <ApplyModal project={applyingTo} onClose={() => setApplyingTo(null)} onApplied={() => { setApplyingTo(null); loadProjects(); }} />}{reviewing && <ApplicationsModal project={reviewing} onClose={() => setReviewing(null)} />}</main>;
}

function ProjectCard({ project, currentUser, onApply, onReview }) {
  const isCreator = project.creator?._id === currentUser?._id;
  return <article className="soft-card flex flex-col rounded-3xl border border-blue-100 bg-white p-6"><div className="flex items-start justify-between gap-3"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{project.stage}</span><span className="text-xs font-semibold text-slate-500">{project.commitment}</span></div><h2 className="mt-4 text-xl font-bold text-slate-900">{project.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{project.description}</p><div className="mt-4 flex flex-wrap gap-2">{project.techStack.map((skill) => <span key={skill} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{skill}</span>)}</div><div className="mt-4 border-t border-blue-100 pt-4"><p className="text-xs font-bold uppercase tracking-wider text-pink-500">Roles needed</p><p className="mt-1 text-sm font-medium text-slate-700">{project.rolesNeeded.join(" · ")}</p></div><div className="mt-auto flex items-center justify-between gap-3 pt-5"><div className="flex items-center gap-2 text-sm text-slate-500"><img className="h-7 w-7 rounded-full object-cover" src={project.creator?.photoUrl} alt="" /><span>{project.creator?.firstName} {project.creator?.lastName}</span></div>{isCreator ? <button className="rounded-xl border border-blue-200 px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50" onClick={() => onReview(project)}>Applicants ({project.applicationsCount})</button> : <button disabled={project.hasApplied} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300" onClick={() => onApply(project)}>{project.hasApplied ? "Applied" : "Apply"}</button>}</div></article>;
}

function ProjectForm({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", description: "", techStack: "", rolesNeeded: "", stage: "Idea", commitment: "Flexible", githubUrl: "" });
  const [error, setError] = useState("");
  const submit = async (event) => { event.preventDefault(); try { await axios.post(`${BASE_URL}/projects`, { ...form, techStack: splitValues(form.techStack), rolesNeeded: splitValues(form.rolesNeeded) }, { withCredentials: true }); onCreated(); } catch (err) { setError(err?.response?.data?.message || "Unable to post your project."); } };
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });
  return <Modal title="Post a collaboration project" onClose={onClose}><form className="space-y-4" onSubmit={submit}><Field label="Project title"><input className={inputClass} value={form.title} onChange={update("title")} placeholder="e.g. Open-source study planner" required /></Field><Field label="What are you building?"><textarea className={`${inputClass} min-h-32`} value={form.description} onChange={update("description")} placeholder="Explain the idea, the problem it solves, and what you need help with." required /></Field><Field label="Tech stack (comma separated)"><input className={inputClass} value={form.techStack} onChange={update("techStack")} placeholder="React, Node.js, MongoDB" required /></Field><Field label="Roles needed (comma separated)"><input className={inputClass} value={form.rolesNeeded} onChange={update("rolesNeeded")} placeholder="Frontend developer, UI/UX designer" required /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Project stage"><select className={inputClass} value={form.stage} onChange={update("stage")}><option>Idea</option><option>Building</option><option>Launched</option></select></Field><Field label="Time commitment"><select className={inputClass} value={form.commitment} onChange={update("commitment")}><option>Flexible</option><option>5 hrs/week</option><option>10 hrs/week</option><option>20+ hrs/week</option></select></Field></div><Field label="GitHub URL (optional)"><input className={inputClass} value={form.githubUrl} onChange={update("githubUrl")} placeholder="https://github.com/..." /></Field>{error && <p className="rounded-xl bg-pink-50 p-3 text-sm text-pink-700">{error}</p>}<button className="brand-gradient w-full rounded-xl py-3 font-bold text-white">Publish project</button></form></Modal>;
}

function ApplyModal({ project, onClose, onApplied }) {
  const [message, setMessage] = useState(""); const [error, setError] = useState("");
  const submit = async (event) => { event.preventDefault(); try { await axios.post(`${BASE_URL}/projects/${project._id}/apply`, { message }, { withCredentials: true }); onApplied(); } catch (err) { setError(err?.response?.data?.message || "Unable to send your application."); } };
  return <Modal title={`Apply to ${project.title}`} onClose={onClose}><form className="space-y-4" onSubmit={submit}><p className="text-sm leading-6 text-slate-600">Introduce yourself and explain how you can help this project.</p><textarea className={`${inputClass} min-h-32`} value={message} maxLength="500" onChange={(event) => setMessage(event.target.value)} placeholder="I’d love to help with..." />{error && <p className="rounded-xl bg-pink-50 p-3 text-sm text-pink-700">{error}</p>}<button className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700">Send application</button></form></Modal>;
}

function ApplicationsModal({ project, onClose }) {
  const [applications, setApplications] = useState([]); const [error, setError] = useState("");
  const load = useCallback(async () => { try { const response = await axios.get(`${BASE_URL}/projects/${project._id}/applications`, { withCredentials: true }); setApplications(response.data.data); } catch (err) { setError(err?.response?.data?.message || "Unable to load applications."); } }, [project._id]);
  useEffect(() => { load(); }, [load]);
  const review = async (applicationId, status) => { try { await axios.patch(`${BASE_URL}/projects/${project._id}/applications/${applicationId}`, { status }, { withCredentials: true }); load(); } catch (err) { setError("Unable to update application."); } };
  return <Modal title={`Applicants · ${project.title}`} onClose={onClose}>{error && <p className="mb-4 rounded-xl bg-pink-50 p-3 text-sm text-pink-700">{error}</p>}{applications.length === 0 ? <p className="text-slate-500">No applications yet.</p> : <div className="space-y-3">{applications.map((application) => <div key={application._id} className="rounded-2xl border border-blue-100 p-4"><div className="flex items-center gap-3"><img className="h-10 w-10 rounded-xl object-cover" src={application.user?.photoUrl} alt="" /><div><p className="font-bold text-slate-900">{application.user?.firstName} {application.user?.lastName}</p><p className="text-xs text-slate-500">{application.user?.skills?.join(" · ")}</p></div><span className="ml-auto text-xs font-bold uppercase text-pink-500">{application.status}</span></div>{application.message && <p className="mt-3 text-sm text-slate-600">{application.message}</p>}{application.status === "pending" && <div className="mt-3 flex gap-2"><button className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white" onClick={() => review(application._id, "accepted")}>Accept</button><button className="rounded-lg border border-pink-200 px-3 py-2 text-sm font-bold text-pink-600" onClick={() => review(application._id, "rejected")}>Decline</button></div>}</div>)}</div>}</Modal>;
}

function Modal({ title, children, onClose }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4"><section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="mb-6 flex items-start justify-between gap-4"><h2 className="text-2xl font-bold text-slate-900">{title}</h2><button className="rounded-lg px-2 text-2xl text-slate-400 hover:bg-slate-100" onClick={onClose} aria-label="Close">×</button></div>{children}</section></div>; }
function Field({ label, children }) { return <label className="block text-sm font-semibold text-slate-700">{label}{children}</label>; }

export default Projects;
