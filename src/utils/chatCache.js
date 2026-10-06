import { useCallback, useContext, useSyncExternalStore } from 'react';
import { ChatConnection } from './chatConnection';

export function createChatCache() {
  const values = new Map();
  const listeners = new Set();
  const requests = new Map();
  const rooms = new Map();
  const roomListeners = new Map();
  return {
    rooms,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
    get: (key, initial) => {
      if (!values.has(key)) values.set(key, typeof initial === 'function' ? initial() : initial);
      return values.get(key);
    },
    set: (key, value) => {
      const next = typeof value === 'function' ? value(values.get(key)) : value;
      if (Object.is(values.get(key), next)) return;
      values.set(key, next);
      listeners.forEach(listener => listener());
    },
    subscribeRoom: (id, listener) => {
      if (!roomListeners.has(id)) roomListeners.set(id, new Set());
      const subscribers = roomListeners.get(id);
      subscribers.add(listener);
      return () => {
        subscribers.delete(listener);
        if (!subscribers.size) roomListeners.delete(id);
      };
    },
    remember: (id, room, notify = false) => {
      rooms.delete(id);
      rooms.set(id, { ...room, hasMore: room.hasMore || room.messages.length > 300, messages: room.messages.slice(-300) });
      if (rooms.size > 20) rooms.delete(rooms.keys().next().value);
      if (notify) roomListeners.get(id)?.forEach(listener => listener(rooms.get(id)));
    },
    forget: id => rooms.delete(id),
    request: (key, load) => {
      if (!requests.has(key)) {
        const request = load().finally(() => { if (requests.get(key) === request) requests.delete(key); });
        requests.set(key, request);
      }
      return requests.get(key);
    },
  };
}

export function useChatState(key, initial) {
  const { cache } = useContext(ChatConnection);
  const snapshot = useCallback(() => cache.get(key, initial), [cache, key, initial]);
  const value = useSyncExternalStore(cache.subscribe, snapshot, snapshot);
  const set = useCallback(update => cache.set(key, update), [cache, key]);
  return [value, set];
}
