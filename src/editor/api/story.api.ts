export const loadStoryList = async () => {
  const res = await fetch('/data/story/index.json');
  const data = await res.json();

  // Support both old/new schema keys from story index.
  const scenes = Array.isArray(data?.stories)
    ? data.stories
    : Array.isArray(data?.scenes)
      ? data.scenes
      : [];

  return {
    ...data,
    scenes,
  };
};

export const loadStory = async (name: string) => {
  const normalized = name.endsWith('.json') ? name : `${name}.json`;
  const res = await fetch(`/data/story/scenes/${normalized}`);
  return res.json();
};

export const downloadStory = (name: string, data: any) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
};
