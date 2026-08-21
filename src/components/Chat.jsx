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
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-7xl flex-col p-3 sm:p-6">
      <div className="flex flex-1 overflow-hidden rounded-2xl border border-[#1E2442] bg-[#0D1020] shadow-2xl">
        {/* Left Sidebar: Connections List */}
        <aside className="hidden w-72 border-r border-[#1E2442] bg-[#0D1020] md:flex md:flex-col">
          <div className="flex h-14 items-center justify-between border-b border-[#1E2442] px-4">
            <span className="text-xs font-bold text-[#8B91A7] uppercase tracking-wider">
              Direct Messages
            </span>
            <span className="rounded-full bg-[#11152A] px-2 py-0.5 text-[10px] font-bold font-mono text-[#3B82F6]">
              {connections.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {connections.length === 0 ? (
              <p className="p-6 text-center text-xs text-[#515870]">
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
                    className={`flex items-center gap-3 rounded-xl p-2.5 transition-all ${
                      isCurrent
                        ? "bg-[#151A32] border border-[#232B4E] text-[#F5F7FF] shadow-sm"
                        : "text-[#8B91A7] hover:bg-[#11152A] hover:text-[#F5F7FF] border border-transparent"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        className="h-9 w-9 rounded-xl border border-[#1E2442] object-cover bg-[#080A14]"
                        src={peer.photoUrl || "https://placehold.co/80x80/11152A/8B91A7?text=DEV"}
                        alt=""
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 status-dot-active" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold">{peer.firstName} {peer.lastName}</p>
                      <p className="truncate text-[10px] text-[#8B91A7]">
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
        <section className="flex flex-1 flex-col bg-[#080A14] min-w-0">
          {/* Header */}
          <header className="flex h-14 items-center justify-between border-b border-[#1E2442] bg-[#0D1020] px-4">
            <div className="flex items-center gap-3">
              <Link
                to="/connections"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#1E2442] text-[#8B91A7] hover:text-[#F5F7FF] md:hidden"
              >
                <IconChevronLeft className="h-4 w-4" />
              </Link>

              <div className="relative">
                <img
                  className="h-9 w-9 rounded-xl border border-[#1E2442] object-cover bg-[#080A14]"
                  src={otherUser?.photoUrl || "https://placehold.co/80x80/11152A/8B91A7?text=DEV"}
                  alt=""
                />
                <span className="absolute -bottom-0.5 -right-0.5 status-dot-active ring-2 ring-[#0D1020]" />
              </div>

              <div>
                <h2 className="text-xs font-bold text-[#F5F7FF] sm:text-sm">
                  {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "Direct Message"}
                </h2>
                <div className="flex items-center gap-2 text-[10px] text-[#8B91A7]">
                  <span>@{otherUser?.firstName?.toLowerCase() || "developer"}</span>
                  <span>·</span>
                  <span className="text-[#10B981] font-semibold">Active Mesh</span>
                </div>
              </div>
            </div>

            {otherUser?.skills && (
              <div className="hidden lg:flex items-center gap-1.5">
                {otherUser.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="skill-pill text-[9px]">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
            {error && (
              <div className="rounded-xl border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-3.5 text-xs text-[#F43F5E]">
                {error}
              </div>
            )}

            {!error && messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center p-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1E2442] bg-[#11152A] text-[#8B91A7] mb-3 shadow-lg">
                  <IconSend className="h-5 w-5 text-[#3B82F6]" />
                </div>
                <h3 className="text-sm font-bold text-[#F5F7FF]">
                  Start a conversation
                </h3>
                <p className="mt-1 max-w-sm text-xs text-[#8B91A7]">
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
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-md ${
                      isMine
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-br-sm shadow-blue-500/10"
                        : "bg-[#11152A] border border-[#1E2442] text-[#F5F7FF] rounded-bl-sm"
                    }`}
                  >
                    <p className="break-words whitespace-pre-wrap">{message.text}</p>
                  </div>
                  <span
                    className="mt-1 text-[10px] text-[#515870] font-mono px-1 font-medium"
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
            className="flex items-center gap-2.5 border-t border-[#1E2442] bg-[#0D1020] p-3 sm:p-4"
          >
            <div className="relative flex-1">
              <input
                className="w-full rounded-xl border border-[#1E2442] bg-[#11152A] px-4 py-2.5 text-xs text-[#F5F7FF] placeholder-[#515870] outline-none hover:border-[#2A335C] focus:border-[#3B82F6] transition-colors"
                value={text}
                maxLength="2000"
                placeholder="Type a message... (Press Enter to send)"
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="btn-primary flex h-10 items-center justify-center gap-2 px-5 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
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
