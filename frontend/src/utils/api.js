const API_BASE = '/api';

const getToken = () => localStorage.getItem('nexora_token');

export const api = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0]?.msg || 'Request failed');
  }

  return data;
};

export const auth = {
  register: (body) => api('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => api('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => api('/auth/me'),
  updateProfile: (body) => api('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  updateTheme: (theme) => api('/auth/theme', { method: 'PUT', body: JSON.stringify({ theme }) }),
};

export const products = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api(`/products${query ? `?${query}` : ''}`);
  },
  getTrending: () => api('/products/trending'),
  getById: (id) => api(`/products/${id}`),
  getRelated: (id) => api(`/products/${id}/related`),
  create: (body) => api('/products', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => api(`/products/${id}`, { method: 'DELETE' }),
};

export const categories = {
  getAll: () => api('/categories'),
  create: (body) => api('/categories', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => api(`/categories/${id}`, { method: 'DELETE' }),
};

export const cart = {
  get: () => api('/cart'),
  add: (productId, quantity = 1) => api('/cart/add', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  update: (productId, quantity) => api('/cart/update', { method: 'PUT', body: JSON.stringify({ productId, quantity }) }),
  remove: (productId) => api(`/cart/remove/${productId}`, { method: 'DELETE' }),
  applyCoupon: (code) => api('/cart/coupon', { method: 'POST', body: JSON.stringify({ code }) }),
  removeCoupon: () => api('/cart/coupon', { method: 'DELETE' }),
};

export const orders = {
  create: (body) => api('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getMy: () => api('/orders/my'),
  getById: (id) => api(`/orders/${id}`),
  getAll: () => api('/orders'),
  updateStatus: (id, status) => api(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

export const wishlist = {
  get: () => api('/wishlist'),
  add: (productId) => api(`/wishlist/${productId}`, { method: 'POST' }),
  remove: (productId) => api(`/wishlist/${productId}`, { method: 'DELETE' }),
};

export const addresses = {
  get: () => api('/addresses'),
  create: (body) => api('/addresses', { method: 'POST', body: JSON.stringify(body) }),
  delete: (id) => api(`/addresses/${id}`, { method: 'DELETE' }),
};

export const admin = {
  getAnalytics: () => api('/admin/analytics'),
  getUsers: () => api('/admin/users'),
  updateUserRole: (id, role) => api(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
};

export const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
