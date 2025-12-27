'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header/Header'
import { getProducts, createProduct, deleteProduct, createBanner, getBanners, type Product, type Banner } from '@/lib/api'

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'products' | 'banners'>('products')

  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    category_id: '00000000-0000-0000-0000-000000000000',
    image_url: '',
    platform: '',
    version: '',
  })

  const [bannerForm, setBannerForm] = useState({
    image_url: '',
    title: '',
    description: '',
    link_url: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [productsData, bannersData] = await Promise.all([
        getProducts(),
        getBanners(),
      ])
      setProducts(productsData)
      setBanners(bannersData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await createProduct({
        ...productForm,
        price: parseFloat(productForm.price),
      })
      alert('เพิ่มสินค้าสำเร็จแล้ว')
      setProductForm({
        name: '',
        slug: '',
        description: '',
        price: '',
        category_id: '00000000-0000-0000-0000-000000000000',
        image_url: '',
        platform: '',
        version: '',
      })
      loadData()
    } catch (error: any) {
      console.error('Error creating product:', error)
      alert(`เกิดข้อผิดพลาด: ${error.message || 'ไม่สามารถเพิ่มสินค้าได้'}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?')) return
    setLoading(true)
    try {
      await deleteProduct(id)
      loadData()
    } catch (error) {
      console.error('Error deleting product:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateBanner(e: React.FormEvent) {
    e.preventDefault()
    
    // Validate required fields
    if (!bannerForm.image_url.trim()) {
      alert('กรุณากรอก URL รูปภาพ')
      return
    }
    
    setLoading(true)
    try {
      const result = await createBanner({
        image_url: bannerForm.image_url.trim(),
        title: bannerForm.title.trim() || null,
        description: bannerForm.description.trim() || null,
        link_url: bannerForm.link_url.trim() || null,
      })
      
      console.log('Banner created successfully:', result)
      alert('เพิ่ม Banner สำเร็จแล้ว')
      
      setBannerForm({
        image_url: '',
        title: '',
        description: '',
        link_url: '',
      })
      
      await loadData()
    } catch (error: any) {
      console.error('Error creating banner:', error)
      const errorMessage = error.message || 'ไม่สามารถเพิ่ม Banner ได้'
      alert(`เกิดข้อผิดพลาด: ${errorMessage}\n\nกรุณาตรวจสอบ:\n1. Backend server กำลังรันอยู่ที่ http://localhost:3001\n2. URL รูปภาพถูกต้อง\n3. เปิด Browser Console (F12) เพื่อดูรายละเอียด error`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-[480px] mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 text-sm">จัดการสินค้าและ Banner</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'products'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            จัดการสินค้า
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'banners'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            จัดการ Banner
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">เพิ่มสินค้าใหม่</h2>
              <form onSubmit={handleCreateProduct} className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    ชื่อสินค้า
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={productForm.slug}
                    onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      ราคา
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Platform
                    </label>
                    <input
                      type="text"
                      value={productForm.platform}
                      onChange={(e) => setProductForm({ ...productForm, platform: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="iOS, Android, Web"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    URL รูปภาพ
                  </label>
                  <input
                    type="url"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  {productForm.image_url && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={productForm.image_url}
                        alt="Preview"
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    คำอธิบาย
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  เพิ่มสินค้า
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                รายการสินค้า ({products.length})
              </h2>
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                      <p className="text-blue-600 font-semibold mt-1">{product.price.toLocaleString()} ฿</p>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={loading}
                      className="ml-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors text-sm font-medium"
                    >
                      ลบ
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Banners Tab */}
        {activeTab === 'banners' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">เพิ่ม Banner ใหม่</h2>
              <form onSubmit={handleCreateBanner} className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    URL รูปภาพ
                  </label>
                  <input
                    type="url"
                    value={bannerForm.image_url}
                    onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/banner.jpg"
                    required
                  />
                  {bannerForm.image_url && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      <img
                        src={bannerForm.image_url}
                        alt="Banner Preview"
                        className="w-full h-48 object-contain bg-white"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                                ไม่สามารถโหลดรูปภาพได้
                              </div>
                            `
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    หัวข้อ
                  </label>
                  <input
                    type="text"
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="โปรโมชั่นพิเศษ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    คำอธิบาย
                  </label>
                  <textarea
                    value={bannerForm.description}
                    onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="รายละเอียดโปรโมชั่น"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Link URL
                  </label>
                  <input
                    type="url"
                    value={bannerForm.link_url}
                    onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  เพิ่ม Banner
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                รายการ Banner ({banners.length})
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {banners.map((banner) => (
                  <div key={banner.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="aspect-video bg-gray-100 relative">
                      {banner.image_url ? (
                        <img
                          src={banner.image_url}
                          alt={banner.title || 'Banner'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          ไม่มีรูปภาพ
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{banner.title || 'ไม่มีหัวข้อ'}</h3>
                      <p className="text-sm text-gray-600">{banner.description}</p>
                      {banner.link_url && (
                        <a
                          href={banner.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm hover:text-blue-700 mt-2 inline-block"
                        >
                          เปิดลิงก์ →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
