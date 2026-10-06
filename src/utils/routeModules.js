export const routeModules = {
  profile: () => import('../components/Profile'),
  feed: () => import('../components/Feed'),
  requests: () => import('../components/Requests'),
  connections: () => import('../components/Connections'),
  messages: () => import('../components/Chat'),
  projects: () => import('../components/Projects'),
  collaborate: () => import('../components/Collaboration'),
  workspace: () => import('../components/Workspace'),
  overview: () => import('../components/Dashboard'),
};
export function prefetchRoute(path) {
  const name = path === '/' ? 'overview' : path.split('/')[1];
  // Download code on navigation intent; never prefetch private API data.
  routeModules[name === 'chat' ? 'messages' : name]?.().catch(() => {});
}
