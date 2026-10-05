import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import Avatar from "./ui/Avatar";
const options = { withCredentials: true };
const merge = (a, b) =>
  [...new Map([...a, ...b].map((m) => [m._id, m])).values()].sort((x, y) =>
    x._id.localeCompare(y._id),
  );
const title = (c, me) =>
  c.name ||
  c.members
    ?.filter((m) => m._id !== me)
    .map((m) => `${m.firstName} ${m.lastName || ""}`)
    .join(", ") ||
  "Conversation";
export default function Chat() {
  const { userId, conversationId } = useParams();
  return <ChatSession key={userId || conversationId || "inbox"} />;
}
function ChatSession() {
  const { userId, conversationId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((s) => s.user);
  const [conversations, setConversations] = useState([]);
  const [listCursor, setListCursor] = useState(null);
  const [moreConversations, setMoreConversations] = useState(false);
  const [connections, setConnections] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [groupOpen, setGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selected, setSelected] = useState([]);
  const [memberToAdd, setMemberToAdd] = useState("");
  const [typing, setTyping] = useState("");
  const [readers, setReaders] = useState({});
  const socket = useRef(null);
  const retry = useRef(null);
  const typingTimer = useRef(null);
  const lastTyping = useRef(0);
  const latestMessage = useRef(null);
  const bottom = useRef(null);
  const active = conversations.find((c) => c._id === activeId);
  useEffect(() => {
    if (!user?._id) return;
    let alive = true;
    Promise.all([
      axios.get(`${BASE_URL}/conversations`, options),
      axios.get(`${BASE_URL}/user/connections`, options),
    ])
      .then(([a, b]) => {
        if (alive) {
          setConversations(a.data.data);
          setListCursor(a.data.before);
          setMoreConversations(a.data.hasMore);
          setConnections(b.data.data || []);
        }
      })
      .catch((e) => {
        if (alive)
          setError(e.response?.data?.message || "Unable to load conversations");
      });
    return () => {
      alive = false;
    };
  }, [user?._id]);
  useEffect(() => {
    if (!user?._id) return;
    let alive = true;
    const resolve = async () => {
      try {
        const id = userId
          ? (
              await axios.post(
                `${BASE_URL}/conversations/direct`,
                { userId },
                options,
              )
            ).data.data._id
          : conversationId;
        if (!alive) return;
        setMessages([]);
        setReaders({});
        setError("");
        retry.current = null;
        latestMessage.current = null;
        setActiveId(id || null);
        const response = await axios.get(`${BASE_URL}/conversations`, options);
        const detail = id
          ? (await axios.get(`${BASE_URL}/conversations/${id}`, options)).data
              .data
          : null;
        if (alive) {
          setConversations(
            detail
              ? [...response.data.data.filter((c) => c._id !== id), detail]
              : response.data.data,
          );
          setListCursor(response.data.before);
          setMoreConversations(response.data.hasMore);
        }
      } catch (e) {
        if (alive)
          setError(e.response?.data?.message || "Unable to open conversation");
      }
    };
    resolve();
    return () => {
      alive = false;
    };
  }, [userId, conversationId, user?._id]);
  useEffect(() => {
    if (!user?._id) return;
    let alive = true;
    const client = io(BASE_URL, {
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
    });
    socket.current = client;
    const load = async () => {
      if (!activeId) return;
      try {
        let after = latestMessage.current;
        let more;
        do {
          const result = await axios.get(
            `${BASE_URL}/conversations/${activeId}/messages`,
            { ...options, params: after ? { after, limit: 100 } : {} },
          );
          if (!alive) return;
          setMessages((current) => merge(current, result.data.data));
          if (!after) {
            setHasMore(result.data.hasMore);
            setCursor(result.data.before);
          }
          more = Boolean(after && result.data.hasMore);
          after = result.data.after || after;
          if (after) latestMessage.current = after;
        } while (more && alive);
        const receipts = await axios.get(
          `${BASE_URL}/conversations/${activeId}/receipts`,
          options,
        );
        if (alive)
          setReaders(
            Object.fromEntries(
              receipts.data.data.map((r) => [r.user, r.message]),
            ),
          );
      } catch (e) {
        if (alive)
          setError(
            e.response?.data?.message || "Unable to synchronize messages",
          );
      }
    };
    client.on("connect", () => {
      setConnected(true);
      setError("");
      load();
    });
    client.on("disconnect", () => setConnected(false));
    client.on("connect_error", () => {
      setConnected(false);
      setError(
        "Connection unavailable. Reconnecting; sign in again if your session expired.",
      );
    });
    client.on("message:new", (message) => {
      setConversations((current) =>
        current.map((c) =>
          c._id === message.conversation
            ? {
                ...c,
                lastMessage: message,
                unreadCount:
                  c._id === activeId
                    ? 0
                    : (c.unreadCount || 0) +
                      (message.sender === user._id ? 0 : 1),
              }
            : c,
        ),
      );
      if (message.conversation === activeId) {
        setMessages((current) => merge(current, [message]));
        if (!latestMessage.current || latestMessage.current < message._id)
          latestMessage.current = message._id;
      }
    });
    client.on("conversation:typing", (event) => {
      if (event.conversationId !== activeId) return;
      setTyping(event.userId);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(""), 2500);
    });
    client.on("conversation:read", (event) => {
      if (event.conversationId === activeId)
        setReaders((current) => ({
          ...current,
          [event.userId]:
            !current[event.userId] || current[event.userId] < event.messageId
              ? event.messageId
              : current[event.userId],
        }));
    });
    load();
    return () => {
      alive = false;
      clearTimeout(typingTimer.current);
      client.disconnect();
      socket.current = null;
    };
  }, [activeId, user?._id]);
  useEffect(() => {
    const last = messages.at(-1);
    const stream = bottom.current?.parentElement;
    stream?.scrollTo({ top: stream.scrollHeight, behavior: "smooth" });
    if (connected && last && document.visibilityState === "visible")
      socket.current?.emit(
        "conversation:read",
        { conversationId: activeId, messageId: last._id },
        () => {},
      );
  }, [messages, activeId, connected]);
  useEffect(() => {
    const mark = () => {
      const last = messages.at(-1);
      if (
        document.visibilityState === "visible" &&
        last &&
        socket.current?.connected
      )
        socket.current.emit(
          "conversation:read",
          { conversationId: activeId, messageId: last._id },
          () => {},
        );
    };
    document.addEventListener("visibilitychange", mark);
    return () => document.removeEventListener("visibilitychange", mark);
  }, [messages, activeId]);
  const send = (event) => {
    event.preventDefault();
    if (!text.trim() || sending || !socket.current?.connected) return;
    const payload =
      retry.current?.text === text.trim()
        ? retry.current
        : {
            conversationId: activeId,
            text: text.trim(),
            clientId: crypto.randomUUID(),
          };
    retry.current = payload;
    setSending(true);
    setError("");
    socket.current
      .timeout(10000)
      .emit("message:send", payload, (timeout, result) => {
        setSending(false);
        if (timeout || !result?.ok) {
          setError(
            result?.message ||
              "Delivery not confirmed. Send again to retry safely.",
          );
          return;
        }
        setMessages((current) => merge(current, [result.data]));
        setText("");
        retry.current = null;
      });
  };
  const older = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/conversations/${activeId}/messages`,
        { ...options, params: { before: cursor } },
      );
      setMessages((current) => merge(response.data.data, current));
      setHasMore(response.data.hasMore);
      setCursor(response.data.before);
    } catch {
      setError("Unable to load earlier messages");
    }
  };
  const create = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        `${BASE_URL}/conversations/group`,
        { name: groupName, members: selected },
        options,
      );
      setGroupOpen(false);
      setGroupName("");
      setSelected([]);
      navigate(`/messages/${response.data.data._id}`);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to create group");
    }
  };
  const manageMember = async (action, userId) => {
    try {
      await axios.patch(
        `${BASE_URL}/conversations/${activeId}/members`,
        { action, userId },
        options,
      );
      const response = await axios.get(
        `${BASE_URL}/conversations/${activeId}`,
        options,
      );
      setConversations((current) =>
        current.map((c) => (c._id === activeId ? response.data.data : c)),
      );
      setMemberToAdd("");
    } catch (e) {
      setError(
        e.response?.data?.message || "Unable to change group membership",
      );
    }
  };
  const moreChats = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/conversations`, {
        ...options,
        params: { before: listCursor },
      });
      setConversations((current) => [
        ...new Map(
          [...current, ...response.data.data].map((c) => [c._id, c]),
        ).values(),
      ]);
      setListCursor(response.data.before);
      setMoreConversations(response.data.hasMore);
    } catch {
      setError("Unable to load more conversations");
    }
  };
  return (
    <div className="page-wrap text-[#EDF4F2]">
      <header className="flex justify-between items-center mb-4">
        <div>
          <p className="eyebrow mb-3">// your team's conversation space</p>
          <h1 className="page-title">Messages</h1>
          <p className="text-sm text-[#9AADAA]">
            Personal conversations and collaboration groups
          </p>
        </div>
        <button
          className="btn-primary p-2"
          onClick={() => setGroupOpen((v) => !v)}
        >
          New group
        </button>
      </header>
      {error && (
        <p role="alert" className="p-3 mb-3 bg-red-950 text-red-200 rounded-xl">
          {error}
        </p>
      )}
      {groupOpen && (
        <form
          onSubmit={create}
          className="p-4 mb-4 border border-[#26383D] rounded-xl space-y-3"
        >
          <label className="block">
            Group name
            <input
              required
              maxLength={80}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="block bg-[#142024] p-2 rounded w-full"
            />
          </label>
          <fieldset>
            <legend>Choose connected collaborators</legend>
            <div className="flex flex-wrap gap-3">
              {connections.map((peer) => (
                <label key={peer._id}>
                  <input
                    type="checkbox"
                    checked={selected.includes(peer._id)}
                    onChange={(e) =>
                      setSelected((v) =>
                        e.target.checked
                          ? [...v, peer._id]
                          : v.filter((id) => id !== peer._id),
                      )
                    }
                  />{" "}
                  {peer.firstName} {peer.lastName}
                </label>
              ))}
            </div>
          </fieldset>
          <button disabled={!selected.length} className="btn-primary p-2">
            Create group
          </button>
        </form>
      )}
      {active?.kind === "group" && (
        <details className="p-3 mb-3 border border-[#26383D] rounded-xl">
          <summary>Group members</summary>
          <ul>
            {active.members.map((m) => (
              <li key={m._id} className="flex justify-between py-2">
                {m.firstName} {m.lastName}
                {active.owner === user?._id && m._id !== user?._id && (
                  <button
                    className="text-red-300"
                    onClick={() => manageMember("remove", m._id)}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
          {active.owner === user?._id ? (
            <div className="flex gap-2">
              <select
                aria-label="Collaborator to add"
                className="bg-[#142024] p-2"
                value={memberToAdd}
                onChange={(e) => setMemberToAdd(e.target.value)}
              >
                <option value="">Choose connection</option>
                {connections
                  .filter((c) => !active.members.some((m) => m._id === c._id))
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
              </select>
              <button
                disabled={!memberToAdd}
                onClick={() => manageMember("add", memberToAdd)}
              >
                Add member
              </button>
            </div>
          ) : (
            <button
              onClick={async () => {
                try {
                  await axios.patch(
                    `${BASE_URL}/conversations/${activeId}/members`,
                    { action: "remove", userId: user._id },
                    options,
                  );
                  navigate("/messages");
                } catch (e) {
                  setError(
                    e.response?.data?.message || "Unable to leave group",
                  );
                }
              }}
            >
              Leave group
            </button>
          )}
        </details>
      )}
      {moreConversations && (
        <button className="btn-secondary p-2 mb-3" onClick={moreChats}>
          Load more conversations
        </button>
      )}
      <div className="grid md:grid-cols-[260px_1fr] border border-[#26383D] rounded-2xl overflow-hidden bg-[#0A1012]">
        <aside
          className={`${activeId ? "hidden md:block" : ""} p-3 border-r border-[#26383D] md:max-h-[70vh] overflow-y-auto bg-[#10191C]`}
        >
          <h2 className="font-bold mb-2">Conversations</h2>
          {conversations.map((c) => (
            <Link
              key={c._id}
              to={`/messages/${c._id}`}
              className={`block p-3 rounded-lg mb-1 text-sm border ${activeId === c._id ? "bg-[#1B2B30] border-[#416067]" : "border-transparent hover:bg-[#142024]"}`}
            >
              {title(c, user?._id)}
              {c.unreadCount > 0 && (
                <span className="ml-2 text-blue-400">
                  ({c.unreadCount} unread)
                </span>
              )}
              <small className="block text-[#9AADAA]">{c.kind}</small>
            </Link>
          ))}
          <h2 className="font-bold mt-5 mb-2">Start a personal chat</h2>
          {connections.map((peer) => (
            <Link
              key={peer._id}
              className="flex gap-3 items-center p-2 text-sm rounded-lg hover:bg-[#142024]"
              to={`/chat/${peer._id}`}
            >
              <Avatar user={peer} className="h-8 w-8 shrink-0" />
              {peer.firstName} {peer.lastName}
            </Link>
          ))}
        </aside>
        <section
          className={`${activeId ? "flex" : "hidden md:flex"} flex-col h-[60dvh] min-h-[300px] md:h-[70vh] min-w-0`}
        >
          <header className="p-4 border-b border-[#26383D]">
            <Link
              to="/messages"
              className="md:hidden block text-xs text-[#B7ED82] mb-3"
            >
              ← All conversations
            </Link>
            <h2 className="font-bold">
              {active ? title(active, user?._id) : "Choose a conversation"}
            </h2>
            <small className="text-[#9AADAA]">
              {activeId
                ? connected
                  ? "Connected"
                  : "Reconnecting…"
                : "Select a teammate or create a group"}
              {active?.kind !== "direct" && active?.members?.length
                ? ` · ${active.members.length} members`
                : ""}
            </small>
          </header>
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            role="log"
            aria-label="Messages"
          >
            {hasMore && (
              <button className="btn-secondary p-2" onClick={older}>
                Load earlier messages
              </button>
            )}
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex flex-col ${message.sender === user?._id ? "items-end" : "items-start"}`}
              >
                <small className="text-[#9AADAA]">
                  {active?.members?.find((m) => m._id === message.sender)
                    ?.firstName || "Developer"}
                </small>
                <p
                  className={`max-w-[85%] p-3 rounded-xl text-sm leading-6 whitespace-pre-wrap break-words ${message.sender === user?._id ? "bg-[#B7ED82] text-[#14200E] rounded-br-sm" : "bg-[#1B2B30] rounded-bl-sm"}`}
                >
                  {message.text}
                </p>
                <small className="text-[#9AADAA]">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {message.sender === user?._id &&
                  Object.entries(readers).some(
                    ([id, last]) => id !== user?._id && last >= message._id,
                  )
                    ? " · Read"
                    : ""}
                </small>
              </div>
            ))}
            <div ref={bottom} />
          </div>
          {typing && (
            <p className="px-4 text-xs text-[#9AADAA]">
              {active?.members?.find((m) => m._id === typing)?.firstName ||
                "A collaborator"}{" "}
              is typing…
            </p>
          )}
          <form
            onSubmit={send}
            className="flex gap-2 p-4 border-t border-[#26383D]"
          >
            <input
              aria-label="Message"
              disabled={!activeId}
              maxLength={2000}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (
                  Date.now() - lastTyping.current > 1500 &&
                  socket.current?.connected
                ) {
                  lastTyping.current = Date.now();
                  socket.current.emit(
                    "conversation:typing",
                    { conversationId: activeId },
                    () => {},
                  );
                }
              }}
              className="flex-1 min-w-0 p-3 bg-[#142024] rounded-xl"
              placeholder="Write a message"
            />
            <button
              disabled={!connected || sending || !text.trim()}
              className="btn-primary p-3"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
