import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { ChatConnection } from "../utils/chatConnection";
import { isLegacyEmptyCollection } from "../utils/workbench";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import Avatar from "./ui/Avatar";
import { useChatState } from "../utils/chatCache";
import { cachedGet } from "../utils/resourceCache";
import { IconMessages, IconPlus, IconSearch } from "./ui/Icons";
const options = { withCredentials: true, timeout: 15000 };
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
  const { client, status, error: connectionError, reconnect, cache } = useContext(ChatConnection);
  const [initialRoom] = useState(() => {
    const direct = cache.get('conversations', []).find(c => c.kind === 'direct' && c.members?.some(m => m._id === userId));
    const id = conversationId || direct?._id || null;
    return { id, direct, room: cache.rooms.get(id) };
  });
  const { id: initialId, direct: knownDirect, room: cachedRoom } = initialRoom;
  const connected = status === 'connected';
  const [conversations, setConversations] = useChatState('conversations', []);
  const [listCursor, setListCursor] = useChatState('listCursor', null);
  const [moreConversations, setMoreConversations] = useChatState('moreConversations', false);
  const [connections, setConnections] = useChatState('connections', []);
  const [messages, setMessages] = useState(() => cachedRoom?.messages || []);
  const [activeId, setActiveId] = useState(initialId);
  const [text, setText] = useState(() => cachedRoom?.draft || '');
  const [error, setError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [inboxLoading, setInboxLoading] = useState(() => !cache.get('inboxLoaded', false));
  const [peopleLoading, setPeopleLoading] = useState(() => !cache.get('peopleLoaded', false));
  const [historyLoading, setHistoryLoading] = useState(() => Boolean(userId || conversationId) && !cachedRoom?.loaded);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(() => cachedRoom?.hasMore || false);
  const [cursor, setCursor] = useState(() => cachedRoom?.cursor || null);
  const [groupOpen, setGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selected, setSelected] = useState([]);
  const [memberToAdd, setMemberToAdd] = useState("");
  const [typing, setTyping] = useState("");
  const [readers, setReaders] = useState(() => cachedRoom?.readers || {});
  const [search, setSearch] = useState('');
  const [pendingMessages, setPendingMessages] = useState(() => cachedRoom?.pendingMessages || []);
  const conversationRef = useRef(conversations);
  const typingTimer = useRef(null);
  const lastTyping = useRef(0);
  const latestMessage = useRef(cachedRoom?.after || null);
  const lastRead = useRef(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const bottom = useRef(null);
  const lastScrolled = useRef(null);
  const active = conversations.find((c) => c._id === activeId);
  useEffect(() => {
    if (activeId) cache.remember(activeId, {
      messages, draft: text, readers, hasMore,
      cursor: messages.length > 300 ? messages.at(-300)._id : cursor,
      after: latestMessage.current, pendingMessages,
      loaded: !historyLoading,
    });
  }, [activeId, messages, text, readers, hasMore, cursor, pendingMessages, cache, historyLoading]);
  useEffect(() => {
    if (!activeId) return;
    return cache.subscribeRoom(activeId, room => {
      setMessages(current => merge(current, room.messages));
      setPendingMessages(room.pendingMessages || []);
    });
  }, [activeId, cache]);
  useEffect(() => { conversationRef.current = conversations; }, [conversations]);
  useEffect(() => {
    if (!user?._id) return;
    let alive = true;
    cachedGet('/user/connections', { force: loadAttempt > 0 })
      .then((response) => {
        if (alive) {
          setConnections(response.data.data || []);
          cache.set('peopleLoaded', true);
        }
      })
      .catch((e) => {
        if (!alive) return;
        if (isLegacyEmptyCollection(e, 'connections')) setConnections([]);
        else setError(e.response?.data?.message || "Unable to load collaborators");
      })
      .finally(() => { if (alive) setPeopleLoading(false); });
    return () => {
      alive = false;
    };
  }, [user?._id, loadAttempt, cache, setConnections]);
  useEffect(() => {
    if (!user?._id) return;
    let alive = true;
    // Fetch the inbox once, independently of direct-chat creation and detail.
    cachedGet('/conversations', { force: loadAttempt > 0 })
      .then((response) => {
        if (!alive) return;
        setConversations((current) => [
          ...new Map([...response.data.data, ...current].map(c => [c._id, c])).values(),
        ]);
        setListCursor(response.data.before);
        setMoreConversations(response.data.hasMore);
        cache.set('inboxLoaded', true);
      })
      .catch((e) => {
        if (alive) setError(e.response?.data?.message || "Unable to load conversations");
      })
      .finally(() => { if (alive) setInboxLoading(false); });
    const resolve = async () => {
      try {
        const id = userId && !knownDirect
          ? (
              await axios.post(
                `${BASE_URL}/conversations/direct`,
                { userId },
                options,
              )
            ).data.data._id
          : initialId;
        if (!alive) return;
        setActiveId(id || null);
        const detail = id
          ? (await cache.request(`detail:${id}`, () => axios.get(`${BASE_URL}/conversations/${id}`, options))).data
              .data
          : null;
        if (alive && detail)
          setConversations(current => {
            const previous = current.find(c => c._id === id);
            const updated = { unreadCount: 0, ...previous, ...detail };
            return previous ? current.map(c => c._id === id ? updated : c) : [updated, ...current];
          });
      } catch (e) {
        if (alive) {
          if ([401, 403, 404].includes(e.response?.status)) {
            cache.forget(initialId);
            setActiveId(null);
            latestMessage.current = null;
            setMessages([]);
            setText('');
            setPendingMessages([]);
            setConversations(current => current.filter(c => c._id !== initialId));
          }
          setError(e.response?.data?.message || "Unable to open conversation");
        }
      }
    };
    resolve();
    return () => {
      alive = false;
    };
  }, [userId, initialId, knownDirect, user?._id, loadAttempt, cache, setConversations, setListCursor, setMoreConversations]);
  useEffect(() => {
    if (!user?._id || !client || (userId && !activeId)) return;
    let alive = true;
    const pendingRooms = new Map();
    const seenMessages = new Set();
    const refreshRoom = (id) => {
      if (pendingRooms.has(id)) return;
      const request = cache.request(`detail:${id}`, () => axios.get(`${BASE_URL}/conversations/${id}`, options))
        .then(response => {
          if (!alive) return;
          const detail = response.data.data;
          setConversations(current => {
            const previous = current.find(c => c._id === id);
            const updated = { unreadCount: 0, ...previous, ...detail };
            return previous ? current.map(c => c._id === id ? updated : c) : [updated, ...current];
          });
        })
        .catch(e => {
          if (!alive) return;
          if ([403, 404].includes(e.response?.status))
            setConversations(current => current.filter(c => c._id !== id));
          else setError(e.response?.data?.message || 'Unable to update conversation');
        })
        .finally(() => pendingRooms.delete(id));
      pendingRooms.set(id, request);
    };
    let synchronization = null;
    let resync = false;
    const synchronize = async () => {
      if (!activeId) return;
      try {
        let after = latestMessage.current;
        let more;
        do {
          const result = await cache.request(`history:${activeId}:${after || 'latest'}`, () => axios.get(
            `${BASE_URL}/conversations/${activeId}/messages`,
            { ...options, params: after ? { after, limit: 100 } : {} },
          ));
          if (!alive) return;
          setMessages((current) => merge(current, result.data.data));
          setHistoryLoading(false);
          if (!after) {
            setHasMore(result.data.hasMore);
            setCursor(result.data.before);
          }
          more = Boolean(after && result.data.hasMore);
          after = result.data.after || after;
          if (after && (!latestMessage.current || latestMessage.current < after))
            latestMessage.current = after;
        } while (more && alive);
        const receipts = await axios.get(
          `${BASE_URL}/conversations/${activeId}/receipts`,
          options,
        );
        if (alive)
          setReaders(current => {
            const next = { ...current };
            for (const receipt of receipts.data.data)
              if (!next[receipt.user] || next[receipt.user] < receipt.message)
                next[receipt.user] = receipt.message;
            return next;
          });
      } catch (e) {
        if (alive) {
          if ([401, 403, 404].includes(e.response?.status)) {
            cache.forget(activeId);
            setActiveId(null);
            latestMessage.current = null;
            setMessages([]);
            setText('');
            setPendingMessages([]);
            setHasMore(false);
            setConversations(current => current.filter(c => c._id !== activeId));
          }
          setHistoryLoading(false);
          setError(
            e.response?.data?.message || "Unable to synchronize messages",
          );
        }
      }
    };
    // Serialize replay. A socket connect during the first HTTP read queues a
    // forward-cursor catch-up instead of downloading the same history twice.
    const load = () => {
      if (synchronization) {
        resync = true;
        return;
      }
      synchronization = synchronize().finally(() => {
        synchronization = null;
        if (resync && alive) {
          resync = false;
          load();
        }
      });
    };
    const onConnect = () => {
      load();
      // Recover groups/membership events missed while this socket was offline.
      cachedGet('/conversations', { force: true }).then(response => {
        if (alive) {
          setConversations(current => [...response.data.data, ...current.filter(c => c._id === activeId && !response.data.data.some(r => r._id === c._id))]);
          setListCursor(response.data.before);
          setMoreConversations(response.data.hasMore);
        }
      }).catch(() => {});
    };
    const onMessage = (message) => {
      if (seenMessages.has(message._id)) return;
      seenMessages.add(message._id);
      if (seenMessages.size > 1000) seenMessages.delete(seenMessages.values().next().value);
      if (!conversationRef.current.some(c => c._id === message.conversation)) refreshRoom(message.conversation);
      if (message.conversation === activeId) {
        setMessages((current) => merge(current, [message]));
        setPendingMessages(current => current.filter(item => item.clientId !== message.clientId || message.sender !== user._id));
        setConversations(current => current.map(c => c._id === activeId ? { ...c, unreadCount: 0 } : c));
        // Keep the replay cursor at the last HTTP sync. A newer live event must
        // not skip messages sent between that snapshot and the socket connect.
      }
    };
    const onTyping = (event) => {
      if (event.conversationId !== activeId) return;
      setTyping(event.userId);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(""), 2500);
    };
    const onRead = (event) => {
      if (event.conversationId === activeId)
        setReaders((current) => ({
          ...current,
          [event.userId]:
            !current[event.userId] || current[event.userId] < event.messageId
              ? event.messageId
              : current[event.userId],
        }));
    };
    const onRemoved = event => {
      setConversations(current => current.filter(c => c._id !== event.conversationId));
      if (activeId === event.conversationId) navigate('/messages');
    };
    client.on('connect', onConnect);
    client.on('message:new', onMessage);
    client.on('conversation:typing', onTyping);
    client.on('conversation:read', onRead);
    client.on('conversation:removed', onRemoved);
    load();
    return () => {
      alive = false;
      clearTimeout(typingTimer.current);
      client.off('connect', onConnect);
      client.off('message:new', onMessage);
      client.off('conversation:typing', onTyping);
      client.off('conversation:read', onRead);
      client.off('conversation:removed', onRemoved);
    };
  }, [activeId, user?._id, userId, client, navigate, loadAttempt, cache, setConversations, setListCursor, setMoreConversations]);
  useEffect(() => {
    const last = messages.at(-1);
    const lastVisible = pendingMessages.at(-1)?.clientId || last?._id;
    const stream = bottom.current?.parentElement;
    if (lastVisible && lastVisible !== lastScrolled.current) {
      stream?.scrollTo({ top: stream.scrollHeight, behavior: "smooth" });
      lastScrolled.current = lastVisible;
    }
    if (connected && last && document.visibilityState === "visible" && lastRead.current !== last._id) {
      lastRead.current = last._id;
      setConversations(current => current.map(c => c._id === activeId && c.unreadCount ? { ...c, unreadCount: 0 } : c));
      client?.emit(
        "conversation:read",
        { conversationId: activeId, messageId: last._id },
        result => { if (!result?.ok) lastRead.current = null; },
      );
    }
  }, [messages, pendingMessages, activeId, connected, client, setConversations]);
  useEffect(() => {
    const mark = () => {
      const last = messages.at(-1);
      if (
        document.visibilityState === "visible" &&
        last &&
        client?.connected && lastRead.current !== last._id
      )
        { lastRead.current = last._id; client.emit(
          "conversation:read",
          { conversationId: activeId, messageId: last._id },
          result => { if (!result?.ok) lastRead.current = null; },
        ); }
    };
    document.addEventListener("visibilitychange", mark);
    return () => document.removeEventListener("visibilitychange", mark);
  }, [messages, activeId, client]);
  const send = (event, pending = null) => {
    event.preventDefault();
    if (!activeId || !active || (!pending && !text.trim()) || sending || !client?.connected) return;
    const payload =
      pending ? { conversationId: activeId, text: pending.text, clientId: pending.clientId } : {
            conversationId: activeId,
            text: text.trim(),
            clientId: crypto.randomUUID(),
          };
    setPendingMessages(current => [...current.filter(item => item.clientId !== payload.clientId), { ...payload, state: 'sending', createdAt: new Date().toISOString() }]);
    if (!pending) setText('');
    setSending(true);
    setError("");
    client
      .timeout(10000)
      .emit("message:send", payload, (timeout, result) => {
        const saved = cache.rooms.get(activeId);
        if (!mounted.current) {
          if (saved) cache.remember(activeId, { ...saved,
            messages: result?.ok ? merge(saved.messages, [result.data]) : saved.messages,
            pendingMessages: result?.ok ? saved.pendingMessages.filter(item => item.clientId !== payload.clientId)
              : saved.pendingMessages.map(item => item.clientId === payload.clientId ? { ...item, state: 'failed' } : item),
          }, true);
          return;
        }
        setSending(false);
        if (timeout || !result?.ok) {
          setPendingMessages(current => current.map(item => item.clientId === payload.clientId ? { ...item, state: 'failed' } : item));
          setError(
            result?.message ||
              "Delivery not confirmed. Send again to retry safely.",
          );
          return;
        }
        setMessages((current) => merge(current, [result.data]));
        setPendingMessages(current => current.filter(item => item.clientId !== payload.clientId));
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
    if (creating) return;
    setCreating(true);
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
    } finally {
      setCreating(false);
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
    <div className="page-wrap chat-page text-[#EEF4FF]">
      <header className="flex justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="text-sm text-[#A5B4CE] mt-2">
            Personal conversations and collaboration groups
          </p>
        </div>
        <button
          className="btn-primary px-4 py-2.5 flex items-center gap-2 shrink-0 text-sm"
          onClick={() => setGroupOpen((v) => !v)}
        >
          <IconPlus className="h-4 w-4" /> New group
        </button>
      </header>
      {connectionError && (
        <div role="alert" className="p-3 mb-3 bg-red-950 text-red-200 rounded-xl">
          <p>{connectionError}</p>
          {status === 'load_failed'
            ? <button className="btn-secondary p-2 mt-2" onClick={() => window.location.reload()}>Reload page</button>
            : <button className="btn-secondary p-2 mt-2" onClick={reconnect}>Reconnect</button>}
          {status === 'unauthorized' && <Link to="/login" className="underline ml-3">Sign in again</Link>}
        </div>
      )}
      {error && (
        <div role="alert" className="p-3 mb-3 bg-red-950 text-red-200 rounded-xl">
          {error}
          <button className="btn-secondary p-2 ml-3" onClick={() => {
            setError(''); setInboxLoading(true); setPeopleLoading(true);
            setHistoryLoading(Boolean(activeId)); setLoadAttempt(value => value + 1);
          }}>Retry loading chat</button>
        </div>
      )}
      {groupOpen && (
        <form
          onSubmit={create}
          className="p-4 mb-4 border border-[#293B5B] rounded-xl space-y-3"
        >
          <label className="block">
            Group name
            <input
              required
              maxLength={80}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="block bg-[#16233D] p-2 rounded w-full"
            />
          </label>
          <fieldset>
            <legend>Choose connected collaborators</legend>
            <div className="flex flex-wrap gap-3">
              {peopleLoading && <p role="status">Loading collaborators…</p>}
              {!peopleLoading && !connections.length && <p>Accept a connection before inviting teammates. <Link className="underline" to="/feed">Find collaborators</Link></p>}
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
          <button disabled={!selected.length || creating} className="btn-primary p-2">
            {creating ? 'Creating group…' : 'Create group'}
          </button>
        </form>
      )}
      {active?.kind === "group" && (
        <details className="p-3 mb-3 border border-[#293B5B] rounded-xl">
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
                className="bg-[#16233D] p-2"
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
      <div className="chat-layout grid md:grid-cols-[300px_1fr] rounded-2xl overflow-hidden">
        <aside
          className={`${activeId ? "hidden md:block" : ""} chat-inbox p-4 border-r border-[#293B5B] overflow-y-auto`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Conversations</h2>
            <span className="text-xs font-mono text-[#7B91B5]">{conversations.length}</span>
          </div>
          <label className="chat-search mb-4">
            <IconSearch className="h-4 w-4 shrink-0" />
            <input aria-label="Search conversations" placeholder="Search conversations" value={search} onChange={event => setSearch(event.target.value)} />
          </label>
          {inboxLoading && <p role="status" className="text-sm text-[#A5B4CE] p-2">Loading conversations…</p>}
          {!inboxLoading && !conversations.length && <p className="text-sm text-[#A5B4CE] p-2">No conversations yet. Choose a connected teammate below or create a group.</p>}
          {conversations.filter(c => title(c, user?._id).toLowerCase().includes(search.trim().toLowerCase())).map((c) => (
            <Link
              key={c._id}
              to={`/messages/${c._id}`}
              aria-label={`${title(c, user?._id)} ${c.kind}`}
              aria-current={activeId === c._id ? 'page' : undefined}
              className={`chat-conversation flex gap-3 p-3 rounded-xl mb-1 text-sm border ${activeId === c._id ? "active" : "border-transparent"}`}
            >
              {c.kind === 'direct'
                ? <Avatar user={c.members?.find(member => member._id !== user?._id)} className="h-10 w-10 shrink-0" />
                : <span className="chat-group-icon"><IconMessages className="h-5 w-5" /></span>}
              <span className="min-w-0 flex-1">
                <span className="block font-medium truncate">{title(c, user?._id)}</span>
                <small className="block truncate text-[#7B91B5] mt-1">{c.lastMessage?.text || (c.kind === 'direct' ? 'Personal conversation' : `${c.members?.length || 0} members`)}</small>
              </span>
              {c.unreadCount > 0 && (
                <span className="chat-unread" aria-label={`${c.unreadCount} unread`}>
                  {c.unreadCount}
                </span>
              )}
            </Link>
          ))}
          {search.trim() && !conversations.some(c => title(c, user?._id).toLowerCase().includes(search.trim().toLowerCase())) && <p className="p-3 text-sm text-[#A5B4CE]">No matching conversations.</p>}
          <h2 className="font-bold mt-5 mb-2">Start a personal chat</h2>
          {peopleLoading && <p role="status" className="text-sm text-[#A5B4CE] p-2">Loading teammates…</p>}
          {!peopleLoading && !connections.length && <Link to="/feed" className="block p-2 text-sm text-[#82B4FF] underline">Find collaborators to start chatting →</Link>}
          {connections.map((peer) => (
            <Link
              key={peer._id}
              className="flex gap-3 items-center p-2 text-sm rounded-lg hover:bg-[#16233D]"
              to={`/chat/${peer._id}`}
            >
              <Avatar user={peer} className="h-8 w-8 shrink-0" />
              {peer.firstName} {peer.lastName}
            </Link>
          ))}
        </aside>
        <section
          className={`${activeId ? "flex" : "hidden md:flex"} chat-thread flex-col min-w-0`}
        >
          <header className="chat-thread-header p-5 border-b border-[#293B5B]">
            <Link
              to="/messages"
              className="md:hidden block text-xs text-[#82B4FF] mb-3"
            >
              ← All conversations
            </Link>
            <h2 className="font-bold">
              {active ? title(active, user?._id) : "Choose a conversation"}
            </h2>
            <small className="text-[#A5B4CE] inline-flex items-center gap-2 mt-1">
              {activeId && <span aria-hidden="true" className={`chat-status-dot ${connected ? 'online' : ''}`} />}
              {activeId
                ? connected
                  ? "Connected"
                  : status === 'connecting' ? "Connecting…" : "Offline · use Reconnect above"
                : "Select a teammate or create a group"}
              {active?.kind !== "direct" && active?.members?.length
                ? ` · ${active.members.length} members`
                : ""}
            </small>
          </header>
          <div
            className={`chat-stream flex-1 overflow-y-auto p-5 space-y-4 ${!activeId ? 'grid place-content-center text-center' : ''}`}
            role="log"
            aria-label="Messages"
          >
            {!activeId && <div className="chat-empty max-w-sm">
              <span className="chat-empty-icon mx-auto"><IconMessages className="h-8 w-8" /></span>
              <h3 className="font-semibold text-lg mt-5 mb-2">Good projects start with a conversation</h3>
              <p className="text-sm leading-6 text-[#A5B4CE]">Choose a conversation or a teammate from the list to start chatting.</p>
            </div>}
            {activeId && historyLoading && <p role="status" className="text-sm text-[#A5B4CE]">Loading messages…</p>}
            {activeId && !historyLoading && !messages.length && !error && <p className="text-sm text-[#A5B4CE]">No messages yet. Say hello to your teammates.</p>}
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
                <small className="text-[#A5B4CE]">
                  {active?.members?.find((m) => m._id === message.sender)
                    ?.firstName || "Developer"}
                </small>
                <p
                  className={`max-w-[85%] p-3 rounded-xl text-sm leading-6 whitespace-pre-wrap break-words ${message.sender === user?._id ? "bg-[#82B4FF] text-[#0C1D38] rounded-br-sm" : "bg-[#1D3050] rounded-bl-sm"}`}
                >
                  {message.text}
                </p>
                <small className="text-[#A5B4CE]">
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
            {pendingMessages.filter(item => !messages.some(message => message.clientId === item.clientId && message.sender === user?._id)).map(item => (
              <div key={item.clientId} className="flex flex-col items-end" aria-label="Pending message">
                <p className="chat-pending max-w-[85%] p-3 rounded-xl text-sm leading-6 whitespace-pre-wrap break-words">{item.text}</p>
                <span className="text-xs text-[#A5B4CE] mt-1">
                  {item.state === 'failed' ? 'Delivery not confirmed' : 'Sending…'}
                  {item.state === 'failed' && <button className="text-[#82B4FF] underline ml-2" disabled={!connected || sending} onClick={event => send(event, item)}>Retry message</button>}
                </span>
              </div>
            ))}
            <div ref={bottom} />
          </div>
          {typing && (
            <p className="px-4 text-xs text-[#A5B4CE]">
              {active?.members?.find((m) => m._id === typing)?.firstName ||
                "A collaborator"}{" "}
              is typing…
            </p>
          )}
          {activeId && <form
            onSubmit={send}
            className="chat-composer flex gap-3 p-4 border-t border-[#293B5B]"
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
                  client?.connected
                ) {
                  lastTyping.current = Date.now();
                  client.emit(
                    "conversation:typing",
                    { conversationId: activeId },
                    () => {},
                  );
                }
              }}
              className="flex-1 min-w-0 px-4 py-3 bg-[#16233D] border border-[#344D70] focus:border-[#82B4FF] rounded-xl"
              placeholder="Write a message"
            />
            <button
              disabled={!active || !connected || sending || !text.trim()}
              className="btn-primary p-3"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </form>}
        </section>
      </div>
    </div>
  );
}
