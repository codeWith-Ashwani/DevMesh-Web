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
    <article className="fintech-card w-full max-w-sm overflow-hidden rounded-2xl border border-[#1E2442] shadow-xl hover:border-[#2A335C] transition-all">
      {/* Developer Hero */}
      <div className="p-5 pb-4">
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            <img
              className="h-14 w-14 rounded-2xl border border-[#1E2442] object-cover bg-[#0D1020] shadow-md"
              src={photoUrl || "https://placehold.co/120x120/11152A/8B91A7?text=DEV"}
              alt={`${firstName}'s profile`}
            />
            <span className="absolute -bottom-0.5 -right-0.5 status-dot-active border border-[#0D1020]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold tracking-tight text-[#F5F7FF]">
              {firstName} {lastName}
            </h3>
            <p className="truncate text-xs font-semibold text-[#3B82F6]">
              @{firstName?.toLowerCase() || "developer"}
            </p>
            {(age || gender) && (
              <p className="mt-0.5 text-[11px] text-[#8B91A7]">
                {[age ? `${age} yrs` : null, gender].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>

        {/* Goal / Looking For Banner */}
        {lookingFor && (
          <div className="mt-3 rounded-xl border border-[#1E2442] bg-[#151A32]/60 px-3 py-1.5 text-xs text-[#38BDF8] flex items-center gap-2">
            <span className="text-[10px] text-[#8B91A7] uppercase font-semibold">Goal:</span>
            <span className="truncate font-medium">{lookingFor}</span>
          </div>
        )}

        {/* Bio */}
        <div className="mt-3">
          <p className="min-h-[2.5rem] text-xs leading-relaxed text-[#8B91A7] line-clamp-3">
            {about || "Developer actively building software and open for engineering collaboration."}
          </p>
        </div>

        {/* Skills */}
        <div className="mt-3.5">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[#515870] mb-1.5">
            Technical Stack
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <span key={skill} className="skill-pill">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-[#515870]">Stack not configured</span>
            )}
          </div>
        </div>

        {/* Social / External Links */}
        {(githubUrl || linkedInUrl || portfolioUrl) && (
          <div className="mt-4 flex flex-wrap gap-3 border-t border-[#1E2442] pt-3 text-xs">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[#8B91A7] hover:text-[#3B82F6] transition-colors"
              >
                <span className="font-medium">GitHub</span>
                <IconExternalLink className="h-3 w-3" />
              </a>
            )}
            {linkedInUrl && (
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[#8B91A7] hover:text-[#3B82F6] transition-colors"
              >
                <span className="font-medium">LinkedIn</span>
                <IconExternalLink className="h-3 w-3" />
              </a>
            )}
            {portfolioUrl && (
              <a
                href={portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[#8B91A7] hover:text-[#3B82F6] transition-colors"
              >
                <span className="font-medium">Portfolio</span>
                <IconExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {!isPreview && (
        <div className="grid grid-cols-2 gap-2 border-t border-[#1E2442] bg-[#0D1020]/90 p-3">
          <button
            className="flex items-center justify-center gap-1.5 rounded-xl border border-[#1E2442] bg-[#11152A] px-3 py-2 text-xs font-medium text-[#8B91A7] hover:border-[#F43F5E]/40 hover:bg-[#F43F5E]/10 hover:text-[#F43F5E] transition-all"
            onClick={() => handleSendRequest("ignore")}
          >
            <IconX className="h-3.5 w-3.5" />
            <span>Pass</span>
          </button>
          <button
            className="btn-primary flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold"
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



