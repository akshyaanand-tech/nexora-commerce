export const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NXR-${timestamp}-${random}`;
};

export const calculateTax = (subtotal) => Math.round(subtotal * 0.08 * 100) / 100;

export const calculateShipping = (subtotal) => (subtotal >= 100 ? 0 : 9.99);

export const parseImages = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  try {
    return JSON.parse(images);
  } catch {
    return [];
  }
};
