import React, { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addRequests, removeRequests } from "../utils/requestsSlice";
import { IconRequests, IconCheck, IconX, IconTerminal } from "./ui/Icons";

function Requests() {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  useEffect(() => {
    axios
      .get(`${BASE_URL}/user/requests/received`, { withCredentials: true })
      .then((res) => dispatch(addRequests(res.data.data)))
      .catch(console.error);
  }, [dispatch]);

  const review = async (status, id) => {
    try {
      await axios.post(`${BASE_URL}/request/review/${status}/${id}`, {}, { withCredentials: true });
      dispatch(removeRequests(id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!requests.length) {
    return (
      <Empty
        title="No Pending Link Requests"
        text="Incoming peer connection requests will appear here for cryptographic handshake and review."
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageTitle
        eyebrow="PEER HANDSHAKES"
        title="Incoming Link Requests"
        subtitle="Review and authorize developer connection requests"
      />

      <div className="mt-6 space-y-3">
        {requests.map(({ _id, fromUserId: user }) => (
          <article
            key={_id}
            className="surface-card flex flex-col gap-4 rounded-xl border border-[#252A30] bg-[#111418] p-4 sm:flex-row sm:items-center sm:justify-between shadow-lg"
          >
            <div className="flex items-start gap-3.5">
              <img
                className="h-14 w-14 rounded-xl border border-[#252A30] object-cover bg-[#0B0D0F] shrink-0"
                src={user.photoUrl || "https://placehold.co/80x80/161A1F/8B949E?text=DEV"}
                alt={`${user.firstName}'s profile`}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#F2F4F7]">
                    {user.firstName} {user.lastName}
                  </h2>
                  <span className="font-mono text-[10px] text-[#00E5FF]">
                    @{user.firstName?.toLowerCase()}
                  </span>
                </div>

                <p className="font-mono text-[11px] text-[#57606A] mt-0.5">
                  {user.age && user.gender ? `${user.age} yrs · ${user.gender}` : "Developer Node"}
                  {user.lookingFor ? ` · Seeking ${user.lookingFor}` : ""}
                </p>

                <p className="mt-1.5 text-xs text-[#8B949E] line-clamp-2">
                  {user.about || "Developer requesting network mesh peering."}
                </p>

                {user.skills?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {user.skills.map((skill) => (
                      <span key={skill} className="tech-tag text-[10px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#252A30]">
              <button
                className="flex items-center justify-center gap-1.5 rounded-lg border border-[#252A30] bg-[#161A1F] px-3 py-2 font-mono text-xs font-medium text-[#8B949E] hover:border-[#F43F5E]/40 hover:bg-[#F43F5E]/10 hover:text-[#F43F5E] transition-all"
                onClick={() => review("rejected", _id)}
              >
                <IconX className="h-3.5 w-3.5" />
                <span>Decline</span>
              </button>
              <button
                className="btn-cyan flex items-center justify-center gap-1.5 px-4 py-2 font-mono text-xs font-bold"
                onClick={() => review("accepted", _id)}
              >
                <IconCheck className="h-3.5 w-3.5" />
                <span>Accept Link</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export const PageTitle = ({ eyebrow, title, subtitle }) => (
  <header className="mb-6">
    <div className="flex items-center gap-2 mb-1">
      <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF]" />
      <p className="font-mono text-[11px] uppercase tracking-widest text-[#00E5FF]">{eyebrow}</p>
    </div>
    <h1 className="text-2xl font-bold tracking-tight text-[#F2F4F7] sm:text-3xl">{title}</h1>
    {subtitle && <p className="mt-1 font-mono text-xs text-[#8B949E]">{subtitle}</p>}
  </header>
);

export const Empty = ({ title, text }) => (
  <div className="mx-auto max-w-md px-4 py-20 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#252A30] bg-[#111418] text-[#00E5FF] shadow-lg">
      <IconTerminal className="h-6 w-6" />
    </div>
    <h2 className="mt-4 text-base font-bold text-[#F2F4F7]">{title}</h2>
    <p className="mt-1 font-mono text-xs text-[#8B949E] leading-relaxed">{text}</p>
  </div>
);

export default Requests;

