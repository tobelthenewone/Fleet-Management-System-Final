// Helper to prepend backend base URL to image paths for vehicle images
export const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  if (imageUrl.startsWith('blob:')) return imageUrl;
  const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://aps2.zemenbank.com/fmsapi/';
  return imageUrl.startsWith('/') ? `${BASE_URL}${imageUrl}` : `${BASE_URL}/${imageUrl}`;
};
