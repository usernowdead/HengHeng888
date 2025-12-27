'use client'

const testimonials = [
  {
    id: 1,
    name: 'John',
    handle: '@john',
    review: 'ซื้อแล้วใช้งานได้ทันที ไม่ต้องตั้งค่าเยอะ บริการหลังการขายดีมากครับ',
    avatarColor: 'bg-blue-500',
    rating: 5,
  },
  {
    id: 2,
    name: 'Jack',
    handle: '@jack',
    review: 'โปรแกรมใช้งานง่ายมาก ประหยัดเวลาในการพัฒนาไปเยอะเลยครับ',
    avatarColor: 'bg-green-500',
    rating: 5,
  },
  {
    id: 3,
    name: 'Jill',
    handle: '@jill',
    review: 'เหมาะกับสาย Dev มาก ฟีเจอร์ครบ ราคาดี คุ้มสุด ๆ',
    avatarColor: 'bg-purple-500',
    rating: 5,
  },
  {
    id: 4,
    name: 'Jenny',
    handle: '@jenny',
    review: 'ตอบโจทย์สายเขียนโค้ดมาก ไม่ต้องเสียเวลาหาของเองอีกต่อไป',
    avatarColor: 'bg-pink-500',
    rating: 5,
  },
  {
    id: 5,
    name: 'James',
    handle: '@james',
    review: 'ระบบเสถียร รองรับหลายภาษา ใช้ในทีม dev ได้ดีมาก',
    avatarColor: 'bg-indigo-500',
    rating: 5,
  },
  {
    id: 6,
    name: 'Jane',
    handle: '@jane',
    review: 'เป็นร้านที่เชื่อถือได้ ซื้อมาหลายตัวแล้ว ใช้งานได้จริง ไม่มีปัญหาเลยค่ะ',
    avatarColor: 'bg-amber-500',
    rating: 5,
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'text-amber-400 fill-current' : 'text-gray-300'
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  return (
    <section className="py-12">
      <div className="w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ความคิดเห็นจากลูกค้า</h2>
          <p className="text-gray-600 text-sm">สิ่งที่ลูกค้าพูดถึงเรา</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full ${testimonial.avatarColor} flex-shrink-0 flex items-center justify-center text-white font-semibold text-lg shadow-sm`}>
                  {testimonial.name.charAt(0)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                        <span className="text-gray-500 text-sm">{testimonial.handle}</span>
                      </div>
                      <StarRating rating={testimonial.rating} />
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm mt-2">
                    {testimonial.review}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
