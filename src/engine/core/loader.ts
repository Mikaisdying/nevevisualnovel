export async function loadStoryFiles() {
  const indexRes = await fetch('/story/index.json');
  const index = await indexRes.json();

  const allScenes = [];

  for (const file of index.scenes) {
    const res = await fetch(`/story/scenes/${file}.json`);
    const data = await res.json();
    allScenes.push(...data);
  }

  return allScenes;
}
