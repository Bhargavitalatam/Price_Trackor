# CryptoTrackor

**CryptoTrackor** is a premium, institutional-grade cryptocurrency dashboard that delivers lightning-fast real-time spot market data and interactive historical charts. Built with modern web technologies, it features 60FPS UI rendering, aggressive client-side caching, and a deep, glassmorphic dark-mode UX.

![Desktop View](./screenshots/desktop.png)
*(Note for User: Please add `desktop.png`, `tablet.png`, and `mobile.png` to the `screenshots/` directory)*

### 🔗 Live Demo
[View Live Deployment Here](#) *(Note for User: Insert your Netlify/Vercel link here)*

### 🎥 Video Demonstration
[Watch the 3-minute Video Demo](./video_demo.mp4) *(Note for User: Replace with your final video recording link)*

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Quick Start
1. **Clone the repository:**
   ```bash
   git clone <your-repo-link>
   cd Price_Trackor
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Environment Setup:**
   Copy the example environment variables:
   ```bash
   cp .env.example .env
   ```
4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   *The application will boot up at `http://localhost:5173`.*

---

## 🐳 Containerization (Docker)

To ensure a seamless, isolated environment, CryptoTrackor is fully Dockerized using a highly optimized multi-stage build (Node builder -> Alpine Nginx).

**Using Docker Compose (Recommended):**
```bash
docker-compose up -d --build
```
*Access the production-ready app at `http://localhost:8080`.*

---

## 🏗️ Architectural Overview

CryptoTrackor strictly follows a modular, component-based frontend architecture.

- **State Management**: **Zustand** is utilized as the global reactive data store. To maintain 60 FPS during heavy market volatility (10 updates/sec), components use *granular selectors* (e.g., `prices[symbol]`) rather than subscribing to the entire state block.
- **WebSocket Integration**: The native browser `WebSocket` API is wrapped cleanly inside a dedicated `useWebSocket` hook. Incoming data is accumulated in a buffer array and dispatched to the Zustand store in 100ms batches, maximizing React's rendering pipeline via a single state update.
- **Data Flow**: Presentation and logic are completely isolated. `App.tsx` functions strictly as a layout schema, while heavy network operations and debounced UI reactions are fully delegated to decoupled custom hooks (`useHistoricalData.ts`, `useCryptoPrices.ts`, `useWebSocket.ts`).
- **Caching**: Historical data fetched from CoinGecko employs a two-tier strategy. Level 1 utilizes a zero-latency in-memory `Map`. Level 2 utilizes `localStorage`, ensuring instant graph rendering across session reloads and heavily protecting the application against `429 Too Many Requests` API limits.

---

## 🧪 Testing
The application employs **Vitest** and **React Testing Library** to guard critical business logic and ensure resilient scaling.

We use the modern Vite/React convention of co-locating tests directly beside their source files (e.g., `src/components/CryptoCard.test.tsx`, `src/store/cryptoStore.test.ts`) rather than isolating them in a detached `/tests` folder. This guarantees components are independently verifiable units.

**Run the test suite and coverage report:**
```bash
npm run test
npm run coverage
```
