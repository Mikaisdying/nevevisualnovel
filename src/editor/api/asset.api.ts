export type AssetType = 'bg' | 'char' | 'cg' | 'audio';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  url: string;
  characterId?: string;
}

export const getAssetsByType = async (type: AssetType): Promise<Asset[]> => {
  const res = await fetch(`/api/assets?type=${type}`);
  if (!res.ok) throw new Error(`Failed to load ${type} assets`);
  return res.json();
};

export const getAssets = async (): Promise<Asset[]> => {
  const res = await fetch('/api/assets');
  if (!res.ok) throw new Error('Failed to load assets');
  return res.json();
};

export const uploadAsset = async (
  file: File,
  type: AssetType,
  characterId?: string,
): Promise<{ success: boolean; file: Asset }> => {
  const formData = new FormData();
  formData.append('type', type);
  if (characterId) formData.append('characterId', characterId);
  formData.append('file', file);

  const res = await fetch('/api/assets/upload', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Upload failed');
  }
  return res.json();
};
