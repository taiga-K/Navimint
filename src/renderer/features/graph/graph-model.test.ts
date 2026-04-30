import type { ScreenDefinition, ScreenTransition } from '@shared/types';
import { describe, expect, it } from 'vitest';

import { buildScreenGraphModel } from './graph-model';

const screens: ScreenDefinition[] = [
  { id: 'welcome', name: 'WelcomePage', route: '/' },
  { id: 'login', name: 'LoginPage', route: '/login' },
  { id: 'dashboard', name: 'DashboardPage', route: '/dashboard' },
  { id: 'legacy', name: 'LegacyExportPage', route: '/internal/legacy-export' },
];

describe('buildScreenGraphModel', () => {
  it('groups transitions by directed screen pair without losing individual transitions', () => {
    const transitions: ScreenTransition[] = [
      { from: 'welcome', to: 'login', trigger: 'Start' },
      { from: 'welcome', to: 'login', trigger: 'Retry', condition: 'after error' },
      { from: 'login', to: 'dashboard', trigger: 'Submit' },
    ];

    const model = buildScreenGraphModel(screens, transitions);
    const welcomeToLogin = model.edgeGroups.find(
      (group) => group.from === 'welcome' && group.to === 'login',
    );

    expect(model.edgeGroups).toHaveLength(2);
    expect(welcomeToLogin?.transitions).toHaveLength(2);
    expect(welcomeToLogin?.transitions.map((transition) => transition.trigger)).toEqual([
      'Start',
      'Retry',
    ]);
  });

  it('marks screens with no valid inbound or outbound transitions as orphan', () => {
    const model = buildScreenGraphModel(screens, [
      { from: 'welcome', to: 'login' },
      { from: 'missing', to: 'legacy' },
    ]);

    const orphanIds = model.nodes
      .filter((node) => node.isOrphan)
      .map((node) => node.id);

    expect(orphanIds).toEqual(['dashboard', 'legacy']);
  });

  it('uses stable edge ids for the same directed screen pair', () => {
    const first = buildScreenGraphModel(screens, [
      { from: 'welcome', to: 'login', trigger: 'Start' },
    ]);
    const second = buildScreenGraphModel(screens, [
      { from: 'welcome', to: 'login', trigger: 'Different trigger' },
    ]);

    expect(first.edgeGroups[0]?.id).toBe(second.edgeGroups[0]?.id);
  });
});
