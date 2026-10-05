import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addFeed, appendFeed } from "../utils/feedSlice";
import UserCard from "./UserCard";
import { IconSearch } from "./ui/Icons";
const filters = [
  "All",
  "React",
  "Node.js",
  "TypeScript",
  "Python",
  "Next.js",
  "AWS",
  "Rust",
  "Go",
];
const PAGE_SIZE = 50;
export default function Feed() {
  const feed = useSelector((store) => store.feed);
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("All");
  const [goal, setGoal] = useState("All goals");
  const [page, setPage] = useState(0);
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(
    async (nextPage, replace = false) => {
      setBusy(true);
      setError("");
      try {
        const response = await axios.get(
          BASE_URL + "/feed?page=" + nextPage + "&limit=" + PAGE_SIZE,
          { withCredentials: true },
        );
        dispatch(replace ? addFeed(response.data) : appendFeed(response.data));
        setPage(nextPage);
        setMore(response.data.length === PAGE_SIZE);
      } catch {
        setError("Developers could not load. Try again in a moment.");
      } finally {
        setBusy(false);
      }
    },
    [dispatch],
  );
  useEffect(() => {
    if (user) load(1, true);
  }, [user, load]);
  const visible = useMemo(
    () =>
      (feed || []).filter((developer) => {
        const text = [
          developer.firstName,
          developer.lastName,
          developer.about,
          ...(developer.skills || []),
        ]
          .join(" ")
          .toLowerCase();
        return (
          (!search.trim() || text.includes(search.trim().toLowerCase())) &&
          (skill === "All" || developer.skills?.includes(skill)) &&
          (goal === "All goals" || developer.lookingFor === goal)
        );
      }),
    [feed, search, skill, goal],
  );
  return (
    <div className="page-wrap space-y-7">
      <header>
        <h1 className="page-title">
          Meet your next collaborator<span className="text-[#82B4FF]">.</span>
        </h1>
        <p className="text-sm text-[#A5B4CE] mt-3 max-w-xl leading-6">
          Different skills. Shared curiosity. Discover developers to learn,
          experiment, and build with.
        </p>
      </header>
      <section
        className="workbench-card rounded-2xl p-5 space-y-5"
        aria-label="Developer filters"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3.5 top-3.5 h-4 w-4 text-[#7B91B5]" />
            <input
              className="w-full rounded-lg border border-[#344D70] bg-[#16233D] py-3 pl-10 pr-3 text-sm"
              aria-label="Search developers"
              placeholder="Search name, bio, or tech stack…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <select
            aria-label="Collaboration goal"
            className="rounded-lg border border-[#344D70] bg-[#16233D] px-3 py-3 text-sm sm:max-w-[230px]"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
          >
            {[
              "All goals",
              "Project collaborators",
              "Job opportunities",
              "Study partners",
              "Mentorship",
              "Freelance work",
              "Open-source contributors",
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((value) => (
            <button
              key={value}
              aria-pressed={skill === value}
              className={
                "skill-pill " + (skill === value ? "skill-pill-active" : "")
              }
              onClick={() => setSkill(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </section>
      {error && (
        <div
          role="alert"
          className="text-sm rounded-xl border border-rose-400/30 bg-rose-400/5 p-4"
        >
          {error}
          <button
            className="underline ml-3"
            onClick={() => load(page || 1, page === 0)}
          >
            Retry
          </button>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-medium">Developer directory</h2>
        <span className="font-mono text-xs text-[#A5B4CE]">
          {visible.length} in this view{more ? " · more to discover" : ""}
        </span>
      </div>
      {busy && !feed ? (
        <p role="status" className="text-sm text-[#A5B4CE] py-12 text-center">
          Finding developers…
        </p>
      ) : visible.length ? (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {visible.map((developer) => (
            <UserCard key={developer._id} user={developer} />
          ))}
        </div>
      ) : (
        !error && (
          <div className="workbench-card rounded-xl text-center p-10">
            <IconSearch className="h-8 w-8 mx-auto text-[#7B91B5] mb-4" />
            <h3 className="text-base font-medium">
              A different search might help.
            </h3>
            <p className="text-sm text-[#A5B4CE] mt-2">
              Try another stack or clear your filters to discover more people.
            </p>
            <button
              className="btn-secondary px-4 py-2 mt-5 text-sm"
              onClick={() => {
                setSearch("");
                setSkill("All");
                setGoal("All goals");
              }}
            >
              Clear filters
            </button>
          </div>
        )
      )}
      {more && (
        <div className="text-center">
          <button
            className="btn-secondary px-5 py-3 text-sm"
            disabled={busy}
            onClick={() => load(page + 1)}
          >
            {busy ? "Loading…" : "Discover more developers"}
          </button>
          <p className="mt-3 text-xs text-[#7B91B5]">
            Filters apply to developers loaded so far.
          </p>
        </div>
      )}
    </div>
  );
}
