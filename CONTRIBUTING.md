# Contributing to HiveTalk

Thank you for your interest in contributing to **HiveTalk**! We are committed to building a modern, reliable, and real-time group collaboration platform.

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js**: v20 or higher
- **npm**: v9 or higher

### Installation
Clone the repository and install dependencies in all subprojects:

```bash
# Install root, client, server, and functions dependencies
npm install
cd client && npm install
cd ../server && npm install
cd ../functions && npm install
```

### Running Locally

HiveTalk is built with dual-mode architecture: it runs completely locally out-of-the-box without requiring live cloud credentials, and optionally connects to Firebase services when credentials are provided.

```bash
# Start backend server (port 8080)
cd server
npm run dev

# In a separate terminal, start frontend (port 5173 / 3000)
cd client
npm run dev
```

---

## 🧪 Testing Guidelines

Before submitting a Pull Request, verify that all test suites pass and TypeScript types check cleanly:

```bash
# Run backend test suite (vitest)
cd server
npm test

# Build frontend to verify TypeScript and bundling
cd ../client
npm run build
```

---

## 📐 Architecture & Standards

1. **Role-Based Access Control (RBAC)**:
   - `admin`: Group creator, full group management, role reassignment, deletion.
   - `moderator`: Manage messages, pin items, create announcements, revoke invites.
   - `member`: Standard chat participation, file uploads, reactions.
2. **Design Language**:
   - HiveTalk uses a warm brown accent palette (`#8B5E3C`), clean contrast, accessible typography, and intuitive WhatsApp-inspired layout.
3. **Dual-Mode Persistence**:
   - Always ensure changes maintain graceful fallbacks when Firestore is offline or unconfigured.

---

## 📝 Commit & PR Conventions

- **feat**: A new feature (e.g., `feat(calls): support screen sharing`)
- **fix**: A bug fix (e.g., `fix(rules): allow member reaction updates`)
- **docs**: Documentation improvements
- **test**: Adding or updating tests
- **refactor**: Code restructuring with no behavior change

---

## 📄 License

By contributing to HiveTalk, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
