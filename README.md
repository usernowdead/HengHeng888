# 🛒 Payplearn - Top-up Game & Social Boosting Platform

Modern web application for game top-up and social media boosting services.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Setup database
npx prisma generate
npx prisma migrate dev

# Create admin user
node scripts/create-admin.js

# Run development server
npm run dev
```

Visit http://localhost:3000

---

## 📚 Documentation

- **[API Documentation](./API.md)** - Complete API reference
- **[Deployment Guide](./DEPLOYMENT.md)** - Step-by-step deployment instructions
- **[Monitoring Guide](./MONITORING.md)** - Monitoring and alerting setup
- **[Security Report](./SECURITY_COMPARISON_REPORT.md)** - Security assessment
- **[Performance Report](./SRE_PERFORMANCE_DOCUMENTATION_REPORT.md)** - Performance optimization guide

---

## 🏗️ Tech Stack

- **Framework:** Next.js 16
- **Database:** PostgreSQL (Prisma ORM)
- **Authentication:** JWT (httpOnly cookies)
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI, Shadcn/ui
- **Deployment:** Vercel (recommended)

---

## 🔐 Security Features

- ✅ SQL Injection Protection (Prisma ORM)
- ✅ XSS Protection (DOMPurify)
- ✅ CSRF Protection (Double Submit Cookie)
- ✅ Rate Limiting (Redis + in-memory)
- ✅ Security Logging
- ✅ httpOnly Cookies for JWT
- ✅ Security Headers (CSP, HSTS, etc.)

---

## 📦 Project Structure

```
ginly-store-src/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── api/          # API routes
│   │   ├── admin/        # Admin pages
│   │   └── account/      # User account pages
│   ├── components/       # React components
│   ├── lib/              # Utilities & helpers
│   │   ├── security/     # Security utilities
│   │   └── cache.ts      # Caching utilities
│   └── context/          # React contexts
├── prisma/               # Database schema & migrations
└── public/               # Static assets
```

---

## 🔑 Environment Variables

See [`.env.example`](./.env.example) for all required environment variables.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT secret key (min 32 characters)
- `API_KEY_MIDDLE` - Middle Pay API key
- `API_KEY_ADS4U` - ADS4U API key
- `PAYMENT_GATEWAY_API_KEY` - Payment gateway API key

**Optional:**
- `RATE_LIMIT_REDIS_URL` - Redis URL for rate limiting
- `TURNSTILE_SECRET_KEY` - Cloudflare Turnstile secret
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Cloudflare Turnstile site key

---

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy to Vercel:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## 📊 Performance

- **API Response Time:** < 100ms (cached), < 500ms (uncached)
- **Database Query Time:** < 50ms
- **Cache Hit Rate:** > 80% (with Redis)

See [SRE_PERFORMANCE_DOCUMENTATION_REPORT.md](./SRE_PERFORMANCE_DOCUMENTATION_REPORT.md) for optimization guide.

---

## 🧪 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## 📝 API Keys

Get API keys from:
- https://ads4u.co
- https://www.middle-pay.com

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

## 🆘 Support

For issues and questions:
- Check [Documentation](./DEPLOYMENT.md)
- Review [Troubleshooting Guide](./DEPLOYMENT.md#troubleshooting)
- Contact development team

---

**Last Updated:** 2024-12-25
