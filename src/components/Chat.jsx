import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useLocation, useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import {
  IconSend,
  IconChevronLeft
} from "./ui/Icons";

function Chat() {
  const { userId } = useParams();
  const location = useLocation();
  const currentUser = useSelector((store) => store.user);
  const connections = useSelector((store) => store.connections) || [];

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const otherUser =
    location.state?.user || connections?.find((u) => u._id === userId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/chat/${userId}`, {
          withCredentials: true,
        });
        setMessages(response.data.data);
        setError("");
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load chat messages.");
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/chat/${userId}`,
        { text },
        { withCredentials: true }
      );
      setMessages((current) => [...current, response.data.data]);
      setText("");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-7xl flex-col p-3 sm:p-6">
      <div className="flex flex-1 overflow-hidden rounded-xl border border-[#252A30] bg-[#111418] shadow-lg">
        {/* Left Sidebar: Connections List */}
        <aside className="hidden w-64 border-r border-[#252A30] bg-[#0B0D0F] md:flex md:flex-col">
          <div className="flex h-12 items-center justify-between border-b border-[#252A30] px-4">
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider font-mono">
              Conversations
            </span>
            <span className="rounded-full border border-[#252A30] bg-[#161A1F] px-1.5 py-0.2 text-[10px] font-mono text-[#00E5FF]">
              {connections.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {connections.length === 0 ? (
              <p className="p-4 text-center text-xs text-[#57606A]">
                No connected developers yet.
              </p>
            ) : (
              connections.map((peer) => {
                const isCurrent = peer._id === userId;
                return (
                  <Link
                    key={peer._id}
                    to={`/chat/${peer._id}`}
                    state={{ user: peer }}
                    className={`flex items-center gap-2.5 rounded-lg p-2 transition-colors ${
                      isCurrent
                        ? "bg-[#161A1F] border border-[#252A30] text-[#00E5FF]"
                        : "text-[#8B949E] hover:bg-[#161A1F]/60 hover:text-[#F2F4F7]"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        className="h-8 w-8 rounded-lg border border-[#252A30] object-cover bg-[#161A1F]"
                        src={peer.photoUrl || "https://placehold.co/80x80/161A1F/8B949E?text=DEV"}
                        alt=""
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#10B981]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{peer.firstName} {peer.lastName}</p>
                      <p className="truncate font-mono text-[10px] text-[#57606A]">
                        {peer.skills?.slice(0, 2).join(" · ") || "Developer"}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Main Channel Workspace */}
        <section className="flex flex-1 flex-col bg-[#111418] min-w-0">
          {/* Header */}
          <header className="flex h-14 items-center justify-between border-b border-[#252A30] bg-[#161A1F] px-4">
            <div className="flex items-center gap-3">
              <Link
                to="/connections"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#252A30] text-[#8B949E] hover:text-[#F2F4F7] md:hidden"
              >
                <IconChevronLeft className="h-4 w-4" />
              </Link>

              <div className="relative">
                <img
                  className="h-8 w-8 rounded-lg border border-[#252A30] object-cover bg-[#0B0D0F]"
                  src={otherUser?.photoUrl || "https://placehold.co/80x80/161A1F/8B949E?text=DEV"}
                  alt=""
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#10B981] ring-2 ring-[#161A1F]" />
              </div>

              <div>
                <h2 className="text-xs font-bold text-[#F2F4F7] sm:text-sm">
                  {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "Direct Message"}
                </h2>
                <div className="flex items-center gap-2 font-mono text-[10px] text-[#57606A]">
                  <span>@{otherUser?.firstName?.toLowerCase() || "developer"}</span>
                  <span>·</span>
                  <span className="text-[#10B981]">Active</span>
                </div>
              </div>
            </div>

            {otherUser?.skills && (
              <div className="hidden lg:flex items-center gap-1">
                {otherUser.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="tech-tag text-[9px]">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {error && (
              <div className="rounded-lg border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-3 text-xs text-[#F43F5E]">
                {error}
              </div>
            )}

            {!error && messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center p-6">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-[#252A30] bg-[#161A1F] text-[#8B949E] mb-3">
                  <IconSend className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-semibold text-[#F2F4F7]">
                  Start a conversation
                </h3>
                <p className="mt-1 max-w-sm text-xs text-[#57606A]">
                  Say hello, discuss technical stacks, and coordinate collaboration on projects.
                </p>
              </div>
            )}

            {messages.map((message) => {
              const isMine = message.fromUserId === currentUser?._id;
              return (
                <div
                  key={message._id}
                  className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                      isMine
                        ? "bg-[#00E5FF] text-[#0B0D0F] font-medium rounded-br-none"
                        : "bg-[#161A1F] border border-[#252A30] text-[#F2F4F7] rounded-bl-none"
                    }`}
                  >
                    <p className="break-words whitespace-pre-wrap">{message.text}</p>
                  </div>
                  <span
                    className="mt-1 font-mono text-[9px] text-[#57606A] px-1"
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={sendMessage}
            className="flex items-center gap-2 border-t border-[#252A30] bg-[#0B0D0F] p-3"
          >
            <div className="relative flex-1">
              <input
                className="w-full rounded-lg border border-[#252A30] bg-[#161A1F] px-3.5 py-2 text-xs text-[#F2F4F7] placeholder-[#57606A] outline-none hover:border-[#363E48] focus:border-[#00E5FF] transition-colors"
                value={text}
                maxLength="2000"
                placeholder="Type a message... (Press Enter to send)"
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="btn-cyan flex h-8.5 items-center justify-center gap-1.5 px-3.5 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <IconSend className="h-3.5 w-3.5" />
              <span>Send</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Chat;



