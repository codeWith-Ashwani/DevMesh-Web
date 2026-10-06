import { useEffect, useState } from 'react';
import { BASE_URL } from '../utils/constants';
import { ChatConnection } from '../utils/chatConnection';
import { createChatCache } from '../utils/chatCache';
import { clearResources, invalidateResource } from '../utils/resourceCache';
import { useSelector } from 'react-redux';
import axios from 'axios';

export default function ChatConnectionProvider({ children }) {
  const [cache] = useState(createChatCache);
  const userId = useSelector(store => store.user?._id);
  const [client, setClient] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState('connecting');
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    let socket;
    let wasConnected = false;
    const seen = new Set();
    const refreshRoom = id => cache.request(`detail:${id}`, () => axios.get(`${BASE_URL}/conversations/${id}`, { withCredentials: true, timeout: 15000 }))
      .then(response => cache.set('conversations', current => {
        const previous = (current || []).find(room => room._id === id);
        const detail = { unreadCount: 0, ...previous, ...response.data.data };
        return previous ? current.map(room => room._id === id ? detail : room) : [detail, ...(current || [])];
      })).catch(failure => {
        if ([401, 403, 404].includes(failure.response?.status)) removed({ conversationId: id });
      });
    const connected = () => {
      if (wasConnected) clearResources();
      wasConnected = true;
      setStatus('connected'); setError('');
    };
    const disconnected = () => {
      setStatus('disconnected');
      setError('Live chat is disconnected. Reconnect to continue.');
    };
    const failed = failure => {
      const code = failure.data?.status;
      setStatus(code === 401 || failure.message === 'Authentication required' ? 'unauthorized' : 'disconnected');
      setError(code === 429 ? 'Too many connection attempts. Wait a minute, then reconnect.'
        : code === 503 ? 'Live chat is temporarily unavailable. Try reconnecting shortly.'
        : code === 401 || failure.message === 'Authentication required' ? 'Your chat session could not be verified. Sign in again.'
        : 'Could not connect to live chat. Reconnect, or sign in again if it keeps failing.');
    };
    const offline = () => {
      socket?.disconnect();
      setStatus('disconnected');
      setError('You are offline. Your draft stays on this page while you reconnect.');
    };
    const online = () => {
      setError(''); setStatus('connecting'); socket?.connect();
    };
    const message = event => {
      if (seen.has(event._id)) return;
      seen.add(event._id);
      if (seen.size > 1000) seen.delete(seen.values().next().value);
      const room = cache.rooms.get(event.conversation);
      if (room && !room.messages.some(item => item._id === event._id))
        cache.remember(event.conversation, { ...room,
          pendingMessages: (room.pendingMessages || []).filter(item => item.clientId !== event.clientId || event.sender !== userId),
          messages: [...room.messages, event].sort((a, b) => a._id.localeCompare(b._id)),
        }, true);
      const inbox = cache.get('conversations', []);
      if (!inbox.some(item => item._id === event.conversation)) refreshRoom(event.conversation);
      cache.set('conversations', current => (current || []).map(item => item._id === event.conversation ? {
        ...item, lastMessage: event,
        unreadCount: (item.unreadCount || 0) + (event.sender === userId ? 0 : 1),
      } : item));
      invalidateResource('/conversations');
    };
    const removed = event => {
      cache.forget(event.conversationId);
      cache.set('conversations', current => (current || []).filter(room => room._id !== event.conversationId));
      invalidateResource('/conversations');
    };
    const updated = event => { invalidateResource('/conversations'); refreshRoom(event.conversationId); };
    window.addEventListener('offline', offline);
    window.addEventListener('online', online);
    // Keep the socket library out of the initial public/sign-in page download.
    import('socket.io-client').then(({ io }) => {
      if (!alive) return;
      socket = io(BASE_URL, { autoConnect: false, withCredentials: true, transports: ['websocket'], reconnection: true });
      setClient(socket);
      socket.on('connect', connected);
      socket.on('disconnect', disconnected);
      socket.on('connect_error', failed);
      socket.on('message:new', message);
      socket.on('conversation:removed', removed);
      socket.on('conversation:updated', updated);
      if (navigator.onLine) socket.connect();
      else offline();
    }).catch(() => {
      if (alive) {
        setStatus('load_failed');
        setError('The live chat client could not load. Reload the page to try again.');
      }
    });
    return () => {
      alive = false;
      window.removeEventListener('offline', offline);
      window.removeEventListener('online', online);
      socket?.off('connect', connected);
      socket?.off('disconnect', disconnected);
      socket?.off('connect_error', failed);
      socket?.off('message:new', message);
      socket?.off('conversation:removed', removed);
      socket?.off('conversation:updated', updated);
      socket?.disconnect();
    };
  }, [attempt, cache, userId]);
  const reconnect = () => {
    client?.disconnect();
    if (!navigator.onLine) {
      setStatus('disconnected');
      setError('You are offline. Your draft stays on this page while you reconnect.');
      return;
    }
    setError('');
    setStatus('connecting');
    if (client) client.connect();
    else setAttempt(value => value + 1);
  };
  return <ChatConnection.Provider value={{ client, status, error, reconnect, cache }}>{children}</ChatConnection.Provider>;
}
