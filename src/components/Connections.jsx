import Avatar from "./ui/Avatar";
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addConnections } from "../utils/connectionsSlice";
import { isLegacyEmptyCollection } from "../utils/workbench";
import { PageTitle } from "./Requests";
import NetworkGraph from "./network/NetworkGraph";
import NetworkFilters from "./network/NetworkFilters";
import NetworkDetailsPanel from "./network/NetworkDetailsPanel";
import { cachedGet, peekResource } from "../utils/resourceCache";
import {
  IconNetwork,
  IconMessages,
  IconProjects,
  IconRotateCcw,
  IconSparkles,
} from "./ui/Icons";

export default function Connections() {
  const dispatch = useDispatch();
  const currentUser = useSelector((store) => store.user);
  const rawConnections = useSelector((store) => store.connections);
  const connections = useMemo(() => rawConnections || [], [rawConnections]);

  const [projects, setProjects] = useState(() => peekResource('/projects')?.data || []);
  const [loading, setLoading] = useState(() => !peekResource('/user/connections'));
  const [error, setError] = useState("");
  const loadController = useRef(null);

  // Graph and Filter State
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "graph" | "grid"
  const [selectedNode, setSelectedNode] = useState(null);

  // Fetch real connections & real projects
  const fetchData = useCallback(async (force = false) => {
    loadController.current?.abort();
    const controller = new AbortController();
    loadController.current = controller;
    const options = { force: Boolean(force), signal: controller.signal };
    const people = cachedGet('/user/connections', options)
      .then(response => { if (!controller.signal.aborted) dispatch(addConnections(response.data.data)); })
      .catch(err => {
        if (controller.signal.aborted) return;
        if (isLegacyEmptyCollection(err, "connections")) dispatch(addConnections([]));
        else setError("Connections could not load. Please try again.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    // Project graph enrichment must not delay opening the connected people list.
    const spaces = cachedGet('/projects', options)
      .then(response => { if (!controller.signal.aborted) setProjects(response.data.data); })
      .catch(() => {});
    await Promise.all([people, spaces]);
  }, [dispatch]);

  useEffect(() => {
    fetchData();
    return () => loadController.current?.abort();
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
        label: currentUser.firstName || "You",
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Top Header */}
      <PageTitle
        eyebrow="Network"
        title="Your people, one place."
        subtitle="Reach out to a teammate, or explore the skills and projects that connect you."
      />

      {/* Loading State */}
      {loading && (
        <div className="flex h-96 flex-col items-center justify-center rounded-2xl border border-[#293B5B] bg-[#101A2E]">
          <div className="flex items-center gap-3 text-xs text-[#82B4FF] font-medium">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#82B4FF] border-t-transparent" />
            <span>Loading network topology...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex h-96 flex-col items-center justify-center rounded-2xl border border-[#F43F5E]/30 bg-[#101A2E] p-6 text-center">
          <p className="text-sm font-semibold text-[#F43F5E] mb-2">{error}</p>
          <p className="text-xs text-[#A5B4CE] mb-4">
            Unable to sync peer links with the server.
          </p>
          <button
            onClick={() => {
              setLoading(true);
              setError("");
              fetchData(true);
            }}
            className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
          >
            <IconRotateCcw className="h-3.5 w-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && nodes.length <= 1 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-[#293B5B] bg-[#101A2E] p-12 text-center shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#82B4FF]/30 bg-[#82B4FF]/10 text-[#82B4FF] mb-4 shadow-lg shadow-blue-500/10">
            <IconNetwork className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-[#EEF4FF]">
            Your mesh is still forming.
          </h3>
          <p className="mt-1.5 max-w-md text-xs sm:text-sm leading-relaxed text-[#A5B4CE]">
            Connect with developers in the discovery feed or collaborate on
            projects to expand your interactive topology graph.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold">
            <Link
              to="/feed"
              className="btn-primary px-4 py-2 flex items-center gap-1.5"
            >
              <IconSparkles className="h-3.5 w-3.5" />
              <span>Explore Developers</span>
            </Link>
            <Link
              to="/projects"
              className="btn-secondary px-4 py-2 flex items-center gap-1.5"
            >
              <IconProjects className="h-3.5 w-3.5 text-[#82B4FF]" />
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
                    className="fintech-card flex flex-col justify-between rounded-2xl border border-[#293B5B] p-5 shadow-xl hover:border-[#4C6B94] transition-all"
                  >
                    <div>
                      <div className="flex items-start gap-3.5">
                        <div className="relative shrink-0">
                          <Avatar user={user} className="h-10 w-10 shrink-0" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-bold text-[#EEF4FF]">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-xs text-[#82B4FF] font-semibold">
                            @{user.firstName?.toLowerCase()}
                          </p>
                          <p className="text-[11px] text-[#A5B4CE]">
                            {user.age && user.gender
                              ? `${user.age}y · ${user.gender}`
                              : "Developer"}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-xs leading-relaxed text-[#A5B4CE] line-clamp-2">
                        {user.about ||
                          "Developer actively contributing and building in the network."}
                      </p>

                      {user.skills?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {user.skills.map((skill) => (
                            <span
                              key={skill}
                              className="skill-pill text-[10px]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-[#293B5B] flex items-center justify-between">
                      <span className="text-xs text-[#10B981] font-semibold flex items-center gap-1.5">
                        <span className="status-dot-active" />
                        Connected
                      </span>

                      <Link
                        className="btn-primary flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold"
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
