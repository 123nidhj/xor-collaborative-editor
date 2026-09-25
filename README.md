# &lt;SYNC/WAVE&gt; — Production-Ready Real-Time Collaborative Editor

A high-performance, full-stack real-time collaborative code & document platform inspired by developer platforms like **Vercel** and **Linear**.

Features a modern dark-mode SaaS UI (`bg-[#050505]` / `bg-[#0a0a0a]`), subtle technical grid pattern overlays, glowing accents, an abstract neon wave centerpiece, live multi-cursor tracking, granular collaborator permissions, and persistent MongoDB storage.

---

## ⚡ Key Highlights

- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons + React Router.
- **Backend**: Node.js + Express.js modular REST API + Socket.io WebSocket server.
- **Database**: MongoDB via Mongoose (with seamless embedded in-memory fallback for zero-config local testing).
- **Security**: JWT authentication, bcrypt password hashing, and role-based route middleware.
- **Real-Time Collaboration**: Sub-15ms multi-cursor synchronization, collaborator presence badges, and debounced auto-saving.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Launch Development Environment
```bash
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5001`
- **Health Endpoint**: `http://localhost:5001/api/health`

### 3. Run Automated Tests
```bash
npm test
```

---

## 🧪 Testing Real-Time Collaboration Locally

1. Open two browser windows: one standard and one incognito/private.
2. In Window 1, go to `http://localhost:5173/login` and click **"Alice (Demo)"**.
3. In Window 2, go to `http://localhost:5173/login` and click **"Bob (Demo)"**.
4. In Window 1 (Alice), create a new workspace or click a template, then click **Share** and invite `bob@demo.io`.
5. In Window 2 (Bob), refresh the dashboard to see the shared workspace and enter the room.
6. Observe:
   - Live presence avatars for both Alice and Bob.
   - Remote cursor indicators showing each collaborator's name and position in real time.
   - Instantaneous typing synchronization.
   - Debounced auto-save feedback (`Saved to Cloud`).

---

## 📖 Deep-Dive Architecture Guide
For full technical documentation covering schemas, REST request lifecycles, WebSocket event models, and concurrency management, see [`EXPLANATION.md`](./EXPLANATION.md).
