import { calculateLayout } from './networkLayout';
self.onmessage = ({ data }) => {
  const positions = calculateLayout(data.nodes, data.links, data.dimensions).map(({ id, x, y }) => ({ id, x, y }));
  self.postMessage(positions);
};
