import story from '../data/story.json' with { type: 'json' };

if (!story || typeof story !== 'object') {
  throw new Error('Story content must be an object');
}

if (typeof story.rootNodeId !== 'string' || !story.rootNodeId) {
  throw new Error('Story content is missing rootNodeId');
}

if (!Array.isArray(story.nodes) || story.nodes.length === 0) {
  throw new Error('Story content is missing nodes');
}

if (!story.nodes.some((node) => node && node.id === story.rootNodeId)) {
  throw new Error(`Story root node ${story.rootNodeId} does not exist`);
}

console.log(`Story content OK: ${story.nodes.length} nodes`);
