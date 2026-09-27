/** Lỗi khi gọi backend editor (npm run backend / npm run start). */
async function request(url: string, init?: RequestInit) {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new Error('Không kết nối được backend. Hãy chạy "npm run start".');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.error ??
        (res.status >= 500
          ? `Backend không phản hồi (${res.status}). Kiểm tra "npm run start" còn chạy không.`
          : `Lỗi API (${res.status})`),
    );
  }
  return res.json();
}

export const loadStoryline = () => request('/api/storyline');

export const saveStoryline = (data: any) =>
  request('/api/storyline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const downloadStory = (data: any) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'storyline.json';
  a.click();
};
