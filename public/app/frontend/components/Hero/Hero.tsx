'use client'

export default function Hero() {
  return (
    <section className="py-16 mb-10">
      <div className="w-full">
        <div className="text-center space-y-6">
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              ยินดีต้อนรับสู่ร้าน{' '}
              <span className="text-blue-600">SAFE</span>
              <span className="text-green-600"> ZONE</span>{' '}
              <span className="text-gray-900">STORE</span>
            </h1>
            
            {/* Description */}
            <div className="max-w-lg mx-auto px-4">
              <p className="text-gray-600 leading-relaxed text-base">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
                nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
          </div>
          
          {/* Hero Image (Optional) */}
          <div className="pt-4">
            <div className="relative w-full h-64 rounded-xl overflow-hidden bg-gray-100 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">Hero Image Placeholder</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="pt-2">
            <button className="inline-flex items-center justify-center px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg">
              เริ่มต้นใช้งาน
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
