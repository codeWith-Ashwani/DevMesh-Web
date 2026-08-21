import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addConnections } from "../utils/connectionsSlice";
import { PageTitle } from "./Requests";
import NetworkGraph from "./network/NetworkGraph";
import NetworkFilters from "./network/NetworkFilters";
import NetworkDetailsPanel from "./network/NetworkDetailsPanel";
import {
  IconNetwork,
  IconMessages,
  IconProjects,
  IconRotateCcw,
  IconSparkles
} from "./ui/Icons";

export default function Connections() {
  const dispatch = useDispatch();
  const currentUser = useSelector((store) => store.user);
  const rawConnections = useSelector((store) => store.connections);
  const connections = useMemo(() => rawConnections || [], [rawConnections]);


  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Graph and Filter State
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("graph"); // "graph" | "grid"
  const [selectedNode, setSelectedNode] = useState(null);

  // Fetch real connections & real projects
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [connRes, projRes] = await Promise.allSettled([
        axios.get(`${BASE_URL}/user/connections`, { withCredentials: true }),
        axios.get(`${BASE_URL}/projects`, { withCredentials: true }),
      ]);

      if (connRes.status === "fulfilled" && connRes.value?.data?.data) {
        dispatch(addConnections(connRes.value.data.data));
      }

      if (projRes.status === "fulfilled" && projRes.value?.data?.data) {
        setProjects(projRes.value.data.data);
      }
    } catch (err) {
      console.error("Failed to load network topology data", err);
      setError("Failed to establish link with developer mesh.");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle ESC key to deselect node
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedNode(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Construct Graph Model (Developers <-> Skills <-> Projects <-> Connections)
  const { nodes, links, stats } = useMemo(() => {
    const nodesList = [];
    const linksList = [];
    const skillMap = new Map(); // skillName -> { developers: [], projects: [] }
    const devMap = new Map();

    // 1. Current User Node
    if (currentUser) {
      const currentUserId = "current_user";
      nodesList.push({
        id: `dev_${currentUserId}`,
        type: "developer",
        label: `${currentUser.firstName || "You"} (Node:0)`,
        isCurrentUser: true,
        isConnection: false,
        data: currentUser,
      });

      (currentUser.skills || []).forEach((skill) => {
        const s = skill.trim();
        if (!s) return;
        if (!skillMap.has(s)) skillMap.set(s, { developers: [], projects: [] });
        skillMap.get(s).developers.push(currentUser);
        linksList.push({
          source: `dev_${currentUserId}`,
          target: `skill_${s}`,
          type: "dev-skill",
        });
      });
    }

    // 2. Connected Developers Nodes
    connections.forEach((user) => {
      if (!user?._id) return;
      const devId = `dev_${user._id}`;
      devMap.set(user._id, user);

      nodesList.push({
        id: devId,
        type: "developer",
        label: `${user.firstName} ${user.lastName}`,
        isCurrentUser: false,
        isConnection: true,
        data: user,
      });

      // Direct peer connection to current user
      if (currentUser) {
        linksList.push({
          source: "dev_current_user",
          target: devId,
          type: "dev-dev",
        });
      }

      // Associate skills
      (user.skills || []).forEach((skill) => {
        const s = skill.trim();
        if (!s) return;
        if (!skillMap.has(s)) skillMap.set(s, { developers: [], projects: [] });
        skillMap.get(s).developers.push(user);
        linksList.push({
          source: devId,
          target: `skill_${s}`,
          type: "dev-skill",
        });
      });
    });

    // 3. Real Projects Nodes
    projects.forEach((proj) => {
      if (!proj?._id) return;
      const projId = `proj_${proj._id}`;

      nodesList.push({
        id: projId,
        type: "project",
        label: proj.title,
        data: proj,
      });

      // Link project creator if creator exists
      if (proj.creator?._id) {
        const creatorId = proj.creator._id;
        const creatorNodeId = `dev_${creatorId}`;

        // If creator not already in nodes, add them
        if (!devMap.has(creatorId) && creatorId !== currentUser?._id) {
          devMap.set(creatorId, proj.creator);
          nodesList.push({
            id: creatorNodeId,
            type: "developer",
            label: `${proj.creator.firstName || "Dev"} ${proj.creator.lastName || ""}`,
            isCurrentUser: false,
            isConnection: false,
            data: proj.creator,
          });
        }

        linksList.push({
          source: creatorNodeId,
          target: projId,
          type: "dev-proj",
        });
      }

      // Link project required skills
      (proj.techStack || []).forEach((skill) => {
        const s = skill.trim();
        if (!s) return;
        if (!skillMap.has(s)) skillMap.set(s, { developers: [], projects: [] });
        skillMap.get(s).projects.push(proj);
        linksList.push({
          source: projId,
          target: `skill_${s}`,
          type: "proj-skill",
        });
      });
    });

    // 4. Add Skills Nodes
    skillMap.forEach((meta, skillName) => {
      nodesList.push({
        id: `skill_${skillName}`,
        type: "skill",
        label: skillName,
        data: {
          name: skillName,
          developers: meta.developers,
          projects: meta.projects,
        },
      });
    });

    const devNodes = nodesList.filter((n) => n.type === "developer").length;
    const skillNodes = nodesList.filter((n) => n.type === "skill").length;
    const projectNodes = nodesList.filter((n) => n.type === "project").length;

    return {
      nodes: nodesList,
      links: linksList,
      stats: {
        totalNodes: nodesList.length,
        devNodes,
        skillNodes,
        projectNodes,
        totalLinks: linksList.length,
      },
    };
  }, [currentUser, connections, projects]);

  // Select node by ID handler (e.g. from DetailsPanel clickable chip)
  const handleSelectNodeById = (nodeId) => {
    const target = nodes.find((n) => n.id === nodeId);
    if (target) {
      setSelectedNode(target);
    }
  };

  // Filtered connections for Grid/Directory view
  const filteredGridConnections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return connections.filter((user) => {
      const matchQuery =
        !q ||
        `${user.firstName} ${user.lastName} ${user.about || ""} ${(user.skills || []).join(" ")}`
          .toLowerCase()
          .includes(q);
      return matchQuery;
    });
  }, [connections, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Top Header */}
      <PageTitle
        eyebrow="Network"
        title="Developer Mesh &amp; Skill Graph"
        subtitle="Explore interactive relationships across peer developers, technology stacks, and collaboration projects"
      />

      {/* Loading State */}
      {loading && (
        <div className="flex h-96 flex-col items-center justify-center rounded-xl border border-[#252A30] bg-[#111418]">
          <div className="flex items-center gap-3 text-xs text-[#00E5FF]">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#00E5FF] border-t-transparent" />
            <span>Loading network topology...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex h-96 flex-col items-center justify-center rounded-xl border border-[#F43F5E]/30 bg-[#111418] p-6 text-center">
          <p className="text-sm text-[#F43F5E] mb-2">{error}</p>
          <p className="text-xs text-[#8B949E] mb-4">
            Unable to sync peer links with the server.
          </p>
          <button
            onClick={fetchData}
            className="btn-cyan flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold"
          >
            <IconRotateCcw className="h-3.5 w-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && nodes.length <= 1 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#252A30] bg-[#111418] p-12 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF] mb-3">
            <IconNetwork className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-[#F2F4F7]">Your mesh is still forming.</h3>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-[#8B949E]">
            Connect with developers in the discovery feed or collaborate on projects to expand your interactive topology graph.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2.5 text-xs font-medium">
            <Link to="/feed" className="btn-cyan px-3.5 py-1.5 flex items-center gap-1.5">
              <IconSparkles className="h-3.5 w-3.5" />
              <span>Explore Developers</span>
            </Link>
            <Link to="/projects" className="btn-secondary px-3.5 py-1.5 flex items-center gap-1.5">
              <IconProjects className="h-3.5 w-3.5" />
              <span>Browse Projects</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Interactive Graph & Network View */}
      {!loading && !error && nodes.length > 1 && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <NetworkFilters
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            viewMode={viewMode}
            setViewMode={setViewMode}
            stats={stats}
          />

          {/* Mode 1: Interactive SVG Graph Canvas */}
          {viewMode === "graph" && (
            <div className="relative">
              <NetworkGraph
                nodes={nodes}
                links={links}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
                activeFilter={activeFilter}
                searchQuery={searchQuery}
              />

              {/* Side Details Inspector Panel */}
              <NetworkDetailsPanel
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                onSelectNodeById={handleSelectNodeById}
              />
            </div>
          )}

          {/* Mode 2: Matrix Directory Grid View */}
          {viewMode === "grid" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredGridConnections.map((user) => (
                  <article
                    key={user._id}
                    className="surface-card flex flex-col justify-between rounded-xl border border-[#252A30] bg-[#111418] p-5 shadow-sm hover:border-[#363E48] transition-colors"
                  >
                    <div>
                      <div className="flex items-start gap-3.5">
                        <div className="relative shrink-0">
                          <img
                            className="h-11 w-11 rounded-xl border border-[#252A30] object-cover bg-[#0B0D0F]"
                            src={user.photoUrl || "https://placehold.co/80x80/161A1F/8B949E?text=DEV"}
                            alt=""
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#10B981] border border-[#111418]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold text-[#F2F4F7]">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="font-mono text-xs text-[#00E5FF]">
                            @{user.firstName?.toLowerCase()}
                          </p>
                          <p className="font-mono text-[10px] text-[#57606A]">
                            {user.age && user.gender ? `${user.age}y · ${user.gender}` : "Developer"}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-xs leading-relaxed text-[#8B949E] line-clamp-2">
                        {user.about || "Developer actively contributing and building in the network."}
                      </p>

                      {user.skills?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {user.skills.map((skill) => (
                            <span key={skill} className="tech-tag text-[10px]">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#252A30] flex items-center justify-between">
                      <span className="text-[11px] text-[#10B981] flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                        Connected
                      </span>

                      <Link
                        className="btn-cyan flex items-center gap-1.5 px-3 py-1 text-xs font-semibold"
                        to={`/chat/${user._id}`}
                        state={{ user }}
                      >
                        <IconMessages className="h-3.5 w-3.5" />
                        <span>Chat</span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

