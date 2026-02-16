# 🐍 Snake.AI 2026

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.9.0-orange)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> Classic Snake game reimagined with cutting-edge AI technology powered by Google's Gemini AI.

## ✨ Features

- 🤖 **AI-Powered Gameplay**: Dynamic map generation using Gemini AI
- 🎮 **Multiple Game Modes**: Classic, AI Maze Generator, and VS AI Rival
- 🔐 **Secure Authentication**: Firebase Auth with Google Sign-In
- 🏆 **Global Leaderboards**: Compete with players worldwide
- 📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile
- ♿ **Accessibility First**: WCAG 2.1 AA compliant
- 🔒 **Enterprise Security**: Comprehensive security headers and best practices

## 🚀 Quick Start

### Prerequisites

- Node.js 20.9 or higher
- npm or yarn
- Firebase account (for authentication)
- Google Cloud account (for Gemini AI)

### Installation

```bash
# Clone the repository
git clone https://github.com/harshgupta921/promptwar.git
cd promptwar

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase and Gemini API keys

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the app in action!

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy to Google Cloud Run
gcloud run deploy promptwar --source . --region us-central1 --allow-unauthenticated
```

## 🏗️ Project Structure

```
promptwar/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── game/        # Game-specific components
│   │   └── ui/          # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and configs
│   ├── types/           # TypeScript type definitions
│   └── constants/       # App constants
├── __tests__/           # Test files
├── public/              # Static assets
└── Dockerfile           # Container configuration
```

## 🎮 Game Modes

### Classic Mode
Traditional snake gameplay with modern aesthetics.

### AI Maze Generator
Procedurally generated obstacles using Gemini AI based on your skill level.

### VS AI Rival
Compete against an intelligent AI opponent that adapts to your playstyle.

## 🔐 Security Features

- ✅ HTTPS enforcement (HSTS)
- ✅ XSS protection
- ✅ Clickjacking prevention
- ✅ MIME type sniffing protection
- ✅ Secure Firebase authentication
- ✅ Environment variable protection
- ✅ Content Security Policy

## ♿ Accessibility

- ✅ WCAG 2.1 AA compliant
- ✅ Full keyboard navigation
- ✅ Screen reader support
- ✅ ARIA labels and landmarks
- ✅ Semantic HTML structure
- ✅ High contrast mode support

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **AI**: Google Gemini AI
- **Testing**: Jest + React Testing Library
- **Deployment**: Google Cloud Run
- **CI/CD**: GitHub Actions

## 📊 Performance

- ⚡ Lighthouse Score: 95+
- 🎯 First Contentful Paint: < 1.5s
- 📱 Mobile-optimized
- 🚀 Edge-ready deployment

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Harsh Gupta**
- GitHub: [@harshgupta921](https://github.com/harshgupta921)
- Email: harshgupta8512@gmail.com

## 🙏 Acknowledgments

- Google Gemini AI for intelligent gameplay
- Firebase for authentication and database
- Next.js team for the amazing framework
- Tailwind CSS for beautiful styling

## 📞 Support

For support, email harshgupta8512@gmail.com or open an issue on GitHub.

---

Made with ❤️ and ☕ by Harsh Gupta
