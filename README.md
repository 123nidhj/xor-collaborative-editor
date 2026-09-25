# XOR Collaborative Editor

> **Write Code. Together. Live.**  
> Open a room, share a link, and code with your team in real time. No setup, no friction.

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![C++](https://img.shields.io/badge/C++-00599C?style=for-the-badge&logo=c%2B%2B&logoColor=white)](https://isocpp.org/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://html.spec.whatwg.org/)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

---

## ⚡ Features

- **Aesthetic Modern UI**: Designed with clean styling, custom harmonic wave animations, and responsive typography (Poppins & Nunito).
- **⚡ Real-Time Multi-Cursor Collaboration**: Sub-15ms WebSocket code synchronization powered by Socket.io.
- **🔒 Private Room Security**:
  - **Collision-Proof IDs**: Cryptographically secure random room generation with over 2.8 trillion combinations.
  - **Host Lock 🔒**: One-click room lockdown to prevent any outsiders from joining.
- **💻 Multi-Language Code Canvas**: Full syntax templates & execution support for:
  - 🐍 **Python** (`.py`)
  - ⚡ **C++** (`.cpp`)
  - 💛 **JavaScript** (`.js`)
  - 🌐 **HTML5** (`.html`)
  - 🎨 **CSS3** (`.css`)
  - 📝 **Markdown** (`.md`)
- **▶️ In-Browser Runner**: Instant code execution tray with live stdout/error output.
- **☁️ Cloud Persistence**: MongoDB Atlas cloud database support with automatic in-memory fallback.

---

## 🛠️ Full-Stack Architecture

| Tier | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Socket.io-client |
| **Backend** | Node.js, Express.js, Socket.io (WebSocket engine) |
| **Database** | MongoDB Atlas, Mongoose ODM, In-Memory resilient fallback |
| **Supported Languages** | JavaScript, Python, C++, HTML5, CSS3, Shell |
| **Deployment** | Vercel (Frontend SPA), Render / Railway (Backend WebSockets) |

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install
```bash
git clone https://github.com/123nidhj/xor-collaborative-editor.git
cd xor-collaborative-editor

# Install dependencies
cd client && npm install
cd ../server && npm install
```

### 2. Configure Environment
Create a `.env` file in the `server` directory (see `server/.env.example`):
```env
PORT=5001
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=super_secret_xor_collab_key_2026
CLIENT_URL=http://localhost:5173
```

### 3. Run Development Servers
```bash
# Start backend
cd server && node server.js

# Start frontend (in a separate terminal)
cd client && npm run dev
```

Open **`http://localhost:5173`** in your browser!

---

## 🌐 Live Deployment

- **Frontend (Live)**: [xor-collaborative-editor.vercel.app](https://xor-collaborative-editor-git-main-nidhi-s-shettys-projects.vercel.app)
- **Backend (WebSockets)**: Node.js server with MongoDB persistence on Render / Railway.
