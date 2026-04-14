export const loadStoryline = async () => {
  const res = await fetch('/data/storyline.json');
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
