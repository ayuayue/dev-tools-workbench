import assert from 'node:assert/strict';
import {TOOLS} from '../src/data/toolRegistry';

const counts = new Map<string, number>();

for (const tool of TOOLS) {
  const iconName = tool.icon.displayName || tool.icon.name || 'unknown';
  counts.set(iconName, (counts.get(iconName) || 0) + 1);
}

assert.ok(counts.size >= 18, `expected at least 18 distinct icons, got ${counts.size}`);

const overused = [...counts.entries()].filter(([, count]) => count > 8);
assert.deepEqual(
  overused,
  [],
  `expected no icon to be used more than 8 times, got ${JSON.stringify(overused)}`,
);

console.log('icon diversity smoke test passed');
