import Avatar from "../ui/Avatar";
import React from "react";
import { Link } from "react-router-dom";
import {
  IconX,
  IconMessages,
  IconExternalLink,
  IconProjects,
  IconCode,
  IconSparkles,
  IconChevronRight,
} from "../ui/Icons";

export default function NetworkDetailsPanel({
  node,
  onClose,
  onSelectNodeById,
}) {
  if (!node) return null;

  const { type, data } = node;

  return (
    <aside className="absolute right-0 top-0 bottom-0 z-30 w-full sm:w-96 border-l border-[#26383D] bg-[#10191C] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-[#26383D] px-4 bg-[#142024]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9AADAA]">
            Node Inspector
          </span>
          <span className="skill-pill text-[9px] uppercase">{type}</span>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-xl border border-[#26383D] text-[#9AADAA] hover:border-[#416067] hover:text-[#EDF4F2] transition-colors"
          aria-label="Close inspector"
        >
          <IconX className="h-4 w-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* DEVELOPER TYPE */}
        {type === "developer" && (
          <>
            <div className="flex items-start gap-3.5">
              <div className="relative shrink-0">
                <Avatar user={data} className="h-10 w-10 shrink-0" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-bold text-[#EDF4F2]">
                  {data.firstName} {data.lastName}
                </h3>
                <p className="text-xs text-[#B7ED82] font-semibold">
                  @{data.firstName?.toLowerCase() || "developer"}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#9AADAA]">
                  <span>
                    {data.age && data.gender
                      ? `${data.age}y · ${data.gender}`
                      : "Developer"}
                  </span>
                  {node.isConnection && (
                    <>
                      <span>·</span>
                      <span className="text-[#10B981] font-semibold">
                        Connected
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {data.lookingFor && (
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-sky-300 font-medium">
                <p className="text-[10px] text-[#9AADAA] uppercase font-bold tracking-wider mb-0.5">
                  Objective
                </p>
                <p>{data.lookingFor}</p>
              </div>
            )}

            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#718986] mb-1">
                About
              </p>
              <p className="text-xs leading-relaxed text-[#9AADAA]">
                {data.about ||
                  "Developer actively contributing and building in the network."}
              </p>
            </div>

            {/* Clickable Associated Skills */}
            {data.skills?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#718986] mb-1.5">
                  Technical Stack (Click to Focus)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.skills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => onSelectNodeById(`skill_${skill}`)}
                      className="skill-pill cursor-pointer hover:border-[#B7ED82] hover:text-[#B7ED82] transition-colors"
                      title="Focus this skill in graph"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* External Links */}
            {(data.githubUrl || data.linkedInUrl || data.portfolioUrl) && (
              <div className="border-t border-[#26383D] pt-3 flex flex-wrap gap-3 text-xs">
                {data.githubUrl && (
                  <a
                    href={data.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#9AADAA] hover:text-[#B7ED82] transition-colors"
                  >
                    <span>GitHub</span>
                    <IconExternalLink className="h-3 w-3" />
                  </a>
                )}
                {data.linkedInUrl && (
                  <a
                    href={data.linkedInUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#9AADAA] hover:text-[#B7ED82] transition-colors"
                  >
                    <span>LinkedIn</span>
                    <IconExternalLink className="h-3 w-3" />
                  </a>
                )}
                {data.portfolioUrl && (
                  <a
                    href={data.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#9AADAA] hover:text-[#B7ED82] transition-colors"
                  >
                    <span>Portfolio</span>
                    <IconExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </>
        )}

        {/* SKILL TYPE */}
        {type === "skill" && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#B7ED82]/30 bg-[#B7ED82]/10 text-[#B7ED82] shadow-sm">
                <IconCode className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#EDF4F2]">
                  {node.label}
                </h3>
                <p className="text-[10px] text-[#718986] font-bold uppercase tracking-wider">
                  Skill Cluster
                </p>
              </div>
            </div>

            {/* Related Developers */}
            {data.developers?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#718986] mb-1.5">
                  Developers with {node.label} ({data.developers.length})
                </p>
                <div className="space-y-1.5">
                  {data.developers.map((dev) => (
                    <button
                      key={dev._id}
                      onClick={() => onSelectNodeById(`dev_${dev._id}`)}
                      className="w-full flex items-center gap-2.5 rounded-xl border border-[#26383D] bg-[#142024] p-2 text-left hover:border-[#B7ED82]/50 transition-colors"
                    >
                      <Avatar user={dev} className="h-10 w-10 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[#EDF4F2]">
                          {dev.firstName} {dev.lastName}
                        </p>
                        <p className="truncate text-[10px] text-[#9AADAA]">
                          @{dev.firstName?.toLowerCase()}
                        </p>
                      </div>
                      <IconChevronRight className="h-3.5 w-3.5 text-[#718986]" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Related Projects */}
            {data.projects?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#718986] mb-1.5">
                  Projects requiring {node.label} ({data.projects.length})
                </p>
                <div className="space-y-1.5">
                  {data.projects.map((proj) => (
                    <button
                      key={proj._id}
                      onClick={() => onSelectNodeById(`proj_${proj._id}`)}
                      className="w-full flex items-center justify-between rounded-xl border border-[#26383D] bg-[#142024] p-2.5 text-left hover:border-[#B7ED82]/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[#EDF4F2]">
                          {proj.title}
                        </p>
                        <p className="text-[10px] text-[#B7ED82] font-medium">
                          Stage: {proj.stage}
                        </p>
                      </div>
                      <IconChevronRight className="h-3.5 w-3.5 text-[#718986]" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* PROJECT TYPE */}
        {type === "project" && (
          <>
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="skill-pill text-[10px] font-bold uppercase text-[#B7ED82]">
                  {data.stage}
                </span>
                <span className="text-[11px] text-[#9AADAA] font-medium">
                  {data.commitment}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#EDF4F2] tracking-tight">
                {data.title}
              </h3>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#718986] mb-1">
                Description
              </p>
              <p className="text-xs leading-relaxed text-[#9AADAA]">
                {data.description}
              </p>
            </div>

            {/* Creator info (Clickable) */}
            {data.creator && (
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#718986] mb-1.5">
                  Project Lead
                </p>
                <button
                  onClick={() => onSelectNodeById(`dev_${data.creator._id}`)}
                  className="w-full flex items-center gap-2.5 rounded-xl border border-[#26383D] bg-[#142024] p-2 text-left hover:border-[#B7ED82]/50 transition-colors"
                >
                  <Avatar user={data.creator} className="h-10 w-10 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[#EDF4F2]">
                      {data.creator.firstName} {data.creator.lastName}
                    </p>
                    <p className="text-[10px] text-[#9AADAA]">
                      Click to view profile
                    </p>
                  </div>
                  <IconChevronRight className="h-3.5 w-3.5 text-[#718986]" />
                </button>
              </div>
            )}

            {/* Required Tech Stack */}
            {data.techStack?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#718986] mb-1.5">
                  Tech Stack (Click to Focus)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.techStack.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => onSelectNodeById(`skill_${skill}`)}
                      className="skill-pill cursor-pointer hover:border-[#B7ED82] hover:text-[#B7ED82] transition-colors"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Roles Needed */}
            {data.rolesNeeded?.length > 0 && (
              <div className="border-t border-[#26383D] pt-3">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#718986] mb-1">
                  Roles Needed
                </p>
                <p className="text-xs text-[#EDF4F2] font-medium">
                  {data.rolesNeeded.join(" · ")}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Action Bar */}
      <div className="border-t border-[#26383D] bg-[#142024] p-4">
        {type === "developer" && (
          <div className="flex gap-2">
            {node.isConnection ? (
              <Link
                to={`/chat/${data._id}`}
                state={{ user: data }}
                className="btn-primary flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold"
              >
                <IconMessages className="h-3.5 w-3.5" />
                <span>Open Chat</span>
              </Link>
            ) : (
              <Link
                to="/feed"
                className="btn-primary flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold"
              >
                <IconSparkles className="h-3.5 w-3.5" />
                <span>Find in Feed</span>
              </Link>
            )}
          </div>
        )}

        {type === "project" && (
          <Link
            to="/projects"
            className="btn-primary w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold"
          >
            <IconProjects className="h-3.5 w-3.5" />
            <span>View Projects</span>
          </Link>
        )}

        {type === "skill" && (
          <Link
            to="/feed"
            className="btn-primary w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold"
          >
            <IconCode className="h-3.5 w-3.5" />
            <span>Find {node.label} Developers</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
