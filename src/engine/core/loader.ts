export async function loadStoryFiles() {
  const res = await fetch('data/storyline.json');
  const data = await res.json();
  return data;
}
