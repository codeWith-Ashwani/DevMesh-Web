export function initialLayout(nodes, dimensions) {
    if (!nodes.length) return [];

    const { width, height } = dimensions;
    const cx = width / 2;
    const cy = height / 2;

    // Initialize positions in concentric clusters based on type (deterministic offsets)
    const initial = nodes.map((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      const pseudoOffset = Math.sin(i * 12.9898 + 78.233) * 25;
      let radius = 180;
      if (node.type === "developer") radius = node.isCurrentUser ? 30 : 220;
      else if (node.type === "skill") radius = 120;
      else if (node.type === "project") radius = 280;

      return {
        ...node,
        x: cx + Math.cos(angle) * (radius + pseudoOffset),
        y: cy + Math.sin(angle) * (radius + pseudoOffset),
        vx: 0,
        vy: 0,
      };
    });

    return initial;
}
export function calculateLayout(nodes, links, dimensions) {
    if (!nodes.length) return [];

    const { width, height } = dimensions;
    const cx = width / 2;
    const cy = height / 2;

    // Initialize positions in concentric clusters based on type (deterministic offsets)
    const initial = nodes.map((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      const pseudoOffset = Math.sin(i * 12.9898 + 78.233) * 25;
      let radius = 180;
      if (node.type === "developer") radius = node.isCurrentUser ? 30 : 220;
      else if (node.type === "skill") radius = 120;
      else if (node.type === "project") radius = 280;

      return {
        ...node,
        x: cx + Math.cos(angle) * (radius + pseudoOffset),
        y: cy + Math.sin(angle) * (radius + pseudoOffset),
        vx: 0,
        vy: 0,
      };
    });

    // Run force simulation iterations
    const nodeMap = new Map(initial.map((n) => [n.id, n]));
    const linkPairs = links
      .map((l) => ({
        source: nodeMap.get(l.source),
        target: nodeMap.get(l.target),
        type: l.type,
      }))
      .filter((l) => l.source && l.target);

    const iterations = 80;
    const kRepel = 2400;
    const kAttract = 0.04;
    const damping = 0.85;

    for (let iter = 0; iter < iterations; iter++) {
      // Repulsion between all node pairs
      for (let i = 0; i < initial.length; i++) {
        for (let j = i + 1; j < initial.length; j++) {
          const n1 = initial[i];
          const n2 = initial[j];
          const nudge = (i % 2 === 0 ? 1 : -1) * 0.01;
          const dx = n2.x - n1.x || nudge;
          const dy = n2.y - n1.y || nudge;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);
          if (dist < 320) {
            const force = kRepel / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            n1.vx -= fx;
            n1.vy -= fy;
            n2.vx += fx;
            n2.vy += fy;
          }
        }
      }

      // Attraction along links
      for (const link of linkPairs) {
        const { source, target } = link;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const idealDist =
          link.type === "dev-skill"
            ? 110
            : link.type === "proj-skill"
              ? 130
              : 160;
        const displacement = dist - idealDist;
        const force = displacement * kAttract;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        source.vx += fx;
        source.vy += fy;
        target.vx -= fx;
        target.vy -= fy;
      }

      // Centering force & update positions
      for (const node of initial) {
        node.vx += (cx - node.x) * 0.015;
        node.vy += (cy - node.y) * 0.015;

        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;
      }
    }

    return initial;
}
