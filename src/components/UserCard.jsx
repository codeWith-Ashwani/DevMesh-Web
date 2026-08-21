import React from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { removeUserFeed } from "../utils/feedSlice";
import { IconExternalLink, IconSparkles, IconX } from "./ui/Icons";

const UserCard = ({ user }) => {
  const {
    _id,
    firstName,
    lastName,
    photoUrl,
    age,
    gender,
    about,
    skills = [],
    githubUrl,
    linkedInUrl,
    portfolioUrl,
    lookingFor,
  } = user;
  const dispatch = useDispatch();
  const isPreview = !_id;

  const handleSendRequest = async (status) => {
    try {
      await axios.post(`${BASE_URL}/request/send/${status}/${_id}`, {}, { withCredentials: true });
      dispatch(removeUserFeed(_id));
    } catch (err) {
      console.error("Unable to send request", err);
    }
  };

  return (
    <article className="surface-card w-full max-w-sm overflow-hidden rounded-xl border border-[#252A30] bg-[#111418] shadow-lg transition-colors hover:border-[#363E48]">
      {/* Developer Hero */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            <img
              className="h-14 w-14 rounded-xl border border-[#252A30] object-cover bg-[#0B0D0F]"
              src={photoUrl || "https://placehold.co/120x120/161A1F/8B949E?text=DEV"}
              alt={`${firstName}'s profile`}
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#10B981] border border-[#111418]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold tracking-tight text-[#F2F4F7]">
              {firstName} {lastName}
            </h3>
            <p className="truncate font-mono text-xs text-[#00E5FF]">
              @{firstName?.toLowerCase() || "developer"}
            </p>
            {(age || gender) && (
              <p className="mt-0.5 font-mono text-[11px] text-[#8B949E]">
                {[age ? `${age}y` : null, gender].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>

        {/* Goal / Looking For Banner */}
        {lookingFor && (
          <div className="mt-3 rounded-md border border-[#252A30] bg-[#161A1F] px-3 py-1.5 text-xs text-[#38BDF8] flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#57606A] uppercase">Goal:</span>
            <span className="truncate">{lookingFor}</span>
          </div>
        )}

        {/* Bio */}
        <div className="mt-3">
          <p className="min-h-[2.5rem] text-xs leading-relaxed text-[#8B949E] line-clamp-3">
            {about || "Developer actively building software and open for engineering collaboration."}
          </p>
        </div>

        {/* Skills */}
        <div className="mt-3.5">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#57606A] mb-1.5">
            Technical Stack
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <span key={skill} className="tech-tag">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-[11px] font-mono text-[#57606A]">Stack not configured</span>
            )}
          </div>
        </div>

        {/* Social / External Links */}
        {(githubUrl || linkedInUrl || portfolioUrl) && (
          <div className="mt-3.5 flex flex-wrap gap-3 border-t border-[#252A30] pt-2.5 text-xs font-mono">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[#8B949E] hover:text-[#00E5FF] transition-colors"
              >
                <span>GitHub</span>
                <IconExternalLink className="h-3 w-3" />
              </a>
            )}
            {linkedInUrl && (
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[#8B949E] hover:text-[#00E5FF] transition-colors"
              >
                <span>LinkedIn</span>
                <IconExternalLink className="h-3 w-3" />
              </a>
            )}
            {portfolioUrl && (
              <a
                href={portfolioUrl}
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
      </div>

      {/* Actions */}
      {!isPreview && (
        <div className="grid grid-cols-2 gap-2 border-t border-[#252A30] bg-[#161A1F] p-3">
          <button
            className="flex items-center justify-center gap-1.5 rounded-lg border border-[#252A30] bg-[#111418] px-3 py-2 text-xs font-medium text-[#8B949E] hover:border-[#F43F5E]/40 hover:bg-[#F43F5E]/10 hover:text-[#F43F5E] transition-colors"
            onClick={() => handleSendRequest("ignore")}
          >
            <IconX className="h-3.5 w-3.5" />
            <span>Pass</span>
          </button>
          <button
            className="btn-cyan flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold"
            onClick={() => handleSendRequest("interested")}
          >
            <IconSparkles className="h-3.5 w-3.5" />
            <span>Connect</span>
          </button>
        </div>
      )}
    </article>
  );
};

export default UserCard;


