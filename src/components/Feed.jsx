import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addFeed, appendFeed } from "../utils/feedSlice";
import { addConnections } from "../utils/connectionsSlice";
import UserCard from "./UserCard";
import {
  IconSearch,
  IconTerminal,
  IconSparkles,
  IconActivity,
  IconNetwork,
  IconCode,
  IconChevronRight
} from "./ui/Icons";

const skillFilters = ["All", "React", "Node.js", "TypeScript", "Python", "Next.js", "AWS", "Rust", "Go", "TailwindCSS"];
const PAGE_SIZE = 50;

function Feed() {
  const feed = useSelector((store) => store.feed);
  const connections = useSelector((store) => store.connections);
  const requests = useSelector((store) => store.requests);
  const currentUser = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [goal, setGoal] = useState("All goals");
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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
  const collaborationCount =
    feed?.filter((user) => user.lookingFor === "Project collaborators").length || 0;

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "GOOD MORNING";
    if (hour < 18) return "GOOD AFTERNOON";
    return "GOOD EVENING";
  };

  if (feed === null) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#252A30] bg-[#111418]">
          <span className="h-4 w-4 rounded-full border-2 border-[#00E5FF] border-t-transparent animate-spin" />
        </div>
        <p className="font-mono text-xs text-[#8B949E]">INITIALIZING DEVELOPER FEED PROTOCOL...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* OS Header & Greeting */}
      <div className="mb-6 rounded-xl border border-[#252A30] bg-[#111418] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#00E5FF]/5 to-transparent pointer-events-none" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#00E5FF] mb-1">
              <span className="h-2 w-2 rounded-full bg-[#00E5FF] animate-pulse" />
              <span>
                {getTimeGreeting()},{" "}
                {currentUser?.firstName ? currentUser.firstName.toUpperCase() : "DEVELOPER"}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F2F4F7] sm:text-3xl">
              Developer Network Workspace
            </h1>
            <p className="mt-1 font-mono text-xs text-[#8B949E]">
              Match stack compatibility · Form project squads · Coordinate builds
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-[#252A30] bg-[#161A1F] px-3 py-2 font-mono text-xs text-[#8B949E]">
              <span className="text-[#00E5FF] font-bold">{feed.length}</span> nodes online
            </div>
          </div>
        </div>
      </div>

      {/* Developer Telemetry Metrics */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          label="DISCOVERABLE NODES"
          value={feed.length}
          meta="In network pool"
          color="cyan"
        />
        <MetricCard
          label="COLLABORATORS"
          value={collaborationCount}
          meta="Looking for squads"
          color="emerald"
        />
        <MetricCard
          label="CONNECTED NODES"
          value={connections.length}
          meta="Direct mesh links"
          color="blue"
        />
        <MetricCard
          label="PENDING INBOX"
          value={requests?.length || 0}
          meta="Link authorizations"
          color="amber"
        />
      </section>

      {/* Filter / Stack Selector Console */}
      <section className="mb-8 rounded-xl border border-[#252A30] bg-[#111418] p-4 shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <IconCode className="h-3.5 w-3.5 text-[#00E5FF]" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#8B949E]">
                Filter by Stack Archetype
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skillFilters.map((skill) => {
                const isActive = selectedSkill === skill;
                return (
                  <button
                    key={skill}
                    onClick={() => setSelectedSkill(skill)}
                    className={`tech-tag cursor-pointer transition-all ${
                      isActive ? "tech-tag-active" : "hover:border-[#363E48] hover:text-[#F2F4F7]"
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
              className="rounded-lg border border-[#252A30] bg-[#161A1F] px-3 py-2 text-xs font-mono text-[#F2F4F7] outline-none hover:border-[#363E48] focus:border-[#00E5FF]"
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
                className="w-full rounded-lg border border-[#252A30] bg-[#161A1F] px-3 py-2 pl-8 text-xs font-mono text-[#F2F4F7] placeholder-[#57606A] outline-none hover:border-[#363E48] focus:border-[#00E5FF]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, bio, stack..."
              />
              <IconSearch className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#57606A]" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace split */}
      {featuredUser ? (
        <section className="grid items-start gap-8 lg:grid-cols-[24rem_1fr]">
          {/* Featured Card */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#00E5FF]" />
                <span className="font-mono text-xs uppercase tracking-wider text-[#8B949E]">
                  Target Developer Node
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#57606A]">
                NODE {filteredFeed.indexOf(featuredUser) + 1} OF {filteredFeed.length}
              </span>
            </div>

            <UserCard user={featuredUser} />
          </div>

          {/* Right Workspace telemetry & discovery grid */}
          <div className="space-y-6">
            {/* Match Telemetry Box */}
            <div className="rounded-xl border border-[#252A30] bg-[#111418] p-5 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#252A30] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <IconActivity className="h-4 w-4 text-[#00E5FF]" />
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#F2F4F7]">
                    Connection Telemetry & Synergy
                  </h3>
                </div>
                <span className="tech-tag text-[10px]">REAL-TIME</span>
              </div>

              <p className="text-xs leading-relaxed text-[#8B949E]">
                <strong className="text-[#F2F4F7]">{featuredUser.firstName}</strong> is looking for{" "}
                <span className="text-[#00E5FF] font-mono">
                  {featuredUser.lookingFor?.toLowerCase() || "engineering connections"}
                </span>
                .{" "}
                {featuredUser.skills?.length > 0 ? (
                  <span>
                    Primary technical competencies include{" "}
                    <strong className="text-[#F2F4F7]">{featuredUser.skills.slice(0, 3).join(", ")}</strong>.
                  </span>
                ) : (
                  "Explore their profile to initiate collaboration."
                )}
              </p>
            </div>

            {/* Quick Discover Grid */}
            <div className="rounded-xl border border-[#252A30] bg-[#111418] p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-[#F2F4F7]">Discover Active Developers</h2>
                  <p className="font-mono text-[11px] text-[#57606A]">
                    Click any node to focus workspace
                  </p>
                </div>
                <span className="rounded-full border border-[#252A30] bg-[#161A1F] px-2 py-0.5 font-mono text-[11px] text-[#00E5FF]">
                  {filteredFeed.length} matches
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {filteredFeed.slice(0, 8).map((user) => {
                  const isSelected = featuredUser._id === user._id;
                  return (
                    <button
                      key={user._id}
                      onClick={() => setSelectedId(user._id)}
                      className={`flex items-center gap-3 rounded-lg border p-2.5 text-left transition-all ${
                        isSelected
                          ? "border-[#00E5FF]/50 bg-[#161A1F] shadow-[0_0_12px_rgba(0,229,255,0.15)]"
                          : "border-[#252A30] bg-[#111418] hover:border-[#363E48] hover:bg-[#161A1F]"
                      }`}
                    >
                      <img
                        className="h-10 w-10 rounded-lg border border-[#252A30] object-cover bg-[#0B0D0F]"
                        src={user.photoUrl || "https://placehold.co/80x80/161A1F/8B949E?text=DEV"}
                        alt=""
                      />
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-[#F2F4F7]">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="block truncate font-mono text-[10px] text-[#8B949E]">
                          {user.skills?.slice(0, 2).join(" · ") || "Fullstack Dev"}
                        </span>
                      </div>
                      <IconChevronRight
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isSelected ? "text-[#00E5FF]" : "text-[#57606A]"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-[#252A30] bg-[#111418] p-12 text-center shadow-xl">
          {isLoadingMore ? (
            <div>
              <span className="h-6 w-6 rounded-full border-2 border-[#00E5FF] border-t-transparent animate-spin inline-block" />
              <h2 className="mt-3 font-mono text-sm font-bold text-[#F2F4F7]">
                Fetching developer nodes...
              </h2>
              <p className="mt-1 font-mono text-xs text-[#57606A]">
                Querying the mesh network registry.
              </p>
            </div>
          ) : (
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#252A30] bg-[#161A1F] text-[#8B949E]">
                <IconSearch className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-base font-bold text-[#F2F4F7]">
                No developer nodes match current query
              </h2>
              <p className="mt-1 font-mono text-xs text-[#8B949E]">
                Adjust filter parameters or reset search query.
              </p>
              <button
                className="btn-secondary mt-5 px-4 py-2 text-xs font-mono"
                onClick={() => {
                  setSearch("");
                  setSelectedSkill("All");
                  setGoal("All goals");
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function MetricCard({ label, value, meta, color }) {
  const colorMap = {
    cyan: "text-[#00E5FF]",
    emerald: "text-[#10B981]",
    blue: "text-[#38BDF8]",
    amber: "text-[#F59E0B]",
  };

  return (
    <div className="rounded-xl border border-[#252A30] bg-[#111418] p-3.5 shadow-md">
      <p className="font-mono text-[10px] uppercase tracking-wider text-[#57606A]">{label}</p>
      <p className={`mt-1 font-mono text-2xl font-bold ${colorMap[color] || "text-[#F2F4F7]"}`}>
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-mono text-[#8B949E]">{meta}</p>
    </div>
  );
}

export default Feed;

