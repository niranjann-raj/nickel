# 🪙 Nickel — AI-Powered Personal Finance & Gamified Wealth Platform

<p align="center">
  <img src="public/logo.png" alt="Nickel Logo" width="120" style="border-radius: 24px;" />
</p>

<p align="center">
  <b>Smart Financial Discipline Meets Autonomous AI and Engaging Gamification.</b><br>
  Track expenses, autonomously save towards dreams, scan receipts with Gemini AI, settle group expenses, and earn Gold Coins, level bonuses, and leaderboard prizes.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
  <img src="https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Google_Gemini-Flash--Lite-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
</p>

---

## 📖 Table of Contents

1. [Overview & Core Philosophy](#-overview--core-philosophy)
2. [Key Feature Modules](#-key-feature-modules)
   - [Virtual Nickel Debit Card & Account Balance](#-virtual-nickel-debit-card--account-balance)
   - [Expense Tracker & Smart Receipt Scanner](#-expense-tracker--smart-receipt-scanner)
   - [Goal-Based Savings & Autonomous AutoPay](#-goal-based-savings--autonomous-autopay)
   - [Nickel AI (Powered by Gemini)](#-nickel-ai-powered-by-gemini)
   - [Gamification, Streaks & Season Leaderboard](#-gamification-streaks--season-leaderboard)
   - [Split Rooms & Shared Expense Management](#-split-rooms--shared-expense-management)
   - [Zero-Trust Security & Data Protection](#-zero-trust-security--data-protection)
3. [Gamification & Reward Rules](#-gamification--reward-rules)
4. [Architecture & Tech Stack](#-architecture--tech-stack)
5. [Project Structure](#-project-structure)
6. [Local Development & Setup Guide](#-local-development--setup-guide)
7. [Environment Configuration](#-environment-configuration)
8. [Testing & Verification](#-testing--verification)
9. [API Endpoints Reference](#-api-endpoints-reference)

---

## 🌟 Overview & Core Philosophy

Traditional financial apps act like static spreadsheets — they track where money went after the damage is done. **Nickel** transforms personal finance into an active, rewarding lifestyle by merging:

- **Single-Source-of-Truth Ledger**: Real-time cumulative balance calculation derived from authentic cash flow.
- **Autonomous Goal AutoPay**: Automated background debits directly linked to the user's main bank balance.
- **Gemini Multimodal AI**: Instant OCR receipt extraction and conversational financial diagnostics.
- **High-Stakes Gamification**: Daily streaks, streak shields, level progression, and weekly competitive leaderboards.

---

## 🚀 Key Feature Modules

### 💳 Virtual Nickel Debit Card & Account Balance
- **Real-Time Bank Card**: Displayed prominently on the Home Dashboard featuring a dark brushed metallic finish, specular sheen, contactless wave, and user name.
- **Single Source of Truth**: The displayed balance strictly equals the user's **Cumulative Net Cash Flow** across all tracked months (`Total Income Since Day 1 - Total Expenses Since Day 1`).
- **Privacy-First**: The balance is masked by default with an interactive eye-toggle button.
- **Reactive Sync**: Listens to custom window events (`nickel:tracker-updated`) to instantly refresh upon adding, updating, or deleting any transaction.

### 📊 Expense Tracker & Smart Receipt Scanner
- **Categorized Ledger**: Log Income, Expenses, and Transfers with category tagging, payment modes, and notes.
- **Period Comparisons**: True calendar-month and custom timeframe comparisons (e.g., compares current period vs. full preceding calendar month).
- **Gemini AI Bill Scanner**: Upload receipt photos (PNG, WEBP, JPEG) to extract merchant, invoice date, line items, and total amount automatically.
- **Subscriptions & Recurring Outflows**: Track recurring commitments and upcoming bills.
- **Interactive Visualizations**: Powered by Recharts with area gradients and category distribution charts.

### 🎯 Goal-Based Savings & Autonomous AutoPay
- **Custom & Templated Goals**: Set target dates and amounts for emergency funds, gadgets, vehicles, vacations, and education.
- **Autonomous AutoPay Engine**: Background scheduler (APScheduler) checks daily and debits the designated amount directly from the **Main Account Balance**.
- **Interactive Saving Trend**: Modern Recharts AreaChart with **Cumulative Growth** and **Daily Saved** modes, smart INR currency formatting, and historical day-by-day progression.
- **Future Impact Simulator**: Allows users to test splurge decisions against their goal timeline. Choosing to **"Skip"** deposits the splurge amount directly into the goal (+50 XP).
- **PDF Goal Export**: Export comprehensive goal reports formatted with jsPDF and autoTable.

### 🧠 Nickel AI (Powered by Gemini)
- **Conversational Financial Assistant**: Available via floating drawer and dashboard widgets with voice input and multimodal capabilities.
- **Context Injection**: Every prompt dynamically incorporates the user's verified financial profile — current level, XP, coins, streak, active goals, and monthly surplus.
- **Spending Diagnostics**: Highlights unusual spikes and suggests achievable saving adjustments.

### 🎮 Gamification, Streaks & Season Leaderboard
- **Daily Streak System**: Daily goal savings award **+50 XP** per day.
- **Streak Shields**: 1 Shield protects 1 missed day of inactivity. If missed days exceed shield count, the streak breaks without wasting unused shields.
- **Weekly ISO Season Leaderboard**: Automatically rolls over every Sunday midnight UTC, awarding up to **5,000 Gold Coins** to top savers.
- **Daily Spin Wheel**: Daily spins with variable drop probabilities (Coins, XP, Streak Shields).
- **Weekly Financial Quiz**: 5 interactive questions rewarding XP and coins based on financial knowledge.
- **Rewards Shop**: Redeem earned Gold Coins for gift vouchers, tech gadgets, and custom avatar skins.

### 👥 Split Rooms & Shared Expense Management
- **Room-Based Group Finance**: Create and join shared rooms (Housemates, Trips, Events) with invite codes.
- **Flexible Splitting Models**: Supports Equal, Exact Amount, Share Ratios, and Percentages.
- **Debt Minimization Engine**: Calculates who owes whom with one-click payment settlement recording.
- **Split PDF Reports**: Generate itemized breakdowns and balance summaries.

### 🔒 Zero-Trust Security & Data Protection
- **Password Protection**: Argon2id cryptographic hashing with server-side pepper and salt.
- **Field-Level Encryption**: Sensitive user data (phone numbers, financial notes) is encrypted at rest using AES-GCM / Fernet.
- **Stateless JWT Sessions**: Authenticated via HTTP Bearer tokens with strict user isolation.
- **OAuth 2.0 Integration**: Secure Google Sign-In with credential decoding and token verification.

---

## 🏆 Gamification & Reward Rules

### 1. Goal Completion Gold Coin Rewards
Awarded automatically once a goal's cumulative savings reach or exceed its target:

| Target Amount Range | Gold Coins Awarded |
| :--- | :--- |
| **Below ₹1,000** | **25 Coins** 🪙 |
| **₹1,000 – ₹2,499** | **50 Coins** 🪙 |
| **₹2,500 – ₹4,999** | **100 Coins** 🪙 |
| **₹5,000 – ₹9,999** | **200 Coins** 🪙 |
| **₹10,000 – ₹24,999** | **500 Coins** 🪙 |
| **₹25,000 – ₹49,999** | **1,000 Coins** 🪙 |
| **₹50,000 – ₹99,999** | **2,000 Coins** 🪙 |
| **₹1,00,000 – ₹2,49,999** | **5,000 Coins** 🪙 |
| **₹2,50,000 – ₹4,99,999** | **10,000 Coins** 🪙 |
| **₹5,00,000+** | **20,000 Coins** 🪙 |

### 2. Level Up Coin Rewards
Awarded every time the user crosses a level threshold based on lifetime XP:

| Level Tier | Gold Coins Awarded |
| :--- | :--- |
| **Levels 1 – 10** | **+25 Gold Coins** 🪙 |
| **Levels 11 – 20** | **+50 Gold Coins** 🪙 |
| **Levels 21 – 30** | **+75 Gold Coins** 🪙 |
| **Levels 31 – 40** | **+100 Gold Coins** 🪙 |
| **Levels 41+** | Continues linearly at **+25 Coins** per 10 levels |

### 3. Weekly Season Leaderboard Rewards
Dispatched automatically at weekly Sunday rollover:

| Rank | Reward |
| :--- | :--- |
| **Rank 1** | **5,000 Coins** 🪙 |
| **Rank 2** | **2,500 Coins** 🪙 |
| **Rank 3** | **1,000 Coins** 🪙 |
| **Rank 4 – 10** | **750 Coins** 🪙 |
| **Rank 11 – 50** | **500 Coins** 🪙 |
| **Rank 51 – 100** | **250 Coins** 🪙 |
| **Rank 101+** | **25 Coins** 🪙 (Participation) |

---

## 🛠️ Architecture & Tech Stack

```mermaid
graph TD
    Client["Vite + React 18 SPA (TypeScript)"]
    API["Flask REST API (Python 3.10+)"]
    DB[("PostgreSQL Database")]
    Gemini["Google Gemini Flash-Lite AI"]
    Scheduler["APScheduler Background Engine"]

    Client -->|JWT Authenticated Requests| API
    API -->|SQLAlchemy ORM| DB
    API -->|OCR & Chat Prompting| Gemini
    Scheduler -->|Autonomous Daily AutoPay| DB
    Scheduler -->|Season Rollovers| DB
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, GSAP, Recharts, Lucide Icons, jsPDF |
| **Backend** | Python 3.10+, Flask, Flask-SQLAlchemy, Flask-Bcrypt, Flask-JWT-Extended, APScheduler |
| **Database** | PostgreSQL 15+, SQLAlchemy ORM |
| **AI / OCR** | Google Gemini Interactions & Generative AI (`gemini-flash-lite-latest`) |
| **Auth & Security**| Google OAuth 2.0 (GSI), Argon2id + Pepper, Cryptography (AES-GCM / Fernet) |

---

## 📁 Project Structure

```text
nickel/
├── backend/
│   ├── routes/
│   │   ├── auth.py              # User registration, JWT login, OTP verification, Google OAuth
│   │   ├── dashboard.py         # Profile, season leaderboard, coins, level-ups, savings history
│   │   ├── gamification.py      # Daily spin wheel, streak shield awards, quiz scoring
│   │   ├── goals.py             # Goal CRUD, purchase simulator, AutoPay triggers, balance sync
│   │   ├── split.py             # Split rooms, group expenses, settlements, analytics
│   │   └── tracker.py           # Single-source balance endpoint, transactions, summaries, budgets
│   ├── services/
│   │   ├── bill_extractor.py    # Gemini multimodal vision OCR receipt extractor
│   │   └── split_calculator.py  # Optimal debt-settlement algorithm
│   ├── utils/
│   │   ├── ai_context.py        # System prompt builder with real-time financial context
│   │   ├── email.py             # SMTP email dispatcher for OTP verification
│   │   └── security.py          # EncryptedString & EncryptedFloat SQLAlchemy types
│   ├── app.py                   # Application factory, CORS, blueprints, scheduler init
│   ├── models.py                # Database models (User, Goal, TrackerTransaction, SplitRoom, etc.)
│   ├── scheduler.py             # Background AutoPay execution & streak maintenance
│   └── requirements.txt         # Python dependencies
├── src/
│   ├── components/              # Landing page sections (Hero, Features, Impact, FAQ, etc.)
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── goals/           # GoalCard, CreateGoalModal, FutureImpactSimulator
│   │   │   ├── split/           # SplitRoom modals, AddExpense, RecordPayment, RoomShare
│   │   │   ├── tracker/         # SpendingCharts, TrackerAiInsights, BillUpload, BudgetModal
│   │   │   ├── NickelDebitCard.tsx # Cumulative balance bank card component
│   │   │   ├── SavingGraphCard.tsx # Dashboard savings progression card
│   │   │   ├── LeaderboardCard.tsx # Weekly/All-Time rank podium
│   │   │   └── UserSummaryCard.tsx # Level, streak, and XP summary
│   │   ├── pages/               # Dashboard pages (Home, MoneyTracker, Goals, Split, Leaderboard, etc.)
│   │   ├── api.ts               # Axios / Fetch client with JWT interceptor & event triggers
│   │   ├── ChatBot.tsx          # Drawer AI assistant with multimodal voice & text
│   │   └── TopNavbar.tsx        # Top status bar (coins, total saved, streak shields, notifications)
│   ├── utils/
│   │   ├── goalRewards.ts       # Shared Gold Coin reward tier calculator
│   │   ├── pdfGenerator.ts      # Goal PDF summary builder
│   │   └── splitPdfGenerator.ts # Split Room PDF settlement builder
│   ├── App.tsx                  # React Router configuration
│   └── main.tsx                 # Entrypoint
├── tests/                       # Playwright end-to-end test suite
├── package.json                 # Node.js dependencies & build scripts
└── README.md                    # Project documentation
```

---

## 💻 Local Development & Setup Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **PostgreSQL**: v14 or higher running locally (or hosted on Railway / Supabase)
- **Git**

### 2. Clone Repository
```bash
git clone https://github.com/your-username/nickel.git
cd nickel
```

### 3. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create your `.env` file in the `backend/` folder (see [Environment Configuration](#-environment-configuration)).
5. Start the backend server:
   ```bash
   python app.py
   ```
   *The backend will automatically initialize tables and run on `http://127.0.0.1:5000`.*

### 4. Frontend Setup
1. In a separate terminal at the project root:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client will launch at `http://localhost:5173`.*

---

## ⚙️ Environment Configuration

Create a file named `.env` in `backend/.env`:

```env
# Database Connection (PostgreSQL)
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/nickel

# Authentication & JWT Secrets
JWT_SECRET_KEY=generate_a_secure_jwt_secret_key_here
PASSWORD_PEPPER=generate_a_random_hex_pepper_string_here
NICKEL_ENCRYPTION_KEY=generate_32_byte_hex_encryption_key_here

# Google OAuth 2.0 Client ID (from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com

# Google Gemini AI API Key
GEMINI_API_KEY=AIzaSy...your_gemini_api_key...
GEMINI_MODEL=gemini-flash-lite-latest

# Gmail SMTP for OTP Verification (Optional for local testing)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

---

## 🧪 Testing & Verification

### Running Type Checks
```bash
npx tsc --noEmit --skipLibCheck
```

### Running Backend Unit & Reward Verification Tests
```bash
python -m py_compile backend/models.py backend/scheduler.py backend/routes/dashboard.py
```

### Running Playwright End-to-End Tests
```bash
npx playwright test
```

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
- `POST /register`: Create new user account with peppered Argon2 password.
- `POST /login`: Verify credentials and issue JWT access token.
- `POST /google`: Validate Google OAuth ID token and login/register.
- `POST /send-otp` & `POST /verify-otp`: Email OTP verification.

### 💳 Expense Tracker & Balance (`/api/tracker`)
- `GET /balance`: Computes the user's authentic cumulative account balance.
- `GET /transactions`: Retrieve filtered transactions with date & category pagination.
- `POST /transactions`: Record an income, expense, or transfer.
- `PUT /transactions/<id>` & `DELETE /transactions/<id>`: Modify or remove ledger entries.
- `GET /summary`: Month-over-month comparisons and category allocations.
- `POST /extract-bill`: Upload receipt image to extract data via Gemini AI OCR.

### 🎯 Goal Savings (`/api/goals`)
- `GET /`: List all active, paused, and completed goals.
- `POST /`: Create a new savings goal with optional AutoPay configuration.
- `GET /<id>`: Retrieve goal details, transaction history, and delay logs.
- `POST /<id>/autopay/run`: Manually trigger AutoPay debit from Main Account Balance.
- `POST /<id>/decision`: Log splurge simulator choices ("SKIP" or "BUY").
- `PUT /<id>/status`: Toggle goal between ACTIVE and PAUSED.

### 🏆 Dashboard & Gamification (`/api`)
- `GET /user-profile`: Retrieve live user profile, level progress, and active streak.
- `GET /leaderboard?timeframe=season`: Retrieve season rankings and user placement.
- `GET /savings-history`: Daily and cumulative 30-day savings trend for goals.
- `POST /gamification/spin`: Execute daily spin wheel and award perks.
- `POST /gamification/quiz`: Submit weekly financial literacy quiz answers.
- `POST /spend-coins`: Redeem Gold Coins in the rewards marketplace.

### 👥 Split Rooms (`/api/split`)
- `GET /rooms`: List user's active split rooms.
- `POST /rooms`: Create a new room with share code.
- `POST /rooms/<id>/expenses`: Add an expense with Equal, Exact, Share, or % splits.
- `POST /rooms/<id>/settle`: Record payment settlement between participants.
- `GET /rooms/<id>/analytics`: Breakdown of who spent what and outstanding balances.

---

<p align="center">
  <b>Built with ❤️ by the Nickel Team</b><br>
  <i>Empowering financial freedom through intelligence, discipline, and play.</i>
</p>

