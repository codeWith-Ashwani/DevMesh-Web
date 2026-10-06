import axios from 'axios';
import { BASE_URL } from './constants';

const entries = new Map();
const pending = new Map();
let scope = null;
let generation = 0;
const MAX_ENTRIES = 100;

export function clearResources() {
  generation++;
  entries.clear();
  pending.clear();
}
export function invalidateResource(prefix) {
  generation++;
  for (const key of entries.keys()) if (key.startsWith(prefix)) entries.delete(key);
  for (const key of pending.keys()) if (key.startsWith(prefix)) pending.delete(key);
}
export function setResourceScope(userId) {
  if (scope === userId) return;
  scope = userId;
  clearResources();
}
export function peekResource(path) {
  return scope ? entries.get(path)?.response.data : undefined;
}

// Shared reads continue across route unmounts. Each caller can cancel its own wait.
export async function cachedGet(path, { signal, force = false, maxAge = 30000, ...options } = {}) {
  const cached = entries.get(path);
  if (signal?.aborted) throw new axios.CanceledError();
  if (scope && cached && !force && Date.now() - cached.time < maxAge) return cached.response;
  let request = pending.get(path);
  if (!request) {
    const started = generation;
    request = axios.get(BASE_URL + path, { withCredentials: true, timeout: 15000, ...options })
      .then(response => {
        if (scope && started === generation) {
          entries.delete(path);
          entries.set(path, { response, time: Date.now() });
          if (entries.size > MAX_ENTRIES) entries.delete(entries.keys().next().value);
        }
        return response;
      })
      .catch(error => {
        if ([401, 403].includes(error.response?.status)) clearResources();
        throw error;
      })
      .finally(() => { if (pending.get(path) === request) pending.delete(path); });
    pending.set(path, request);
  }
  if (!signal) return request;
  return new Promise((resolve, reject) => {
    const cancel = () => reject(new axios.CanceledError());
    signal.addEventListener('abort', cancel, { once: true });
    request.then(value => {
      if (!signal.aborted) resolve(value);
    }, reject).finally(() => signal.removeEventListener('abort', cancel));
  });
}

export function installResourceInvalidation() {
  return axios.interceptors.response.use(response => {
    const method = response.config.method?.toLowerCase();
    if (method && method !== 'get' && method !== 'head') clearResources();
    return response;
  }, error => {
    if ([401, 403].includes(error.response?.status)) clearResources();
    return Promise.reject(error);
  });
}
