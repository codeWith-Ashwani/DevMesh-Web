import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addConnections } from "../utils/connectionsSlice";
import { Empty, PageTitle } from "./Requests";
import {
  IconNetwork,
  IconMessages,
  IconExternalLink,
  IconSearch,
  IconCode,
  IconTerminal
} from "./ui/Icons";

function Connections() {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");

  useEffect(() => {
    axios
      .get(`${BASE_URL}/user/connections`, { withCredentials: true })
      .then((res) => dispatch(addConnections(res.data.data)))
      .catch(console.error);
  }, [dispatch]);

  // Aggregate all unique skills across connections for network graph breakdown
  const allSkills = useMemo(() => {
    const counts = {};
    connections.forEach((user) => {
      (user.skills || []).forEach((skill) => {
        counts[skill] = (counts[skill] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [connections]);

  const filteredConnections = useMemo(() => {
    const q = search.trim().toLowerCase();
    return connections.filter((user) => {
      const matchQuery =
        !q ||
        `${user.firstName} ${user.lastName} ${user.about || ""} ${(user.skills || []).join(" ")}`
          .toLowerCase()
          .includes(q);
      const matchTag = selectedTag === "All" || user.skills?.includes(selectedTag);
      return matchQuery && matchTag;
    });
  }, [connections, search, selectedTag]);

  if (!connections.length) {
    return (
      <Empty
        title="Developer Mesh Not Established"
        text="You have zero active peer connections. Explore the developer discovery feed to establish encrypted links."
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageTitle
        eyebrow="TOPOLOGY & NODES"
        title="Developer Network & Peering"
        subtitle="Manage active peer nodes, skills intersection, and encrypted chat channels"
      />

      {/* Network Stats & Skill Topology Ribbon */}
      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        {/* Total Node Links */}
        <div className="rounded-xl border border-[#252A30] bg-[#111418] p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase text-[#57606A]">Direct Peer Links</span>
            <span className="h-2 w-2 rounded-full bg-[#10B981]" />
          </div>
          <p className="mt-1 font-mono text-2xl font-bold text-[#F2F4F7]">{connections.length}</p>
          <p className="mt-0.5 font-mono text-[11px] text-[#8B949E]">Active encrypted channels</p>
        </div>

        {/* Skill Graph Coverage */}
        <div className="rounded-xl border border-[#252A30] bg-[#111418] p-4 shadow-md lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase text-[#57606A]">
              Top Network Stack Synergy
            </span>
            <span className="font-mono text-[10px] text-[#00E5FF]">LIVE CLUSTER</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedTag("All")}
              className={`tech-tag cursor-pointer transition-all ${
                selectedTag === "All" ? "tech-tag-active" : "hover:border-[#363E48]"
              }`}
            >
              All ({connections.length})
            </button>
            {allSkills.map(([skill, count]) => (
              <button
                key={skill}
                onClick={() => setSelectedTag(skill)}
                className={`tech-tag cursor-pointer transition-all ${
                  selectedTag === skill ? "tech-tag-active" : "hover:border-[#363E48]"
                }`}
              >
                {skill} <span className="text-[#57606A]">({count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Search Input Bar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <input
            className="w-full rounded-lg border border-[#252A30] bg-[#111418] px-3 py-2 pl-8 text-xs font-mono text-[#F2F4F7] placeholder-[#57606A] outline-none hover:border-[#363E48] focus:border-[#00E5FF]"
            placeholder="Search peer nodes by name or stack..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <IconSearch className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#57606A]" />
        </div>
        <span className="font-mono text-xs text-[#8B949E]">
          {filteredConnections.length} of {connections.length} nodes
        </span>
      </div>

      {/* Peer Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredConnections.map((user) => (
          <article
            key={user._id}
            className="surface-card flex flex-col justify-between rounded-xl border border-[#252A30] bg-[#111418] p-5 shadow-lg hover:border-[#363E48]"
          >
            <div>
              <div className="flex items-start gap-3.5">
                <div className="relative shrink-0">
                  <img
                    className="h-12 w-12 rounded-xl border border-[#252A30] object-cover bg-[#0B0D0F]"
                    src={user.photoUrl || "https://placehold.co/80x80/161A1F/8B949E?text=DEV"}
                    alt={`${user.firstName}'s profile`}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#10B981] border border-[#111418]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-[#F2F4F7]">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="font-mono text-xs text-[#00E5FF]">
                    @{user.firstName?.toLowerCase()}
                  </p>
                  <p className="font-mono text-[10px] text-[#57606A]">
                    {user.age && user.gender ? `${user.age}y · ${user.gender}` : "Peer Node"}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[#8B949E] line-clamp-2">
                {user.about || "Developer actively contributing and building in the network."}
              </p>

              {user.skills?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {user.skills.slice(0, 4).map((skill) => (
                    <span key={skill} className="tech-tag text-[10px]">
                      {skill}
                    </span>
                  ))}
                  {user.skills.length > 4 && (
                    <span className="tech-tag text-[10px] text-[#57606A]">
                      +{user.skills.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-[#252A30] flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#10B981] flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                LINKED
              </span>

              <Link
                className="btn-cyan flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold"
                to={`/chat/${user._id}`}
                state={{ user }}
              >
                <IconMessages className="h-3.5 w-3.5" />
                <span>Open Chat</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Connections;

