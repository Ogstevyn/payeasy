<p align="center">
  <strong>PayEasy</strong> — Blockchain-Powered Rent Sharing for Roommates
</p>

<p align="center">
  <a href="https://github.com/Ogstevyn/payeasy/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
  <a href="https://github.com/Ogstevyn/payeasy/stargazers"><img src="https://img.shields.io/github/stars/Ogstevyn/payeasy?style=social" alt="Stars" /></a>
  <a href="https://stellar.org"><img src="https://img.shields.io/badge/powered%20by-Stellar-brightgreen" alt="Stellar" /></a>
  <a href="https://github.com/Ogstevyn/payeasy/actions/workflows/ci.yml"><img src="https://github.com/Ogstevyn/payeasy/actions/workflows/ci.yml/badge.svg" alt="CI Status" /></a>
</p>

---

## What is PayEasy?

**PayEasy** is an open-source platform that makes rent sharing trustless, transparent, and simple. It connects roommates and landlords through a blockchain-secured escrow system built on the [Stellar](https://stellar.org) network.

### The Problem

Sharing rent with roommates requires trust. Someone has to collect money. Someone has to pay the landlord. If one roommate doesn't pay, everyone suffers. There's no transparency, no accountability, and no protection.

### The Solution

PayEasy solves this with **smart contract escrow**:

1. **Find Roommates** — Browse apartments and connect with compatible people
2. **Agree on a Split** — Set each roommate's share through the Rent Builder
3. **Contribute to Escrow** — Each roommate sends their share to a Stellar smart contract
4. **Auto-Release** — When all shares are in, the full rent is released to the landlord

No middleman. No bank. Settlements in ~5 seconds. Transaction fees of ~$0.00001.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, React 18, Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Database** | MongoDB Atlas |
| **Blockchain** | Stellar Network (Soroban smart contracts) |
| **Wallet** | Freighter (Stellar wallet) |
| **Auth** | JWT-based authentication |
| **Language** | TypeScript |

---

## Pages

| Page | Status | Description |
|---|---|---|
| 🏠 Landing Page | ✅ Built | Hero, features, how-it-works, Stellar section |
| 🔍 Find Roommate | 🟡 Open for contribution | Browse & search apartment listings |
| 👤 Roommate Profile | 🟡 Open for contribution | View user profiles & preferences |
| 💬 Messages | 🟡 Open for contribution | Chat with potential roommates |
| 🏗️ Rent Builder | 🟡 Open for contribution | Configure rent split & roommate count |
| 📊 Escrow Dashboard | 🟡 Open for contribution | Track escrow status & contributions |
| 📜 Payment History | 🟡 Open for contribution | View past transactions on-chain |

---

## Getting Started

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org))
- **npm** v9+ (comes with Node.js)
- **Git** ([download](https://git-scm.com))
- **Freighter Wallet** (browser extension, for blockchain features) — [install](https://www.freighter.app/)

### Installation

```bash
# Clone the repository
git clone https://github.com/Ogstevyn/payeasy.git
cd payeasy

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Create a `.env.local` file in the root:

```env
# MongoDB
MONGODB_URI=your_mongodb_atlas_connection_string

# Auth
JWT_SECRET=your_jwt_secret_key

# Stellar
NEXT_PUBLIC_STELLAR_NETWORK=testnet

# Optional
SENTRY_DSN=
RESEND_API_KEY=
```

---

## Contributing

> **⚠️ Before you start contributing, please read the [CONTRIBUTING.md](CONTRIBUTING.md) file.** It contains everything you need to know: setup instructions, coding standards, branch naming, commit conventions, and our code of conduct.

We welcome contributions from developers of all experience levels! Check out the [Issues](https://github.com/Ogstevyn/payeasy/issues) tab to find tasks to work on.

---

## Project Structure

```
payeasy/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Global styles
│   └── api/                # API routes (backend)
├── components/             # React components
│   └── landing/            # Landing page components
├── lib/                    # Shared utilities (future)
│   ├── mongodb/            # Database client & models
│   ├── stellar/            # Stellar SDK integration
│   └── auth/               # JWT authentication
├── public/                 # Static assets
├── CONTRIBUTING.md         # Contributor guide
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies & scripts
```

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Ogstevyn">Ogstevyn</a> and contributors
</p>
