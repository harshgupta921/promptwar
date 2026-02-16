# 🐍 SNAKE.AI 2026 - The Autonomous Evolution

A futuristic, AI-powered reinvention of the classic Snake game, built for the modern web with Next.js 14, Tailwind CSS, and Gemini AI.

## 🌟 Vision
This is not just a game; it's a showcase of AI-native application design. We combine nostalgic gameplay with:
- **Generative Maps**: Gemini AI creates unique obstacles based on your skill level.
- **Adaptive Rival**: A neural-network simulated opponent that learns from your moves.
- **AI Narrator**: A sarcastic, responsive commentator powered by LLMs.
- **Neon Arcade Aesthetics**: Glassmorphism, glows, and smooth 60FPS canvas rendering.

## 🚀 Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **AI Engine**: Google Gemini Pro (via Vercel Edge Functions)
- **Database**: Firebase Firestore (High Scores)
- **Auth**: Firebase Auth (Google Sign-In)
- **Deployment**: Vercel

## 🛠️ Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/snake-ai-2026.git
   cd snake-ai-2026
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Copy `.env.example` to `.env.local` and fill in your keys:
   - Get a [Gemini API Key](https://aistudio.google.com/)
   - Get a [Firebase Config](https://firebase.google.com/)
   
   ```bash
   cp .env.example .env.local
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## 🧠 AI Architecture

### Smart Map Generation
- **Endpoint**: `/api/ai/generate-map`
- **Logic**: Sends current player skill (High Score / Play Time) to Gemini Pro.
- **Prompt Engineering**: Instructs the model to design a 20x20 grid JSON with strategic obstacle placement, avoiding impossible traps.

### Reactive Narrator
- **Endpoint**: `/api/ai/narrator`
- **Trigger**: Game events (Death, Milestone, Rival Encounter).
- **Personality**: Sarcastic, competitive, futuristic.

### Rival Snake Logic
- Uses a modified A* (Manhattan Distance) heuristic to chase food while avoiding the player.
- Operates on a separate tick cycle to simulate "reaction time".

## 📦 Deployment

1. **Push to GitHub**.
2. **Import to Vercel**.
3. **Add Environment Variables** in Vercel Dashboard.
4. **Deploy**.

## 🎨 Design System
- **Colors**: Cyan (#00FFFF), Magenta (#FF00FF), Electric Yellow (#FFFF00).
- **Typography**: 'Inter' for UI, 'Press Start 2P' for Arcade elements.
- **Effects**: CSS `box-shadow` for neon glows, `backdrop-filter` for glassmorphism.

---
Built with ❤️ by AI + You for the Future of Gaming.
