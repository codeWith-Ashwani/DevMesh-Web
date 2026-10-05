import Avatar from "./ui/Avatar";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addRequests, removeRequests } from "../utils/requestsSlice";
import { IconCheck, IconX, IconRequests } from "./ui/Icons";
import { isLegacyEmptyCollection } from "../utils/workbench";

function Requests() {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/user/requests/received`, { withCredentials: true })
      .then((res) => dispatch(addRequests(res.data.data)))
      .catch((error) => {
        if (isLegacyEmptyCollection(error, "requests"))
          dispatch(addRequests([]));
        else setError("Requests could not load. Please refresh and try again.");
      })
      .finally(() => setLoading(false));
  }, [dispatch]);

  const review = async (status, id) => {
    setBusy(id);
    setError("");
    try {
      await axios.post(
        `${BASE_URL}/request/review/${status}/${id}`,
        {},
        { withCredentials: true },
      );
      dispatch(removeRequests(id));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not review this request. Try again.",
      );
    } finally {
      setBusy(null);
    }
  };

  if (loading)
    return (
      <p role="status" className="page-wrap text-sm text-[#A5B4CE]">
        Loading requests…
      </p>
    );
  if (!requests.length && error)
    return (
      <p role="alert" className="page-wrap text-sm text-rose-300">
        {error}
      </p>
    );
  if (!requests.length) {
    return (
      <Empty
        title="No pending connection requests"
        text="When other developers want to connect with you, their incoming requests will appear here."
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
      <PageTitle
        eyebrow="Connections"
        title="Incoming Requests"
        subtitle="Review and manage collaboration connection requests from peer developers"
      />
      {error && (
        <p role="alert" className="text-sm text-rose-300">
          {error}
        </p>
      )}

      <div className="space-y-4">
        {requests.map(({ _id, fromUserId: user }) => (
          <article
            key={_id}
            className="fintech-card flex flex-col gap-4 rounded-2xl border border-[#293B5B] p-5 sm:flex-row sm:items-center sm:justify-between shadow-xl transition-all hover:border-[#4C6B94]"
          >
            <div className="flex items-start gap-4">
              <Avatar user={user} className="h-10 w-10 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#EEF4FF]">
                    {user.firstName} {user.lastName}
                  </h2>
                  <span className="text-xs font-semibold text-[#82B4FF]">
                    @{user.firstName?.toLowerCase()}
                  </span>
                </div>

                <p className="text-[11px] text-[#A5B4CE] mt-0.5">
                  {user.age && user.gender
                    ? `${user.age} yrs · ${user.gender}`
                    : "Developer"}
                  {user.lookingFor ? ` · Seeking ${user.lookingFor}` : ""}
                </p>

                <p className="mt-1 text-xs text-[#A5B4CE] line-clamp-2">
                  {user.about || "Developer requesting to connect with you."}
                </p>

                {user.skills?.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {user.skills.map((skill) => (
                      <span key={skill} className="skill-pill text-[10px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:self-center shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#293B5B]">
              <button
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#293B5B] bg-[#16233D] px-3.5 py-2 text-xs font-semibold text-[#A5B4CE] hover:border-[#F43F5E]/40 hover:bg-[#F43F5E]/10 hover:text-[#F43F5E] transition-all"
                onClick={() => review("rejected", _id)}
                disabled={busy === _id}
              >
                <IconX className="h-3.5 w-3.5" />
                <span>Decline</span>
              </button>
              <button
                className="btn-primary flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold"
                onClick={() => review("accepted", _id)}
                disabled={busy === _id}
              >
                <IconCheck className="h-3.5 w-3.5" />
                <span>Accept</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export const PageTitle = ({ eyebrow, title, subtitle }) => (
  <header className="mb-6 border-b border-[#293B5B] pb-5">
    <div className="flex items-center gap-2 mb-1.5">
      <span className="status-dot-blue" />
      <p className="text-xs uppercase font-bold tracking-wider text-[#82B4FF]">
        {eyebrow}
      </p>
    </div>
    <h1 className="text-2xl font-extrabold tracking-tight text-[#EEF4FF] sm:text-3xl">
      {title}
    </h1>
    {subtitle && (
      <p className="mt-1 text-xs sm:text-sm text-[#A5B4CE]">{subtitle}</p>
    )}
  </header>
);

export const Empty = ({ title, text }) => (
  <div className="mx-auto max-w-md px-4 py-20 text-center">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#293B5B] bg-[#101A2E] text-[#A5B4CE] shadow-xl mb-4">
      <IconRequests className="h-6 w-6 text-[#82B4FF]" />
    </div>
    <h2 className="text-base font-bold text-[#EEF4FF]">{title}</h2>
    <p className="mt-1.5 text-xs text-[#A5B4CE] leading-relaxed">{text}</p>
  </div>
);

export default Requests;
