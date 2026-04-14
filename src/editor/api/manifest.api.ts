export const loadManifest = async () => {
  const res = await fetch('/api/manifest');
  return res.json();
};

export const saveManifest = async (data: any) => {
  const res = await fetch('/api/manifest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};
