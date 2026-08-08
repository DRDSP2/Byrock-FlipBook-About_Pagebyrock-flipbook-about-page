const state = { story: null, current: null, history: [] };
const $ = (id) => document.getElementById(id);

function nodeById(id) { return state.story.nodes.find((node) => node.id === id); }
function render() {
  const node = nodeById(state.current);
  $('node-tag').textContent = node.tags.join(' · ');
  $('node-title').textContent = node.title;
  $('node-summary').textContent = node.summary;
  $('visual').setAttribute('aria-label', node.media.alt);
  $('citations').replaceChildren(...node.citations.map((citation) => {
    const label = typeof citation === 'string' ? citation : citation.label;
    if (!citation.url) {
      const source = document.createElement('span');
      source.textContent = `Source: ${label}`;
      return source;
    }
    const link = document.createElement('a');
    link.href = citation.url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = `Source: ${label}`;
    return link;
  }));
  const branches = $('branches');
  branches.replaceChildren(...node.allowedBranches.filter((id) => nodeById(id)).map((id) => { const button = document.createElement('button'); button.className = 'branch'; button.textContent = nodeById(id).title; button.addEventListener('click', () => { state.history.push(state.current); state.current = id; render(); }); return button; }));
  $('back').hidden = state.history.length === 0;
}

async function start() {
  state.story = await fetch('/api/story').then((response) => response.json());
  state.current = state.story.rootNodeId;
  $('begin').closest('.hero').hidden = true;
  $('explorer').hidden = false;
  render();
}

$('begin').addEventListener('click', start);
$('back').addEventListener('click', () => { state.current = state.history.pop(); render(); });
