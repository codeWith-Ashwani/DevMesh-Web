import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { loadWorkbench } from "../utils/workbench";
import GuideAvatar from "./ui/GuideAvatar";
import {
  IconChevronRight,
  IconProjects,
  IconMessages,
  IconCheck,
  IconCode,
} from "./ui/Icons";

export default function Dashboard() {
  const user = useSelector((store) => store.user);
  const [data, setData] = useState(null);
  const [retry, setRetry] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    if (!user) return;
    let alive = true;
    const controller = new AbortController();
    loadWorkbench(controller.signal, (result) => {
      if (alive) setData(result);
    }).then((result) => {
      if (!alive) return;
      setData(result);
      setRefreshing(false);
    });
    return () => {
      alive = false;
      controller.abort();
    };
  }, [user, retry]);
  const available =
    data?.profile && new Date(data.profile.availableUntil) > new Date();
  const ready = Boolean(user?.skills?.length && user?.about?.trim());
  const myProjects =
    data?.projects?.filter((project) => project.isTeamMember).slice(0, 3) || [];
  const nextSteps = [
    {
      title: "Introduce yourself",
      detail: "A few skills and a bio help people find you.",
      path: "/profile",
      done: ready,
    },
    {
      title: "Make time to build",
      detail: "Share your weekly hours and preferred role.",
      path: "/collaborate",
      done: available,
    },
    {
      title: "Find your people",
      detail: "Connect with a developer you want to work with.",
      path: "/feed",
      done: Boolean(data?.connections?.length),
    },
  ];
  return (
    <div className="page-wrap space-y-7">
      <header>
        <p className="eyebrow mb-3">// your developer workbench</p>
        <h1 className="page-title">
          Let’s build something, {user?.firstName || "developer"}
          <span className="text-[#82B4FF]">.</span>
        </h1>
        <p className="mt-3 text-sm text-[#A5B4CE]">
          Your people, your projects, and your next small win.
        </p>
      </header>
      {data && Object.keys(data.errors).length > 0 && (
        <div
          role="alert"
          className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm text-amber-200"
        >
          Could not load:{" "}
          {Object.values(data.errors)
            .map((error) => error.label)
            .join(", ")}
          .{" "}
          <button
            className="underline ml-2"
            disabled={refreshing}
            onClick={() => {
              setRefreshing(true);
              setRetry((value) => value + 1);
            }}
          >
            {refreshing ? "Retrying…" : "Try again"}
          </button>
        </div>
      )}
      {data &&
        Object.values(data.errors).map((error) => (
          <div
            key={error.key}
            className="rounded-xl border border-amber-400/20 p-4 text-sm"
          >
            <p>
              <strong>{error.label}: </strong>
              {error.message}
            </p>
            {error.status === 401 && (
              <Link
                to="/login"
                className="text-[#82B4FF] underline mt-2 inline-block"
              >
                Sign in again
              </Link>
            )}
            <details className="mt-2 text-xs text-[#A5B4CE]">
              <summary>Request details</summary>
              <p className="font-mono mt-2">
                GET {error.path} ·{" "}
                {error.status ? "HTTP " + error.status : "No valid response"}
              </p>
            </details>
          </div>
        ))}
      <section className="hero-workbench workbench-card rounded-2xl p-6 sm:p-8 flex items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-md border border-[#82B4FF33] bg-[#82B4FF0A] px-2 py-1 text-[10px] font-mono text-[#82B4FF]">
            <IconCode className="h-3 w-3" />
            built for the work between commits
          </span>
          <h2 className="text-2xl sm:text-3xl tracking-tight font-medium mt-5">
            Great projects start
            <br />
            with the right people.
          </h2>
          <p className="text-sm leading-6 text-[#A5B4CE] mt-3 max-w-md">
            Find teammates who fit your skills and schedule. Try a small task
            together, then turn momentum into something you can show.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/collaborate"
              className="btn-primary px-4 py-2.5 text-sm flex items-center gap-3"
            >
              Find your team <IconChevronRight />
            </Link>
            <Link to="/projects" className="btn-secondary px-4 py-2.5 text-sm">
              Explore projects
            </Link>
          </div>
        </div>
        <div className="hidden md:block relative z-10 shrink-0 pr-4 text-center">
          <GuideAvatar className="h-36 w-36 mx-auto" />
          <p className="mt-3 font-mono text-xs text-[#82B4FF]">
            hello, builder_
          </p>
          <p className="text-[11px] text-[#A5B4CE] mt-2">
            A little help from Patch.
          </p>
        </div>
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="workbench-card rounded-2xl p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <p className="eyebrow mb-2">01 / pick up where you left off</p>
              <h2 className="text-lg font-semibold">Your project spaces</h2>
            </div>
            <Link to="/projects" className="text-xs text-[#82B4FF] shrink-0">
              All projects →
            </Link>
          </div>
          {!data || data.pending.projects ? (
            <p role="status" className="text-sm text-[#A5B4CE] py-8">
              Loading your workbench…
            </p>
          ) : data.projects === null ? (
            <p className="text-sm text-[#A5B4CE] py-8">
              Project spaces are temporarily unavailable.
            </p>
          ) : myProjects.length ? (
            <div className="space-y-3">
              {myProjects.map((project) => (
                <Link
                  key={project._id}
                  to={"/projects/" + project._id + "/workspace"}
                  className="block rounded-xl border border-[#293B5B] bg-[#16233D] p-4 hover:border-[#4C6B94]"
                >
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-sm font-medium">{project.title}</span>
                    <span className="skill-pill shrink-0">{project.stage}</span>
                  </div>
                  <p className="text-xs leading-5 text-[#A5B4CE] mt-2 line-clamp-2">
                    {project.firstDeliverable || project.description}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-mono text-[10px] text-[#7B91B5]">
                      {project.teamSize} teammates · {project.durationWeeks}{" "}
                      weeks
                    </span>
                    <span className="text-xs text-[#82B4FF]">
                      Open workspace →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#344D70] p-6 sm:p-8 text-center">
              <IconProjects className="h-7 w-7 mx-auto text-[#7B91B5] mb-4" />
              <h3 className="text-sm font-medium">
                Make room for your next idea.
              </h3>
              <p className="text-xs text-[#A5B4CE] leading-6 mt-2 max-w-xs mx-auto">
                Join a project or start one. Your teams from the latest 50
                projects appear here.
              </p>
              <Link
                to="/projects"
                className="btn-secondary inline-flex px-4 py-2 mt-4 text-xs"
              >
                Find a project
              </Link>
            </div>
          )}
          {myProjects.length > 0 && (
            <p className="text-[10px] text-[#7B91B5] mt-4">
              Teams from the latest 50 projects. Browse all projects for earlier
              work.
            </p>
          )}
        </section>
        <section className="workbench-card rounded-2xl p-6">
          <p className="eyebrow mb-2">02 / get ready to collaborate</p>
          <h2 className="text-lg font-semibold mb-4">A good place to start</h2>
          {nextSteps.map((step, index) => (
            <Link key={step.path} to={step.path} className="path-row group">
              <span
                className={
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs " +
                  (step.done
                    ? "border-[#82B4FF40] text-[#82B4FF] bg-[#82B4FF0A]"
                    : "border-[#344D70] text-[#A5B4CE]")
                }
              >
                {step.done ? <IconCheck /> : "0" + (index + 1)}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm group-hover:text-[#82B4FF]">
                  {step.title}
                  {step.done && <span className="sr-only"> · Complete</span>}
                </span>
                <span className="block mt-1 text-xs leading-5 text-[#A5B4CE]">
                  {step.detail}
                </span>
              </span>
              <IconChevronRight className="h-4 w-4 text-[#7B91B5]" />
            </Link>
          ))}
          <p className="text-xs leading-5 text-[#A5B4CE] mt-2">
            {available
              ? "Available until " +
                new Date(data.profile.availableUntil).toLocaleDateString() +
                " · " +
                data.profile.hoursPerWeek +
                " hrs/week"
              : "Renew availability every 30 days to keep your matches useful."}
          </p>
        </section>
      </div>
      <section className="workbench-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="eyebrow mb-2">03 / keep the conversation going</p>
            <h2 className="text-lg font-semibold">Recent conversations</h2>
          </div>
          <Link to="/messages" className="text-xs text-[#82B4FF]">
            Inbox →
          </Link>
        </div>
        {!data || data.pending.conversations ? (
          <p className="text-sm text-[#A5B4CE]" role="status">
            Loading conversations…
          </p>
        ) : data.conversations === null ? (
          <p className="text-sm text-[#A5B4CE]">
            Conversations are temporarily unavailable.
          </p>
        ) : data.conversations.length ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {data.conversations.slice(0, 3).map((conversation) => (
              <Link
                key={conversation._id}
                to={"/messages/" + conversation._id}
                className="border border-[#293B5B] rounded-xl p-4 bg-[#16233D] hover:border-[#4C6B94]"
              >
                <div className="flex gap-3 items-center">
                  <IconMessages className="h-4 w-4 text-[#82B4FF] shrink-0" />
                  <strong className="text-sm truncate">
                    {conversation.name ||
                      conversation.members
                        .filter((member) => member._id !== user?._id)
                        .map((member) => member.firstName)
                        .join(", ")}
                  </strong>
                  {conversation.unreadCount > 0 && (
                    <span className="ml-auto text-xs text-[#82B4FF]">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#A5B4CE] line-clamp-1 mt-3">
                  {conversation.lastMessage?.text ||
                    "Say hello and share what you’re building."}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 items-center p-4 rounded-xl bg-[#16233D]">
            <IconMessages className="h-6 w-6 text-[#7B91B5] shrink-0" />
            <p className="text-sm text-[#A5B4CE]">
              No conversations yet.{" "}
              <Link to="/connections" className="text-[#82B4FF]">
                Say hello to a connection →
              </Link>
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
