# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in Snake.AI 2026, please report it by emailing harshgupta8512@gmail.com.

**Please do not report security vulnerabilities through public GitHub issues.**

### What to include in your report:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)

### Response Timeline:

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Critical issues within 14 days

## Security Measures

### Application Security

- ✅ HTTPS enforcement via HSTS
- ✅ Content Security Policy (CSP)
- ✅ XSS protection headers
- ✅ Clickjacking prevention
- ✅ MIME type sniffing protection

### Authentication & Authorization

- ✅ Firebase Authentication
- ✅ Secure session management
- ✅ Role-based access control
- ✅ Protected API endpoints

### Data Protection

- ✅ Environment variable encryption
- ✅ Secure Firebase rules
- ✅ Input validation and sanitization
- ✅ No sensitive data in client bundles

### Infrastructure Security

- ✅ Regular dependency updates
- ✅ Automated security scanning
- ✅ Docker container security
- ✅ Cloud Run security best practices

## Best Practices for Contributors

1. Never commit sensitive data (API keys, passwords)
2. Use environment variables for configuration
3. Validate all user inputs
4. Follow secure coding guidelines
5. Keep dependencies up to date

## Security Updates

Security updates will be released as patch versions and announced via:
- GitHub Security Advisories
- Release notes
- Email notifications to registered users

Thank you for helping keep Snake.AI 2026 secure!
