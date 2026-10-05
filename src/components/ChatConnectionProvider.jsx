import { useEffect, useState } from 'react';
import { BASE_URL } from '../utils/constants';
import { ChatConnection } from '../utils/chatConnection';

export default function ChatConnectionProvider({ children }) {
  const [client, setClient] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState('connecting');
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    let socket;
    const connected = () => { setStatus('connected'); setError(''); };
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
      socket?.disconnect();
    };
  }, [attempt]);
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
  return <ChatConnection.Provider value={{ client, status, error, reconnect }}>{children}</ChatConnection.Provider>;
}
