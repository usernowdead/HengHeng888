const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Banner {
  id: string;
  image_url: string;
  title?: string;
  description?: string;
  link_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_url?: string;
  display_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image_url?: string;
  platform?: string;
  version?: string;
  is_premium: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export async function getBanners(): Promise<Banner[]> {
  const res = await fetch(`${API_BASE_URL}/api/banners`);
  if (!res.ok) throw new Error('Failed to fetch banners');
  return res.json();
}

export async function getProducts(category?: string): Promise<Product[]> {
  const url = category 
    ? `${API_BASE_URL}/api/products?category=${category}`
    : `${API_BASE_URL}/api/products`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function createProduct(data: any) {
  const res = await fetch(`${API_BASE_URL}/api/admin/product`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Product creation error:', errorText);
    throw new Error(`Failed to create product: ${errorText}`);
  }
  return res.json();
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/admin/product/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Product deletion error:', errorText);
    throw new Error(`Failed to delete product: ${errorText}`);
  }
  return res.json();
}

export async function createBanner(data: any) {
  const res = await fetch(`${API_BASE_URL}/api/admin/banner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Banner creation error:', errorText);
    throw new Error(`Failed to create banner: ${errorText}`);
  }
  return res.json();
}

