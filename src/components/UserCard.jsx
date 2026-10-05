import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { removeUserFeed } from "../utils/feedSlice";
import { IconExternalLink, IconPlus } from "./ui/Icons";
import Avatar from "./ui/Avatar";

export default function UserCard({ user }) {
  const {
    _id,
    firstName,
    lastName,
    about,
    skills = [],
    githubUrl,
    linkedInUrl,
    portfolioUrl,
    lookingFor,
  } = user;
  const dispatch = useDispatch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = async (status) => {
    setBusy(true);
    setError("");
    try {
      await axios.post(
        BASE_URL + "/request/send/" + status + "/" + _id,
        {},
        { withCredentials: true },
      );
      dispatch(removeUserFeed(_id));
    } catch (error) {
      setError(
        error.response?.data?.message || "Request failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <article className="workbench-card rounded-2xl overflow-hidden flex flex-col h-full w-full">
      <div className="p-6 flex-1">
        <div className="flex gap-4 items-start">
          <Avatar user={user} className="h-12 w-12 shrink-0" />
          <div className="min-w-0">
            <h3 className="text-base font-semibold truncate">
              {firstName} {lastName}
            </h3>
            <p className="text-xs text-[#B7ED82] font-mono mt-1">
              @{firstName?.toLowerCase() || "developer"}
            </p>
          </div>
        </div>
        {lookingFor && (
          <p className="mt-5 text-xs text-[#9AADAA]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#B7ED82] mr-2" />
            Open to {lookingFor.toLowerCase()}
          </p>
        )}
        <p className="text-sm text-[#9AADAA] leading-6 line-clamp-3 mt-4 min-h-[72px]">
          {about || "A developer looking for people to build and learn with."}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {skills.length ? (
            skills.slice(0, 8).map((skill) => (
              <span className="skill-pill" key={skill}>
                {skill}
              </span>
            ))
          ) : (
            <span className="text-xs text-[#718986]">No skills added yet.</span>
          )}
        </div>
        {(githubUrl || linkedInUrl || portfolioUrl) && (
          <div className="flex flex-wrap gap-4 mt-5">
            {[
              ["GitHub", githubUrl],
              ["LinkedIn", linkedInUrl],
              ["Portfolio", portfolioUrl],
            ]
              .filter(([, url]) => url)
              .map(([label, url]) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex gap-1 items-center text-xs text-[#9AADAA] hover:text-[#B7ED82]"
                >
                  {label}
                  <IconExternalLink className="h-3 w-3" />
                </a>
              ))}
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-rose-300 px-6 pb-3">
          {error}
        </p>
      )}
      {_id && (
        <div className="border-t border-[#26383D] px-6 py-4 flex gap-3">
          <button
            className="btn-primary flex-1 px-3 py-2.5 text-sm flex items-center justify-center gap-2"
            disabled={busy}
            onClick={() => request("interested")}
          >
            <IconPlus />
            {busy ? "Sending…" : "Connect"}
          </button>
          <button
            className="btn-secondary px-4 py-2.5 text-sm text-[#9AADAA]"
            disabled={busy}
            onClick={() => request("ignore")}
          >
            Skip
          </button>
        </div>
      )}
    </article>
  );
}
