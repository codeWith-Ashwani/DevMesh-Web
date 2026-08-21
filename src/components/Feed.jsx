import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addFeed, appendFeed } from "../utils/feedSlice";
import { addConnections } from "../utils/connectionsSlice";
import UserCard from "./UserCard";
import {
  IconSearch,
  IconSparkles,
  IconActivity,
  IconChevronRight
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
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (feed === null) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#252A30] bg-[#111418]">
          <span className="h-4 w-4 rounded-full border-2 border-[#00E5FF] border-t-transparent animate-spin" />
        </div>
        <p className="text-xs text-[#8B949E]">Loading developers...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Workspace Header & Greeting */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#252A30] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#00E5FF] font-medium mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            <span>
              {getTimeGreeting()}, {currentUser?.firstName || "Developer"}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F2F4F7]">
            Developer Workspace
          </h1>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Discover peer developers, align technical stacks, and build projects together.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-md border border-[#252A30] bg-[#161A1F] px-3 py-1.5 text-xs text-[#8B949E]">
            <span className="text-[#00E5FF] font-bold font-mono">{feed.length}</span> discoverable engineers
          </div>
        </div>
      </div>

      {/* Quick Metrics Ribbon */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          label="Discoverable"
          value={feed.length}
          meta="In developer pool"
          color="cyan"
        />
        <MetricCard
          label="Squad Seeking"
          value={collaborationCount}
          meta="Open to collaborate"
          color="emerald"
        />
        <MetricCard
          label="Connections"
          value={connections.length}
          meta="Direct peer links"
          color="blue"
        />
        <MetricCard
          label="Pending Requests"
          value={requests.length}
          meta="Awaiting response"
          color="amber"
        />
      </section>

      {/* Filter / Stack Selector Bar */}
      <section className="rounded-xl border border-[#252A30] bg-[#111418] p-3.5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {skillFilters.map((skill) => {
                const isActive = selectedSkill === skill;
                return (
                  <button
                    key={skill}
                    onClick={() => setSelectedSkill(skill)}
                    className={`tech-tag cursor-pointer transition-colors ${
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
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              className="rounded-lg border border-[#252A30] bg-[#161A1F] px-3 py-1.5 text-xs text-[#F2F4F7] outline-none hover:border-[#363E48] focus:border-[#00E5FF] transition-colors"
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

            <div className="relative min-w-[200px]">
              <input
                className="w-full rounded-lg border border-[#252A30] bg-[#161A1F] px-3 py-1.5 pl-8 text-xs text-[#F2F4F7] placeholder-[#57606A] outline-none hover:border-[#363E48] focus:border-[#00E5FF] transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, bio, stack..."
              />
              <IconSearch className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#57606A]" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Split */}
      {featuredUser ? (
        <section className="grid items-start gap-6 lg:grid-cols-[22rem_1fr]">
          {/* Left: Featured Card */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider font-mono">
                Featured Profile
              </span>
              <span className="font-mono text-[11px] text-[#57606A]">
                {filteredFeed.indexOf(featuredUser) + 1} of {filteredFeed.length}
              </span>
            </div>

            <UserCard user={featuredUser} />
          </div>

          {/* Right: Telemetry & Active Developer Grid */}
          <div className="space-y-4">
            {/* Match Telemetry Box */}
            <div className="rounded-xl border border-[#252A30] bg-[#111418] p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#252A30] pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <IconActivity className="h-3.5 w-3.5 text-[#00E5FF]" />
                  <h3 className="text-xs font-semibold text-[#F2F4F7]">
                    Compatibility &amp; Focus
                  </h3>
                </div>
                <span className="tech-tag text-[10px]">LIVE</span>
              </div>

              <p className="text-xs leading-relaxed text-[#8B949E]">
                <strong className="text-[#F2F4F7]">{featuredUser.firstName}</strong> is looking for{" "}
                <span className="text-[#00E5FF]">
                  {featuredUser.lookingFor?.toLowerCase() || "engineering connections"}
                </span>
                .{" "}
                {featuredUser.skills?.length > 0 ? (
                  <span>
                    Primary technical competencies include{" "}
                    <strong className="text-[#F2F4F7]">{featuredUser.skills.slice(0, 3).join(", ")}</strong>.
                  </span>
                ) : (
                  "Explore their profile to connect and initiate collaboration."
                )}
              </p>
            </div>

            {/* Quick Discover Grid */}
            <div className="rounded-xl border border-[#252A30] bg-[#111418] p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-xs font-semibold text-[#F2F4F7] uppercase tracking-wider font-mono">
                    Discover More Developers
                  </h2>
                  <p className="text-[11px] text-[#57606A]">
                    Select any profile to view in focus
                  </p>
                </div>
                <span className="rounded-md border border-[#252A30] bg-[#161A1F] px-2 py-0.5 font-mono text-[10px] text-[#00E5FF]">
                  {filteredFeed.length} available
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {filteredFeed.slice(0, 8).map((user) => {
                  const isSelected = featuredUser._id === user._id;
                  return (
                    <button
                      key={user._id}
                      onClick={() => setSelectedId(user._id)}
                      className={`flex items-center gap-3 rounded-lg border p-2.5 text-left transition-colors ${
                        isSelected
                          ? "border-[#00E5FF]/40 bg-[#161A1F]"
                          : "border-[#252A30] bg-[#111418] hover:border-[#363E48] hover:bg-[#161A1F]"
                      }`}
                    >
                      <img
                        className="h-9 w-9 rounded-lg border border-[#252A30] object-cover bg-[#0B0D0F]"
                        src={user.photoUrl || "https://placehold.co/80x80/161A1F/8B949E?text=DEV"}
                        alt=""
                      />
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-[#F2F4F7]">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="block truncate font-mono text-[10px] text-[#8B949E]">
                          {user.skills?.slice(0, 2).join(" · ") || "Fullstack"}
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
        <section className="rounded-xl border border-[#252A30] bg-[#111418] p-12 text-center shadow-sm">
          {isLoadingMore ? (
            <div>
              <span className="h-5 w-5 rounded-full border-2 border-[#00E5FF] border-t-transparent animate-spin inline-block" />
              <h2 className="mt-2 text-xs font-semibold text-[#F2F4F7]">
                Fetching developers...
              </h2>
            </div>
          ) : (
            <div>
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-[#252A30] bg-[#161A1F] text-[#8B949E] mb-3">
                <IconSearch className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-bold text-[#F2F4F7]">
                No developers match current query
              </h2>
              <p className="mt-1 text-xs text-[#8B949E]">
                Adjust filter parameters or reset search query.
              </p>
              <button
                className="btn-secondary mt-4 px-3.5 py-1.5 text-xs font-medium"
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
    <div className="rounded-xl border border-[#252A30] bg-[#111418] p-3.5 shadow-sm">
      <p className="text-[11px] font-medium text-[#8B949E]">{label}</p>
      <p className={`mt-0.5 font-mono text-xl font-bold ${colorMap[color] || "text-[#F2F4F7]"}`}>
        {value}
      </p>
      <p className="text-[10px] text-[#57606A] mt-0.5">{meta}</p>
    </div>
  );
}

export default Feed;


