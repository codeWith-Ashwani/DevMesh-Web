import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addFeed, appendFeed } from "../utils/feedSlice";
import { addConnections } from "../utils/connectionsSlice";
import UserCard from "./UserCard";

const skillFilters = ["All", "React", "Node.js", "TypeScript", "Python", "Next.js", "AWS"];
const PAGE_SIZE = 50;

function Feed() {
  const feed = useSelector((store) => store.feed);
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [goal, setGoal] = useState("All goals");
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchFeedPage = useCallback(async (nextPage, replace = false) => {
    setIsLoadingMore(true);
    try {
      const response = await axios.get(`${BASE_URL}/feed?page=${nextPage}&limit=${PAGE_SIZE}`, { withCredentials: true });
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
  }, [dispatch]);

  useEffect(() => {
    if (feed === null) fetchFeedPage(1, true);
  }, [feed, fetchFeedPage]);

  useEffect(() => {
    axios.get(`${BASE_URL}/user/connections`, { withCredentials: true })
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
      const searchable = `${user.firstName} ${user.lastName} ${user.about || ""} ${(user.skills || []).join(" ")}`.toLowerCase();
      return (!query || searchable.includes(query))
        && (selectedSkill === "All" || user.skills?.includes(selectedSkill))
        && (goal === "All goals" || user.lookingFor === goal);
    });
  }, [feed, search, selectedSkill, goal]);

  const featuredUser = filteredFeed.find((user) => user._id === selectedId) || filteredFeed[0];
  const collaborationCount = feed?.filter((user) => user.lookingFor === "Project collaborators").length || 0;
  const selectedSkills = featuredUser?.skills?.filter((skill) => skillFilters.includes(skill)) || [];

  if (feed === null) return <div className="flex justify-center py-24"><span className="loading loading-spinner loading-lg text-blue-600" /></div>;

  return <main className="mx-auto max-w-6xl px-5 py-10">
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-sm font-bold uppercase tracking-widest text-pink-500">Developer discovery</p><h1 className="mt-1 text-3xl font-extrabold text-slate-900 sm:text-4xl">Find people to build with.</h1><p className="mt-2 text-slate-500">Explore developers with complementary skills and shared goals.</p></div>
      <label className="relative block w-full sm:w-80"><span className="sr-only">Search developers</span><input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 text-slate-800 outline-none shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search people or skills..." /><span className="absolute left-4 top-3 text-slate-400">⌕</span></label>
    </header>
    <section className="mt-7 grid gap-4 sm:grid-cols-3"><StatCard label="Profiles available" value={feed.length} color="blue" /><StatCard label="Open to collaborating" value={collaborationCount} color="pink" /><StatCard label="Your connections" value={connections.length} color="violet" /></section>
    <section className="mt-8 rounded-2xl border border-blue-100 bg-white p-5 soft-card"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="font-bold text-slate-800">Find your kind of developer</p><div className="mt-3 flex flex-wrap gap-2">{skillFilters.map((skill) => <button key={skill} className={`rounded-full px-4 py-2 text-sm font-semibold ${selectedSkill === skill ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"}`} onClick={() => setSelectedSkill(skill)}>{skill}</button>)}</div></div><select className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500" value={goal} onChange={(event) => setGoal(event.target.value)}><option>All goals</option><option>Project collaborators</option><option>Job opportunities</option><option>Study partners</option><option>Mentorship</option><option>Freelance work</option><option>Open-source contributors</option></select></div></section>
    {featuredUser ? <section className="mt-10 grid items-start gap-8 lg:grid-cols-[25rem_1fr]"><div><p className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-500">Featured developer</p><UserCard user={featuredUser} /></div><aside className="space-y-5"><div className="rounded-3xl border border-pink-100 bg-pink-50 p-6"><p className="text-sm font-bold uppercase tracking-widest text-pink-600">Why this match?</p><h2 className="mt-2 text-2xl font-bold text-slate-900">Shared builder energy.</h2><p className="mt-2 leading-7 text-slate-600">{featuredUser.firstName} is looking for {featuredUser.lookingFor?.toLowerCase() || "new connections"}. {selectedSkills.length ? `You can start with ${selectedSkills.join(" and ")}.` : "Explore their profile and start a useful conversation."}</p></div><div><div className="flex items-center justify-between"><div><p className="text-sm font-bold uppercase tracking-widest text-slate-500">Discover more</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Recently added developers</h2></div><span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">{filteredFeed.length} matches</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{filteredFeed.slice(0, 6).map((user) => <button key={user._id} onClick={() => setSelectedId(user._id)} className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 ${featuredUser._id === user._id ? "border-blue-400 bg-blue-50" : "border-blue-100 bg-white hover:border-pink-200"}`}><img className="h-12 w-12 rounded-xl object-cover" src={user.photoUrl} alt="" /><span className="min-w-0"><span className="block truncate font-bold text-slate-900">{user.firstName} {user.lastName}</span><span className="block truncate text-sm text-slate-500">{user.skills?.slice(0, 2).join(" · ") || "Developer"}</span></span></button>)}</div></div></aside></section> : <section className="mt-12 rounded-3xl border border-blue-100 bg-white p-10 text-center soft-card">{isLoadingMore ? <><span className="loading loading-spinner loading-md text-blue-600" /><h2 className="mt-3 text-2xl font-bold text-slate-900">Finding more developers…</h2><p className="mt-2 text-slate-500">Your feed is refreshing automatically.</p></> : <><p className="text-4xl">⌕</p><h2 className="mt-3 text-2xl font-bold text-slate-900">No developers found</h2><p className="mt-2 text-slate-500">Try another search term or clear a filter.</p><button className="mt-5 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white" onClick={() => { setSearch(""); setSelectedSkill("All"); setGoal("All goals"); }}>Clear filters</button></>}</section>}
  </main>;
}

function StatCard({ label, value, color }) {
  const colors = { blue: "border-blue-100 bg-blue-50 text-blue-700", pink: "border-pink-100 bg-pink-50 text-pink-700", violet: "border-violet-100 bg-violet-50 text-violet-700" };
  return <div className={`rounded-2xl border p-5 ${colors[color]}`}><p className="text-sm font-semibold opacity-80">{label}</p><p className="mt-2 text-3xl font-extrabold">{value}</p></div>;
}

export default Feed;
