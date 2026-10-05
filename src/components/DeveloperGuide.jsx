import { useCallback, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GuideAvatar from "./ui/GuideAvatar";
import Modal from "./ui/Modal";
import { IconX, IconChevronRight } from "./ui/Icons";

const steps = [
  {
    path: "/profile",
    title: "Start with your developer profile",
    body: "Add your skills, a short bio, and links to your work. Give future teammates a reason to reach out.",
    action: "Edit my profile",
  },
  {
    path: "/collaborate",
    title: "Find a team that fits your time",
    body: "Set your weekly hours and preferred roles. Project matches explain why your skills and commitment fit.",
    action: "Set my availability",
  },
  {
    path: "/projects",
    title: "Make the first deliverable small",
    body: "Join a project or publish your own. Define one useful deliverable, then try a short collaboration before committing.",
    action: "Explore projects",
  },
  {
    path: "/messages",
    title: "Keep the conversation moving",
    body: "Message your connections one to one, or create a group with accepted collaborators. Project workspaces have their own team chat.",
    action: "Open messages",
  },
];
const tips = {
  "/": {
    title: "A little momentum goes a long way",
    body: "Start with your availability, find a project, and agree on one small thing to ship together.",
    action: "Find my team",
    path: "/collaborate",
  },
  "/feed": {
    title: "Look for complementary skills",
    body: "Search by name, bio, or stack. Send a connection request to someone you would like to build with.",
    action: "Review requests",
    path: "/requests",
  },
  "/connections": {
    title: "Turn a connection into a conversation",
    body: "Use Message to talk about your goals, weekly availability, and the first task you could tackle together.",
    action: "Open messages",
    path: "/messages",
  },
  "/requests": {
    title: "Your network starts here",
    body: "Accept a request to unlock personal chat and group invitations. Review their skills before deciding.",
    action: "See my connections",
    path: "/connections",
  },
  "/profile": steps[0],
  "/collaborate": steps[1],
  "/projects": steps[2],
  "/messages": steps[3],
};
function savedCompanion() {
  try {
    return localStorage.getItem("devmesh.guide") === "pixel"
      ? "pixel"
      : "patch";
  } catch {
    return "patch";
  }
}
export default function DeveloperGuide() {
  const [open, setOpen] = useState(false);
  const [companion, setCompanion] = useState(savedCompanion);
  const [tour, setTour] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const close = useCallback(() => {
    setOpen(false);
    setTour(false);
  }, []);
  const stepIndex = steps.findIndex((step) => location.pathname === step.path);
  const current = location.pathname.includes("/workspace")
    ? {
        title: "Agree on what done looks like",
        body: "Give each milestone an owner, a deadline, and a clear definition of done. Use check-ins to share progress and unblock each other.",
        action: "See other projects",
        path: "/projects",
      }
    : tips["/" + location.pathname.split("/")[1]] || tips["/messages"];
  const tip = tour ? steps[Math.max(stepIndex, 0)] : current;
  const name = companion === "pixel" ? "Pixel" : "Patch";
  const selectCompanion = (value) => {
    setCompanion(value);
    try {
      localStorage.setItem("devmesh.guide", value);
    } catch {
      /* Preference remains available for this session. */
    }
  };
  return (
    <>
      <button
        className="guide-trigger"
        title={`Meet ${name}, your workspace guide`}
        aria-label={`Open ${name}, your workspace guide`}
        onClick={() => setOpen(true)}
      >
        <GuideAvatar variant={companion} className="h-8 w-8" />
        <span className="sr-only">
          <strong className="block text-sm">Meet {name}</strong>
          <span className="text-xs text-[#A5B4CE]">Workspace guide</span>
        </span>
      </button>
      {open && (
        <Modal label="Workspace guide" onClose={close} className="guide-panel">
          <div className="flex items-center justify-between border-b border-[#293B5B] px-5 py-3">
            <span className="eyebrow">// your workspace companion</span>
            <button
              className="icon-button"
              aria-label="Close guide"
              onClick={close}
            >
              <IconX />
            </button>
          </div>
          <div className="p-6">
            <div className="mb-5 flex items-center gap-4">
              <GuideAvatar variant={companion} className="h-20 w-20 shrink-0" />
              <div>
                <p className="text-lg font-semibold">Hey, I’m {name}.</p>
                <p className="text-sm text-[#A5B4CE]">
                  A few pointers to help you ship.
                </p>
              </div>
            </div>
            <div className="flex gap-2 mb-6" aria-label="Choose a companion">
              {["patch", "pixel"].map((value) => (
                <button
                  key={value}
                  aria-pressed={companion === value}
                  className={`companion-choice ${companion === value ? "selected" : ""}`}
                  onClick={() => selectCompanion(value)}
                >
                  <GuideAvatar variant={value} className="h-8 w-8" />
                  {value === "patch" ? "Patch" : "Pixel"}
                </button>
              ))}
            </div>
            {tour && (
              <p className="eyebrow mb-3">
                Quick tour · {Math.max(stepIndex, 0) + 1} / {steps.length}
              </p>
            )}
            <h2 className="text-xl font-semibold tracking-tight mb-3">
              {tip.title}
            </h2>
            <p className="text-sm leading-7 text-[#A5B4CE]">{tip.body}</p>
            <Link
              className="btn-primary flex items-center justify-between px-4 py-3 mt-6"
              to={tip.path}
              onClick={close}
            >
              {tip.action}
              <IconChevronRight />
            </Link>
            {tour ? (
              <div className="flex justify-between gap-3 mt-4">
                <button className="text-sm text-[#A5B4CE]" onClick={close}>
                  End tour
                </button>
                <button
                  className="text-sm text-[#82B4FF] font-medium"
                  onClick={() => {
                    if (stepIndex >= steps.length - 1) close();
                    else navigate(steps[Math.max(stepIndex, 0) + 1].path);
                  }}
                >
                  {stepIndex >= steps.length - 1
                    ? "Finish tour"
                    : "Next stop →"}
                </button>
              </div>
            ) : (
              <button
                className="btn-secondary w-full px-4 py-3 mt-3 text-sm"
                onClick={() => {
                  setTour(true);
                  navigate(steps[0].path);
                }}
              >
                Show me around
              </button>
            )}
            <p className="text-xs text-[#7B91B5] mt-5">
              Navigation tips, always here when you need them.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
