# Rayel Music Hub 🎵

> **YOUR STORY. OUR WORDS. YOUR HIT.**  
> Premium African songwriting showroom, exclusive original song catalogue, and direct artist collaboration hub by **Rayel Music Hub**.

---

## 🌟 Overview

Rayel Music Hub is an exclusive, high-performance web platform for artists, record labels, and producers seeking commercial-grade African songwriting, hit concepts, and ready-to-record master song compositions (Afrobeat, Amapiano, Afro-Soul, Dancehall, Bongo Flava, and more).

### Key Features
- **Public Song Showroom & Catalogue:** Instant search, genre/mood filters, responsive 1:1 cover artwork, and status badges (`Available` / `Sold Exclusively`).
- **Direct WhatsApp Integration:** 1-click audio demo requests and exclusive purchase inquiries directly to Rayel's official WhatsApp (+256 742 224 328) with prefilled song metadata.
- **Custom Songwriting Request Hub:** Interactive booking form for tailored lyrics, custom top-lines, and custom artist concepts.
- **Secure Admin Portal (`/admin`):**
  - Salted SHA-256 client-side cryptographic authentication.
  - Complete Song Management: Add new songs, edit metadata, mark sold/available, toggle featured highlights, and delete songs.
  - High-resolution artwork processing with client-side image optimization and browser IndexedDB persistence (`RayelMusicHub_Storage`).
  - Real-time multi-tab state synchronization.
- **Production-Ready & Responsive:** Optimized for all screen sizes from mobile devices (320px+) to 4K ultra-wide monitors with accessible touch targets (≥44px).

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler:** [Vite 6](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Motion](https://motion.dev/)
- **Local Storage:** Browser `localStorage` + `IndexedDB` (for high-resolution cover artwork Blobs)

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js** (version 18.0.0 or higher recommended)
- **npm** (or pnpm / yarn / bun)

### 2. Installation
```bash
# Clone or extract the project
cd Rayel-Music-Hub

# Install dependencies
npm install
```

### 3. Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` (or the port displayed in your terminal).

### 4. Production Build & Preview
```bash
# Compile and bundle for production
npm run build

# Preview the production build locally
npm run preview
```
The compiled static assets will be in the `dist/` directory.

---

## 🌐 Deploying to GitHub & Vercel

### Step 1: Upload to GitHub
1. Create a new GitHub repository named `Rayel-Music-Hub`.
2. In your local project root, run:
```bash
git init
git add .
git commit -m "Initial commit: Rayel Music Hub production release"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/Rayel-Music-Hub.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** → **Project**.
3. Import your **Rayel-Music-Hub** repository.
4. Vercel automatically detects the Vite configuration:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Click **Deploy**.
6. Once deployed, single-page routing (including the `/admin` path) is fully handled by `vercel.json`.

---

## ⚙️ Zero Configuration & Environment Variables

Rayel Music Hub runs entirely client-side out of the box with **zero required environment variables or secrets**.

The application automatically resolves its domain and origin dynamically using the browser's current `window.location.origin`. This guarantees it functions immediately across:
- Local development (`http://localhost:3000`)
- AI Studio preview environments
- Vercel production and preview branch deployments
- Any custom domain you connect to Vercel later without touching code or configuration settings.

---

## 🔐 Admin Portal Access

- Navigate to `/admin` on your deployed domain (or click **Admin** in the website footer).
- Enter your admin credentials to log into the management suite.
- Sessions are securely managed with cryptographic verification and automatic token expiration.

---

## 📄 License & Credits

- **Rayel Music Hub** — All songwriting concepts, brand identity, and catalog materials reserved.
- Developed with modern web engineering standards.
