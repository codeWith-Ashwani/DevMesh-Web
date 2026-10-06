import { cachedGet, invalidateResource, peekResource } from './resourceCache';

const sections = [
  { key: "projects", label: "Project spaces", path: "/projects?limit=50" },
  { key: "conversations", label: "Conversations", path: "/conversations" },
  { key: "profile", label: "Availability", path: "/collaboration/profile" },
  { key: "connections", label: "Connections", path: "/user/connections" },
];
export function isLegacyEmptyCollection(error, collection) {
  const expected =
    collection === "connections"
      ? "No connections found"
      : "No pending connection requests found";
  return (
    error.response?.status === 404 && error.response?.data?.message === expected
  );
}
function describeFailure(error, section) {
  const status = error.response?.status;
  let message = "The server could not load this section. Please try again.";
  if (!error.response)
    message =
      "Could not reach the server. Check your connection and try again.";
  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT")
    message =
      "The server is taking too long to respond. It may still be starting up. Try again shortly.";
  if (status === 401)
    message = "Your session expired. Sign in again to load this section.";
  if (status === 403) message = "Your account cannot access this section.";
  if (status === 404)
    message =
      "This feature is missing from the connected backend. Update the backend to the latest DevMesh version.";
  if (status === 429)
    message = "Too many requests. Wait a moment before trying again.";
  if (status === 503)
    message =
      "This service is temporarily unavailable. Please try again shortly.";
  if (error.code === "INVALID_RESPONSE")
    message =
      "The server returned an unexpected response. Check that the frontend is connected to the DevMesh API.";
  return { ...section, status, message };
}
function validValue(section, value) {
  return section.key === 'profile'
    ? value === null || (typeof value === 'object' && value && !Array.isArray(value))
    : Array.isArray(value);
}
export function readWorkbench() {
  const cached = Object.fromEntries(sections.map(section => {
    const value = peekResource(section.path)?.data;
    return [section.key, validValue(section, value) ? value : null];
  }));
  return {
    errors: {},
    pending: Object.fromEntries(sections.map(section => [section.key, !peekResource(section.path) || !validValue(section, peekResource(section.path)?.data)])),
    ...cached,
  };
}
export async function loadWorkbench(signal, onUpdate, force = false) {
  const data = readWorkbench();
  await Promise.all(
    sections.map(async (section) => {
      try {
        const response = await cachedGet(section.path, { signal, force });
        const value = response.data?.data;
        if (!validValue(section, value)) {
          invalidateResource(section.path);
          const error = new Error("Unexpected API response");
          error.code = "INVALID_RESPONSE";
          throw error;
        }
        data[section.key] = value;
      } catch (error) {
        // Compatibility with servers released before empty lists returned HTTP 200.
        if (
          section.key === "connections" &&
          isLegacyEmptyCollection(error, "connections")
        ) {
          data[section.key] = [];
        } else if (!signal?.aborted) {
          data.errors[section.key] = describeFailure(error, section);
        }
      } finally {
        data.pending[section.key] = false;
        if (!signal?.aborted) {
          // Publish each result immediately; a slow inbox must not block projects.
          onUpdate?.({
            ...data,
            pending: { ...data.pending },
            errors: Object.fromEntries(sections.filter(s => data.errors[s.key]).map(s => [s.key, data.errors[s.key]])),
          });
        }
      }
    }),
  );
  return data;
}
