/**
 * Asset API
 * Handles fetching and managing asset data
 */

export interface Asset {
  id: string;
  name: string;
  type: 'bg' | 'char' | 'cg' | 'audio';
  path: string;
}

export const getAssets = async (type?: string): Promise<Asset[]> => {
  try {
    // Implementation for getting assets
    console.log('Getting assets for type:', type);
    return [];
  } catch (error) {
    console.error('Failed to load assets:', error);
    throw error;
  }
};

export const getAssetsByType = async (type: 'bg' | 'char' | 'cg' | 'audio'): Promise<Asset[]> => {
  try {
    const response = await fetch(`/public/assets/${type}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to load ${type} assets:`, error);
    throw error;
  }
};

export const uploadAsset = async (file: File, type: string) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch('/api/assets/upload', {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to upload asset:', error);
    throw error;
  }
};
