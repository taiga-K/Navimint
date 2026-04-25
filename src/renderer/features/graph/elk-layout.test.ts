import { describe, expect, it } from 'vitest';

import { layoutScreenGraph } from './elk-layout';
import { buildScreenGraphModel } from './graph-model';

describe('layoutScreenGraph', () => {
  it('maps ELK output to React Flow nodes and routed edges', async () => {
    const model = buildScreenGraphModel(
      [
        { id: 'welcome', name: 'WelcomePage', route: '/' },
        { id: 'login', name: 'LoginPage', route: '/login' },
        { id: 'orphan', name: 'OrphanPage', route: '/orphan' },
      ],
      [{ from: 'welcome', to: 'login', trigger: 'Start' }],
    );

    const elements = await layoutScreenGraph(model);
    const orphan = elements.nodes.find((node) => node.id === 'orphan');
    const welcome = elements.nodes.find((node) => node.id === 'welcome');

    expect(elements.nodes).toHaveLength(3);
    expect(elements.edges).toHaveLength(1);
    expect(elements.edges[0]?.data.routePoints.length).toBeGreaterThanOrEqual(2);
    expect(orphan?.data.isOrphan).toBe(true);
    expect(orphan?.position.x).toBeGreaterThan(welcome?.position.x ?? 0);
  });
});
