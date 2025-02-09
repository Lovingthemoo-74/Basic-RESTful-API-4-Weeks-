# Basic RESTful API (4 Weeks) 🚀

A professional-grade REST API implementation showcasing enterprise security features and best practices. Built over 4 weeks with focus on security, scalability, and maintainability.

![API Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Security](https://img.shields.io/badge/security-enterprise-green.svg)
![License](https://img.shields.io/badge/license-ISC-blue.svg)

## 🛡️ Security Features

### API Key Authentication
- Header-based authentication
- Secure key validation
- Environment-based configuration
```bash
curl -H "X-API-Key: your-api-key" http://localhost:3000/api/health
```

### Rate Limiting
- Request throttling
- Redis support for production
- Configurable limits
```json
{
  "RateLimit-Limit": "100",
  "RateLimit-Remaining": "99",
  "RateLimit-Reset": "60"
}
```

### XSS Prevention
- Input sanitization
- HTML/Script stripping
- Safe output encoding
```javascript
// Input: <script>alert("xss")</script>John<p>Test</p>
// Output: "John"
```

### Security Headers
- Content Security Policy (CSP)
- HSTS
- XSS Protection
- Frame Options
- And more...

## 🚀 Quick Start

1. Clone the repository
```bash
git clone https://github.com/yourusername/basic-restful-api.git
cd basic-restful-api
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your settings
```

4. Start the server
```bash
npm run dev
```

5. View API documentation
```
http://localhost:3000/api-docs
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run security checks:
```bash
npm run security-demo
```

## 📚 Documentation

- [Security Implementation](docs/SECURITY.md)
- [Development Log](docs/DEVELOPMENT_LOG.md)
- [Project Status](docs/PROJECT_STATUS.md)
- [Demo Highlights](docs/DEMO_HIGHLIGHTS.md)

## 🔒 Security Best Practices

- ✅ API Key Authentication
- ✅ Rate Limiting
- ✅ Input Sanitization
- ✅ XSS Prevention
- ✅ Security Headers
- ✅ Error Handling
- ✅ Input Validation
- ✅ Secure Defaults

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Redis (optional, for production)

### Project Structure
```
.
├── src/
│   ├── config/         # Configuration files
│   ├── middleware/     # Custom middleware
│   ├── routes/         # API routes
│   └── types/          # TypeScript types
├── docs/              # Documentation
├── scripts/          # Utility scripts
└── tests/           # Test suites
```

### Available Scripts
- `npm run dev`: Start development server
- `npm test`: Run test suite
- `npm run build`: Build for production
- `npm run security-demo`: Run security demonstration
- `npm run lint`: Run linter
- `npm run format`: Format code

## 📈 Project Timeline

### Week 1: Foundation
- ✅ Project setup
- ✅ Basic API structure
- ✅ TypeScript configuration

### Week 2: Security Implementation
- ✅ API key authentication
- ✅ Rate limiting
- ✅ Security headers

### Week 3: Input Validation
- ✅ Request sanitization
- ✅ XSS prevention
- ✅ Error handling

### Week 4: Documentation & Testing
- ✅ API documentation
- ✅ Security testing
- ✅ Performance optimization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is ISC licensed. See the [LICENSE](LICENSE) file for details.

## 👥 Contact

- GitHub: [@lovingthemoo](https://github.com/lovingthemoo)
- Email: lovingthemoo@gmail.com

---
Made with ❤️ by [lovingthemoo](https://github.com/lovingthemoo)