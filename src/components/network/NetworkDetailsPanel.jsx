import React from "react";
import { Link } from "react-router-dom";
import {
  IconX,
  IconMessages,
  IconExternalLink,
  IconProjects,
  IconCode,
  IconSparkles,
  IconChevronRight
} from "../ui/Icons";

export default function NetworkDetailsPanel({
  node,
  onClose,
  onSelectNodeById,
}) {
  if (!node) return null;

  const { type, data } = node;

  return (
    <aside className="absolute right-0 top-0 bottom-0 z-30 w-full sm:w-96 border-l border-[#252A30] bg-[#111418] shadow-2xl flex flex-col animate-in slide-in-from-right duration-150">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-[#252A30] px-4 bg-[#161A1F]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8B949E] font-mono">
            Node Details
          </span>
          <span className="tech-tag text-[9px] uppercase">{type}</span>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#252A30] text-[#8B949E] hover:border-[#363E48] hover:text-[#F2F4F7] transition-colors"
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
                <img
                  className="h-14 w-14 rounded-xl border border-[#252A30] object-cover bg-[#0B0D0F]"
                  src={data.photoUrl || "https://placehold.co/80x80/161A1F/8B949E?text=DEV"}
                  alt=""
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#10B981] border border-[#111418]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-bold text-[#F2F4F7]">
                  {data.firstName} {data.lastName}
                </h3>
                <p className="font-mono text-xs text-[#00E5FF]">
                  @{data.firstName?.toLowerCase() || "developer"}
                </p>
                <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-[#57606A]">
                  <span>{data.age && data.gender ? `${data.age}y · ${data.gender}` : "Developer"}</span>
                  {node.isConnection && (
                    <>
                      <span>·</span>
                      <span className="text-[#10B981]">Connected</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {data.lookingFor && (
              <div className="rounded-md border border-[#252A30] bg-[#161A1F] p-2.5 text-xs text-[#38BDF8]">
                <p className="text-[10px] text-[#57606A] uppercase mb-0.5 font-mono">Objective</p>
                <p>{data.lookingFor}</p>
              </div>
            )}

            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#57606A] mb-1">About</p>
              <p className="text-xs leading-relaxed text-[#8B949E]">
                {data.about || "Developer actively contributing and building in the network."}
              </p>
            </div>

            {/* Clickable Associated Skills */}
            {data.skills?.length > 0 && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#57606A] mb-1.5">
                  Technical Stack (Click to Focus)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.skills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => onSelectNodeById(`skill_${skill}`)}
                      className="tech-tag cursor-pointer hover:border-[#00E5FF] hover:text-[#00E5FF] transition-colors"
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
              <div className="border-t border-[#252A30] pt-3 flex flex-wrap gap-3 text-xs font-mono">
                {data.githubUrl && (
                  <a
                    href={data.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#8B949E] hover:text-[#00E5FF] transition-colors"
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
                    className="flex items-center gap-1 text-[#8B949E] hover:text-[#00E5FF] transition-colors"
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
                    className="flex items-center gap-1 text-[#8B949E] hover:text-[#00E5FF] transition-colors"
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
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#00E5FF]/40 bg-[#00E5FF]/10 text-[#00E5FF]">
                <IconCode className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F2F4F7] font-mono">{node.label}</h3>
                <p className="font-mono text-[10px] text-[#57606A]">SKILL CLUSTER</p>
              </div>
            </div>

            {/* Related Developers */}
            {data.developers?.length > 0 && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#57606A] mb-1.5">
                  Developers with {node.label} ({data.developers.length})
                </p>
                <div className="space-y-1.5">
                  {data.developers.map((dev) => (
                    <button
                      key={dev._id}
                      onClick={() => onSelectNodeById(`dev_${dev._id}`)}
                      className="w-full flex items-center gap-2.5 rounded-lg border border-[#252A30] bg-[#161A1F] p-2 text-left hover:border-[#00E5FF]/50 transition-colors"
                    >
                      <img
                        className="h-7 w-7 rounded-lg object-cover bg-[#0B0D0F]"
                        src={dev.photoUrl || "https://placehold.co/80x80/161A1F/8B949E?text=DEV"}
                        alt=""
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[#F2F4F7]">
                          {dev.firstName} {dev.lastName}
                        </p>
                        <p className="truncate font-mono text-[10px] text-[#57606A]">
                          @{dev.firstName?.toLowerCase()}
                        </p>
                      </div>
                      <IconChevronRight className="h-3.5 w-3.5 text-[#57606A]" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Related Projects */}
            {data.projects?.length > 0 && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#57606A] mb-1.5">
                  Projects requiring {node.label} ({data.projects.length})
                </p>
                <div className="space-y-1.5">
                  {data.projects.map((proj) => (
                    <button
                      key={proj._id}
                      onClick={() => onSelectNodeById(`proj_${proj._id}`)}
                      className="w-full flex items-center justify-between rounded-lg border border-[#252A30] bg-[#161A1F] p-2.5 text-left hover:border-[#00E5FF]/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[#F2F4F7]">
                          {proj.title}
                        </p>
                        <p className="font-mono text-[10px] text-[#00E5FF]">
                          Stage: {proj.stage}
                        </p>
                      </div>
                      <IconChevronRight className="h-3.5 w-3.5 text-[#57606A]" />
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
                <span className="tech-tag text-[10px] font-bold uppercase text-[#00E5FF]">
                  {data.stage}
                </span>
                <span className="font-mono text-[11px] text-[#8B949E]">{data.commitment}</span>
              </div>
              <h3 className="text-base font-bold text-[#F2F4F7] tracking-tight">{data.title}</h3>
            </div>

            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#57606A] mb-1">Description</p>
              <p className="text-xs leading-relaxed text-[#8B949E]">{data.description}</p>
            </div>

            {/* Creator info (Clickable) */}
            {data.creator && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#57606A] mb-1.5">
                  Project Lead
                </p>
                <button
                  onClick={() => onSelectNodeById(`dev_${data.creator._id}`)}
                  className="w-full flex items-center gap-2.5 rounded-lg border border-[#252A30] bg-[#161A1F] p-2 text-left hover:border-[#00E5FF]/50 transition-colors"
                >
                  <img
                    className="h-8 w-8 rounded-lg object-cover bg-[#0B0D0F]"
                    src={data.creator.photoUrl || "https://placehold.co/80x80/161A1F/8B949E?text=DEV"}
                    alt=""
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[#F2F4F7]">
                      {data.creator.firstName} {data.creator.lastName}
                    </p>
                    <p className="font-mono text-[10px] text-[#57606A]">Click to view profile</p>
                  </div>
                  <IconChevronRight className="h-3.5 w-3.5 text-[#57606A]" />
                </button>
              </div>
            )}

            {/* Required Tech Stack */}
            {data.techStack?.length > 0 && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#57606A] mb-1.5">
                  Tech Stack (Click to Focus)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.techStack.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => onSelectNodeById(`skill_${skill}`)}
                      className="tech-tag cursor-pointer hover:border-[#00E5FF] hover:text-[#00E5FF] transition-colors"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Roles Needed */}
            {data.rolesNeeded?.length > 0 && (
              <div className="border-t border-[#252A30] pt-3">
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#57606A] mb-1">Roles Needed</p>
                <p className="text-xs text-[#F2F4F7]">{data.rolesNeeded.join(" · ")}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Action Bar */}
      <div className="border-t border-[#252A30] bg-[#161A1F] p-4">
        {type === "developer" && (
          <div className="flex gap-2">
            {node.isConnection ? (
              <Link
                to={`/chat/${data._id}`}
                state={{ user: data }}
                className="btn-cyan flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold"
              >
                <IconMessages className="h-3.5 w-3.5" />
                <span>Open Chat</span>
              </Link>
            ) : (
              <Link
                to="/feed"
                className="btn-cyan flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold"
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
            className="btn-cyan w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold"
          >
            <IconProjects className="h-3.5 w-3.5" />
            <span>View Projects</span>
          </Link>
        )}

        {type === "skill" && (
          <Link
            to="/feed"
            className="btn-cyan w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold"
          >
            <IconCode className="h-3.5 w-3.5" />
            <span>Find {node.label} Developers</span>
          </Link>
        )}
      </div>
    </aside>
  );
}

