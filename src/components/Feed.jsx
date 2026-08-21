import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { addFeed, appendFeed } from "../utils/feedSlice";
import { addConnections } from "../utils/connectionsSlice";
import UserCard from "./UserCard";
import {
  IconSearch,
  IconSparkles,
  IconActivity,
  IconChevronRight,
  IconNetwork,
  IconProjects,
  IconCode
} from "./ui/Icons";

const skillFilters = ["All", "React", "Node.js", "TypeScript", "Python", "Next.js", "AWS", "Rust", "Go", "TailwindCSS"];
const PAGE_SIZE = 50;

function Feed() {
  const feed = useSelector((store) => store.feed);
  const connections = useSelector((store) => store.connections) || [];
  const requests = useSelector((store) => store.requests) || [];
  const currentUser = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [goal, setGoal] = useState("All goals");
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [projects, setProjects] = useState([]);

  const fetchFeedPage = useCallback(
    async (nextPage, replace = false) => {
      setIsLoadingMore(true);
      try {
        const response = await axios.get(`${BASE_URL}/feed?page=${nextPage}&limit=${PAGE_SIZE}`, {
          withCredentials: true,
        });
        const users = response.data;
        dispatch(replace ? addFeed(users) : appendFeed(users));
        setPage(nextPage);
        setHasMore(users.length === PAGE_SIZE);
      } catch (error) {
        console.error("Unable to refresh the feed", error);
        setHasMore(false);
        if (replace) dispatch(addFeed([]));
      } finally {
        setIsLoadingMore(false);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (feed === null) fetchFeedPage(1, true);
  }, [feed, fetchFeedPage]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/user/connections`, { withCredentials: true })
      .then((res) => dispatch(addConnections(res.data.data)))
      .catch(() => dispatch(addConnections([])));

    axios
      .get(`${BASE_URL}/projects`, { withCredentials: true })
      .then((res) => setProjects(res.data.data || []))
      .catch(() => setProjects([]));
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(feed) && feed.length === 0 && !isLoadingMore && hasMore && page > 0) {
      fetchFeedPage(page + 1);
    }
  }, [feed, isLoadingMore, hasMore, page, fetchFeedPage]);

  const filteredFeed = useMemo(() => {
    if (!feed) return [];
    const query = search.trim().toLowerCase();
    return feed.filter((user) => {
      const searchable = `${user.firstName} ${user.lastName} ${user.about || ""} ${(
        user.skills || []
      ).join(" ")}`.toLowerCase();
      return (
        (!query || searchable.includes(query)) &&
        (selectedSkill === "All" || user.skills?.includes(selectedSkill)) &&
        (goal === "All goals" || user.lookingFor === goal)
      );
    });
  }, [feed, search, selectedSkill, goal]);

  const featuredUser = filteredFeed.find((user) => user._id === selectedId) || filteredFeed[0];
  
  // Real Statistics Computation
  const collaborationCount =
    feed?.filter((user) => user.lookingFor === "Project collaborators").length || 0;

  // Compute skill frequencies across real feed data for the analytics chart
  const topSkillsData = useMemo(() => {
    if (!feed || feed.length === 0) return [];
    const counts = {};
    feed.forEach((u) => {
      (u.skills || []).forEach((s) => {
        const trimmed = s.trim();
        if (trimmed) counts[trimmed] = (counts[trimmed] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.min(100, Math.round((count / feed.length) * 100)),
      }));
  }, [feed]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (feed === null) {
    return (
      <div className="flex h-[65vh] flex-col items-center justify-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1E2442] bg-[#0D1020] shadow-xl">
          <span className="h-5 w-5 rounded-full border-2 border-[#3B82F6] border-t-transparent animate-spin" />
        </div>
        <p className="text-xs font-medium text-[#8B91A7]">Synchronizing developer mesh...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Primary Workspace Overview Banner */}
      <section className="fintech-card rounded-3xl border border-[#1E2442] p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#3B82F6]">
              <span className="status-dot-active" />
              <span>{getTimeGreeting()}, {currentUser?.firstName || "Developer"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F7FF]">
              Developer Intelligence Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#8B91A7] leading-relaxed">
              Connect with vetted engineers, match verified technical stacks, and build collaborative engineering initiatives.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/connections"
              className="btn-secondary flex items-center gap-2 px-4 py-2.5 text-xs font-semibold"
            >
              <IconNetwork className="h-4 w-4 text-[#8B5CF6]" />
              <span>Network Graph</span>
            </Link>
            <Link
              to="/projects"
              className="btn-primary flex items-center gap-2 px-4 py-2.5 text-xs font-semibold"
            >
              <IconProjects className="h-4 w-4" />
              <span>Explore Projects</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Executive Metrics Ribbon */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard
          label="Your Network"
          value={connections.length}
          meta="Direct peer links"
          color="blue"
          trend="+12% active"
        />
        <MetricCard
          label="Discoverable Pool"
          value={feed.length}
          meta="Engineers available"
          color="cyan"
          trend="Live pool"
        />
        <MetricCard
          label="Squad Seeking"
          value={collaborationCount}
          meta="Open to collaborate"
          color="emerald"
          trend={`${feed.length ? Math.round((collaborationCount / feed.length) * 100) : 0}% ratio`}
        />
        <MetricCard
          label="Pending Requests"
          value={requests.length}
          meta="Awaiting decision"
          color="amber"
          trend={requests.length > 0 ? "Action needed" : "All cleared"}
        />
      </section>

      {/* Executive Overview: Activity Telemetry & Featured Spotlight */}
      <section className="grid items-start gap-6 lg:grid-cols-12">
        {/* Left 7 Cols: Activity & Skill Telemetry Chart */}
        <div className="fintech-card rounded-2xl border border-[#1E2442] p-6 lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E2442] pb-4">
            <div>
              <h2 className="text-sm font-bold text-[#F5F7FF]">
                Developer Ecosystem Activity
              </h2>
              <p className="text-xs text-[#8B91A7] mt-0.5">
                Real-time technical stack distribution across discoverable engineers
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-[#1E2442] bg-[#11152A] px-3 py-1 text-xs text-[#38BDF8] font-medium">
              <IconActivity className="h-3.5 w-3.5" />
              <span>Telemetry</span>
            </div>
          </div>

          {/* Skill Distribution Progress Bars */}
          <div className="space-y-3.5 pt-1">
            {topSkillsData.length > 0 ? (
              topSkillsData.map((skill, idx) => (
                <div key={skill.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-[#F5F7FF] flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#515870]">0{idx + 1}</span>
                      <span>{skill.name}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#8B91A7] font-mono">{skill.count} devs</span>
                      <span className="text-xs font-bold text-[#3B82F6] font-mono">{skill.percent}%</span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#11152A] border border-[#1E2442]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
                      style={{ width: `${Math.max(8, skill.percent)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#8B91A7] py-4 text-center">No skill telemetry recorded.</p>
            )}
          </div>

          {/* Quick Stats Footnote */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#1E2442]">
            <div className="rounded-xl border border-[#1E2442] bg-[#11152A]/60 p-3">
              <p className="text-[11px] text-[#8B91A7]">Active Projects</p>
              <p className="mt-1 text-base font-bold text-[#F5F7FF] font-mono">{projects.length}</p>
            </div>
            <div className="rounded-xl border border-[#1E2442] bg-[#11152A]/60 p-3">
              <p className="text-[11px] text-[#8B91A7]">Mesh Connection Rate</p>
              <p className="mt-1 text-base font-bold text-[#10B981] font-mono">
                {feed.length ? `${Math.round((connections.length / (feed.length + connections.length || 1)) * 100)}%` : "0%"}
              </p>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Featured Spotlight Card */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#8B91A7] uppercase tracking-wider">
              Profile Spotlight
            </span>
            {featuredUser && (
              <span className="text-[11px] text-[#515870] font-mono">
                {filteredFeed.indexOf(featuredUser) + 1} / {filteredFeed.length}
              </span>
            )}
          </div>

          {featuredUser ? (
            <UserCard user={featuredUser} />
          ) : (
            <div className="fintech-card rounded-2xl p-8 text-center text-xs text-[#8B91A7]">
              No profiles available in spotlight.
            </div>
          )}
        </div>
      </section>

      {/* Filter / Stack Selector Bar */}
      <section className="fintech-card rounded-2xl border border-[#1E2442] p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {skillFilters.map((skill) => {
                const isActive = selectedSkill === skill;
                return (
                  <button
                    key={skill}
                    onClick={() => setSelectedSkill(skill)}
                    className={`skill-pill cursor-pointer transition-all ${
                      isActive ? "skill-pill-active font-semibold shadow-sm" : ""
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Goal Select & Search */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="rounded-xl border border-[#1E2442] bg-[#11152A] px-3.5 py-2 text-xs text-[#F5F7FF] outline-none hover:border-[#2A335C] focus:border-[#3B82F6] transition-colors"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            >
              <option>All goals</option>
              <option>Project collaborators</option>
              <option>Job opportunities</option>
              <option>Study partners</option>
              <option>Mentorship</option>
              <option>Freelance work</option>
              <option>Open-source contributors</option>
            </select>

            <div className="relative min-w-[220px]">
              <input
                className="w-full rounded-xl border border-[#1E2442] bg-[#11152A] px-3.5 py-2 pl-9 text-xs text-[#F5F7FF] placeholder-[#515870] outline-none hover:border-[#2A335C] focus:border-[#3B82F6] transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, bio, stack..."
              />
              <IconSearch className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#515870]" />
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Developers Directory */}
      <section className="fintech-card rounded-2xl border border-[#1E2442] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E2442] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#F5F7FF]">
              Recommended Developers
            </h2>
            <p className="text-xs text-[#8B91A7] mt-0.5">
              Select any engineer to view their complete profile in the focus panel
            </p>
          </div>
          <span className="rounded-xl border border-[#1E2442] bg-[#11152A] px-3 py-1 font-mono text-xs font-semibold text-[#3B82F6]">
            {filteredFeed.length} matches
          </span>
        </div>

        {filteredFeed.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1E2442] bg-[#11152A] text-[#8B91A7] mb-3">
              <IconSearch className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-[#F5F7FF]">No developers match current query</h3>
            <p className="mt-1 text-xs text-[#8B91A7]">Adjust filter parameters or reset search query.</p>
            <button
              className="btn-secondary mt-4 px-4 py-2 text-xs font-semibold"
              onClick={() => {
                setSearch("");
                setSelectedSkill("All");
                setGoal("All goals");
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFeed.map((user) => {
              const isSelected = featuredUser?._id === user._id;
              return (
                <button
                  key={user._id}
                  onClick={() => setSelectedId(user._id)}
                  className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-[#3B82F6] bg-[#151A32] shadow-md shadow-blue-500/10"
                      : "border-[#1E2442] bg-[#11152A]/70 hover:border-[#2A335C] hover:bg-[#11152A]"
                  }`}
                >
                  <div className="flex items-start gap-3 w-full">
                    <img
                      className="h-10 w-10 rounded-xl border border-[#1E2442] object-cover bg-[#0D1020] shrink-0"
                      src={user.photoUrl || "https://placehold.co/80x80/11152A/8B91A7?text=DEV"}
                      alt=""
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-xs font-bold text-[#F5F7FF]">
                          {user.firstName} {user.lastName}
                        </span>
                        <IconChevronRight
                          className={`h-3.5 w-3.5 shrink-0 ${
                            isSelected ? "text-[#3B82F6]" : "text-[#515870]"
                          }`}
                        />
                      </div>
                      <span className="block truncate text-[11px] text-[#3B82F6]">
                        @{user.firstName?.toLowerCase()}
                      </span>
                    </div>
                  </div>

                  {user.lookingFor && (
                    <div className="mt-2.5 text-[10px] text-[#38BDF8] truncate bg-[#0D1020]/60 rounded-md px-2 py-0.5 border border-[#1E2442]">
                      Seeking {user.lookingFor}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1">
                    {(user.skills || []).slice(0, 3).map((skill) => (
                      <span key={skill} className="skill-pill text-[10px] py-0.5 px-1.5">
                        {skill}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value, meta, color, trend }) {
  const colorMap = {
    blue: "text-[#3B82F6]",
    cyan: "text-[#06B6D4]",
    emerald: "text-[#10B981]",
    amber: "text-[#F59E0B]",
  };

  return (
    <div className="fintech-card rounded-2xl border border-[#1E2442] p-4 sm:p-5 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#8B91A7]">{label}</p>
        {trend && (
          <span className="rounded-md border border-[#1E2442] bg-[#11152A] px-2 py-0.5 text-[10px] font-medium text-[#8B91A7]">
            {trend}
          </span>
        )}
      </div>
      <p className={`text-2xl sm:text-3xl font-extrabold font-mono ${colorMap[color] || "text-[#F5F7FF]"}`}>
        {value}
      </p>
      <p className="text-[11px] text-[#515870]">{meta}</p>
    </div>
  );
}

export default Feed;



