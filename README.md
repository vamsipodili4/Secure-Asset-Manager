# S.A.M — Secure Asset Manager

S.A.M is a professional-grade Digital Asset Management System (DAMS) featuring AES-256-GCM encryption, cross-platform support (Web, Android, iOS), and a premium Glassmorphism UI.

## 🚀 Features

- **End-to-End Security**: Every file is encrypted using AES-256-GCM before being stored.
- **Cross-Platform**: Unified experience across Responsive Web (React) and Mobile (Expo).
- **Social Auth**: Primary login via Google OAuth 2.0.
- **Search & Filter**: Find assets by metadata, tags, and file types.
- **Audit System**: Every action (upload, download, view) is logged for security compliance.
- **Secure Sharing**: Password-protected sharing links with expiration.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, MongoDB, Passport.js (Google OAuth).
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion.
- **Mobile**: React Native, Expo.
- **Security**: AES-256-GCM, JWT, bcrypt.

## 📦 Project Structure

```text
/
├── backend/    # Node.js + Express API
├── web/        # React + Vite Web Application
├── mobile/     # Expo Mobile Application
├── uploads/    # Local storage for encrypted assets
└── scripts/     # Utility scripts
```

## 🚥 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or Atlas)
- Google Cloud Console credentials (for OAuth)

### 2. Environment Setup
Create a `.env` file in the `backend/` directory based on the following template:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
CALLBACK_URL=http://localhost:5000/api/auth/google/callback
ENCRYPTION_SECRET=your_32_char_secret
STORAGE_PATH=./uploads
CLIENT_URL=http://localhost:5173
```

### 3. Installation
```bash
# Install root dependencies (if any)
npm install

# Setup Backend
cd backend && npm install && npm run dev

# Setup Web
cd web && npm install && npm run dev

# Setup Mobile
cd mobile && npm install && expo start
```

## 🔒 Security Implementation

S.A.M uses a single-key encryption model for development. In production, this can be extended to an AWS KMS-based per-user key management system.
1. **Encryption**: `crypto.createCipheriv('aes-256-gcm', ...)`
2. **Hashing**: Passwords (if used) are hashed using `bcrypt` with a salt round of 10.
3. **Storage**: Files are stored as `.enc` binaries. Even if storage is breached, data remains unreadable.

## 📄 License
MIT License. Built by P. Sai Krishna Vamsi and team
