import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
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
  useEffect(() => {
    if (!user) return;
    let alive = true;
    const endpoints = [
      "/projects?limit=50",
      "/conversations",
      "/collaboration/profile",
      "/user/connections",
    ];
    Promise.allSettled(
      endpoints.map((path) =>
        axios.get(BASE_URL + path, { withCredentials: true }),
      ),
    ).then((results) => {
      if (!alive) return;
      const values = results.map((result) =>
        result.status === "fulfilled" ? result.value.data.data : null,
      );
      setData({
        projects: values[0],
        conversations: values[1],
        profile: values[2],
        connections: values[3],
        failed: results.some((result) => result.status === "rejected"),
      });
    });
    return () => {
      alive = false;
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
          <span className="text-[#B7ED82]">.</span>
        </h1>
        <p className="mt-3 text-sm text-[#9AADAA]">
          Your people, your projects, and your next small win.
        </p>
      </header>
      {data?.failed && (
        <div
          role="alert"
          className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm text-amber-200"
        >
          Some workspace data could not load.{" "}
          <button
            className="underline ml-2"
            onClick={() => setRetry((value) => value + 1)}
          >
            Try again
          </button>
        </div>
      )}
      <section className="hero-workbench workbench-card rounded-2xl p-6 sm:p-8 flex items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-md border border-[#B7ED8233] bg-[#B7ED820A] px-2 py-1 text-[10px] font-mono text-[#B7ED82]">
            <IconCode className="h-3 w-3" />
            built for the work between commits
          </span>
          <h2 className="text-2xl sm:text-3xl tracking-tight font-medium mt-5">
            Great projects start
            <br />
            with the right people.
          </h2>
          <p className="text-sm leading-6 text-[#9AADAA] mt-3 max-w-md">
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
          <p className="mt-3 font-mono text-xs text-[#B7ED82]">
            hello, builder_
          </p>
          <p className="text-[11px] text-[#9AADAA] mt-2">
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
            <Link to="/projects" className="text-xs text-[#B7ED82] shrink-0">
              All projects →
            </Link>
          </div>
          {!data ? (
            <p role="status" className="text-sm text-[#9AADAA] py-8">
              Loading your workbench…
            </p>
          ) : data.projects === null ? (
            <p className="text-sm text-[#9AADAA] py-8">
              Project spaces are temporarily unavailable.
            </p>
          ) : myProjects.length ? (
            <div className="space-y-3">
              {myProjects.map((project) => (
                <Link
                  key={project._id}
                  to={"/projects/" + project._id + "/workspace"}
                  className="block rounded-xl border border-[#26383D] bg-[#142024] p-4 hover:border-[#416067]"
                >
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-sm font-medium">{project.title}</span>
                    <span className="skill-pill shrink-0">{project.stage}</span>
                  </div>
                  <p className="text-xs leading-5 text-[#9AADAA] mt-2 line-clamp-2">
                    {project.firstDeliverable || project.description}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-mono text-[10px] text-[#718986]">
                      {project.teamSize} teammates · {project.durationWeeks}{" "}
                      weeks
                    </span>
                    <span className="text-xs text-[#B7ED82]">
                      Open workspace →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#31474E] p-6 sm:p-8 text-center">
              <IconProjects className="h-7 w-7 mx-auto text-[#718986] mb-4" />
              <h3 className="text-sm font-medium">
                Make room for your next idea.
              </h3>
              <p className="text-xs text-[#9AADAA] leading-6 mt-2 max-w-xs mx-auto">
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
            <p className="text-[10px] text-[#718986] mt-4">
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
                    ? "border-[#B7ED8240] text-[#B7ED82] bg-[#B7ED820A]"
                    : "border-[#31474E] text-[#9AADAA]")
                }
              >
                {step.done ? <IconCheck /> : "0" + (index + 1)}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm group-hover:text-[#B7ED82]">
                  {step.title}
                  {step.done && <span className="sr-only"> · Complete</span>}
                </span>
                <span className="block mt-1 text-xs leading-5 text-[#9AADAA]">
                  {step.detail}
                </span>
              </span>
              <IconChevronRight className="h-4 w-4 text-[#718986]" />
            </Link>
          ))}
          <p className="text-xs leading-5 text-[#9AADAA] mt-2">
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
          <Link to="/messages" className="text-xs text-[#B7ED82]">
            Inbox →
          </Link>
        </div>
        {!data ? (
          <p className="text-sm text-[#9AADAA]" role="status">
            Loading conversations…
          </p>
        ) : data.conversations === null ? (
          <p className="text-sm text-[#9AADAA]">
            Conversations are temporarily unavailable.
          </p>
        ) : data.conversations.length ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {data.conversations.slice(0, 3).map((conversation) => (
              <Link
                key={conversation._id}
                to={"/messages/" + conversation._id}
                className="border border-[#26383D] rounded-xl p-4 bg-[#142024] hover:border-[#416067]"
              >
                <div className="flex gap-3 items-center">
                  <IconMessages className="h-4 w-4 text-[#B7ED82] shrink-0" />
                  <strong className="text-sm truncate">
                    {conversation.name ||
                      conversation.members
                        .filter((member) => member._id !== user?._id)
                        .map((member) => member.firstName)
                        .join(", ")}
                  </strong>
                  {conversation.unreadCount > 0 && (
                    <span className="ml-auto text-xs text-[#B7ED82]">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#9AADAA] line-clamp-1 mt-3">
                  {conversation.lastMessage?.text ||
                    "Say hello and share what you’re building."}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 items-center p-4 rounded-xl bg-[#142024]">
            <IconMessages className="h-6 w-6 text-[#718986] shrink-0" />
            <p className="text-sm text-[#9AADAA]">
              No conversations yet.{" "}
              <Link to="/connections" className="text-[#B7ED82]">
                Say hello to a connection →
              </Link>
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
