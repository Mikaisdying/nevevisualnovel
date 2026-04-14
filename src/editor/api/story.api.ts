export const loadStoryline = async () => {
  const res = await fetch('/api/storyline');
  return res.json();
};

export const saveStoryline = async (data: any) => {
  const res = await fetch('/api/storyline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const downloadStory = (data: any) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'storyline.json';
  a.click();
};
