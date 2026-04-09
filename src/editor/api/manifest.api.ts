export const loadManifest = async () => {
  const res = await fetch('/data/manifest.json');
  return res.json();
};

export const downloadManifest = (data: any) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'manifest.json';
  a.click();
};
