# nickel - Turn Saving Money Into a Game

### AI-Powered Goal-Based Savings & Financial Intelligence Platform

> **Save with purpose. Build financial habits. Make smarter decisions.**

Nickel is a gamified, AI-powered financial platform designed to help students, young professionals, and Gen-Z users develop better saving habits through **goal-based savings, automated saving plans, financial gamification, and an intelligent AI financial assistant**.

Instead of simply tracking how much money a user has, Nickel focuses on a more meaningful question:

> **"What are you saving for?"**

Users can create financial goals such as a laptop, mobile phone, bike, vacation, emergency fund, or any custom goal. Nickel then tracks progress, manages scheduled savings, provides personalized financial insights, and uses gamification to make saving more engaging.

---

## 🚀 Why Nickel?

Traditional finance applications often focus on:

- Account balances
- Transaction history
- Expense tracking
- Static financial dashboards

Nickel takes a different approach.

It combines:

**Goal-Based Saving + Automation + Gamification + AI Financial Assistance**

into a single platform.

Instead of telling users:

> "You have ₹20,000."

Nickel helps answer:

> "How can I use my ₹20,000 to reach my ₹80,000 laptop goal?"

---

# ✨ Key Features

## 🎯 Goal-Based Savings

Create savings goals based on what actually matters to you.

### Predefined goals

- 📱 Mobile
- 💻 Laptop
- 🏍️ Bike
- ✈️ Vacation
- 🚗 Car
- 🎓 Education
- 🛡️ Emergency Fund

Users can also create:

### ✨ Custom Goals

Define your own:

- Goal name
- Target amount
- Target date
- Description
- Goal icon

Nickel automatically tracks:

- Amount saved
- Amount remaining
- Completion percentage
- Days remaining
- Saving schedule
- Goal status

---

## 🔄 Goal AutoPay

Users can create an automatic savings plan for individual goals.

Supported schedules include:

- Daily
- Weekly
- Monthly
- Custom schedules

For example:

> Goal: Buy a Laptop  
> Target: ₹80,000  
> Target date: 90 days  
> Saving schedule: Daily

Nickel calculates the required contribution and moves the scheduled amount from the **Dummy Bank Account** into the corresponding goal.

Each goal maintains its own saving progress and transaction history.

---

## 🏦 Dummy Bank System

Nickel includes a simulated banking environment for demonstrating financial workflows without connecting to a real bank account.

The Dummy Bank supports:

- Account balance
- Deposits
- Transactions
- Goal AutoPay
- Normal AutoPay
- Transaction history

This allows the complete saving workflow to be demonstrated safely.

---

## 💰 Savings Wallet

Nickel includes a gamified savings system based on saving difficulty.

### Easy
- 20% target
- 100 XP

### Medium
- 30% target
- 200 XP

### Hard
- 40% target
- 300 XP

Users can build saving habits while progressing through Nickel's gamification system.

---

## 🔥 Streak System

Nickel encourages consistent saving through streaks.

Users can maintain saving streaks and receive rewards for consistent financial behavior.

The streak system is integrated with Nickel's existing AutoPay and savings logic.

---

## 🧠 Nickel AI — AI Financial Assistant

Nickel AI is more than a traditional chatbot.

It acts as an **AI Financial Assistant** capable of handling both general questions and Nickel-specific financial questions.

### General questions

For example:

> "What is Dynamic Programming?"

> "Explain arrays."

> "What is compound interest?"

### Nickel-specific questions

The assistant can provide personalized responses based on relevant Nickel data.

For example:

> "How much do I need to save for my laptop?"

> "How am I doing with my goals?"

> "How much is left for my bike?"

> "What happens if I spend ₹5,000?"

The goal is to move from:

**Generic AI responses**

to:

**Context-aware financial assistance.**

---

## 🛡️ Financial Security

Nickel has been designed with security in mind.

### Password Security

Passwords are protected using:

- Argon2id password hashing
- Unique salts
- Optional server-side pepper
- Environment-based secret configuration

Passwords are never stored as plaintext.

### Data Security

Sensitive financial data is protected using:

- AES-256-GCM authenticated encryption
- Environment-based encryption keys
- Secure key handling
- Database access controls

Sensitive credentials and encryption keys are not stored in the Git repository.

> Nickel's security architecture is designed for the current development/hackathon environment and can be further hardened for production deployment.

---

# 🎮 Gamification

Nickel turns saving into an engaging experience.

## 🪙 Coins

Users earn virtual coins through activities and rewards.

Coins can be used within Nickel's reward ecosystem.

---

## ⭐ XP & Levels

Users earn XP through saving activities and other interactions.

XP contributes to progression and gamification.

---

## 🎡 Daily Spin Wheel

Nickel includes a daily reward wheel.

Users can spin **once per day**.

Possible rewards include:

- ❌ Better Luck Next Time
- 🪙 1 Coin
- 🪙 10 Coins
- 🪙 100 Coins
- 🪙 1,000 Coins
- ⭐ +100 XP
- 🛡️ Streak Shield
- 👤 Rare Avatar

The reward probabilities are transparently available through a dedicated **Reward Probabilities** section.

Rewards are automatically credited to the user's account.

---

## 👤 Avatars

Users can unlock rare avatars through Nickel's reward system.

This adds a collectible layer to the financial gamification experience.

---

# 🏆 Leaderboard

Nickel includes a competitive leaderboard based on user progression and rewards.

Users can compete based on their financial activity and earn virtual rewards based on ranking.

---

# 📊 Goal Management

Nickel provides a complete goal management workflow.

Users can:

- Create goals
- Edit goals
- Pause goals
- Resume goals
- Track progress
- View completed goals
- View saving history
- View goal transactions
- Search goals
- Filter goals by status
- Export goal summaries

### Goal Status

Goals automatically reflect their current state:

- 🟢 Active
- 🟡 Paused
- 🟢 Completed

Status is determined by the goal's actual state rather than requiring users to manually manage status tags.

---

# 🔎 Goal Search & Filtering

Nickel provides goal search functionality for quickly finding specific goals.

Users can filter goals by:

- Active
- Paused
- Completed

This keeps goal management scalable as users create more savings goals.

---

# 📄 Goal Summary Export

Users can export a selected goal as a PDF summary.

The summary can include relevant information such as:

- Goal name
- Target amount
- Amount saved
- Remaining amount
- Progress
- Target date
- Status
- Saving information
- Relevant timestamps

This makes goal information easy to save and share.

---

# 🎯 Behavioral Saving Features

Nickel is designed around the idea that saving is not only a mathematical problem — it is also a behavioral problem.

Features such as:

- Streaks
- XP
- Coins
- Daily rewards
- Goal progress
- Automated saving
- Financial AI assistance

are designed to encourage users to develop consistent saving habits.

---

# 🏗️ System Architecture

Nickel follows a client-server architecture.

```text  
                         ┌──────────────────┐
                         │      User        │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  React Frontend  │
                         └────────┬─────────┘
                                  │
                              REST API
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Flask Backend   │
                         └───────┬──────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
                 ▼               ▼               ▼
          ┌────────────┐  ┌─────────────┐  ┌─────────────┐
          │ PostgreSQL │  │ Dummy Bank  │  │  Nickel AI  │
          │  Database  │  │   System    │  │   Gemini    │
          └────────────┘  └─────────────┘  └─────────────┘

```

# 🛠️ Tech Stack

## Frontend

- **React** — Component-based user interface
- **TypeScript** — Type-safe frontend development
- **Vite** — Frontend build tool and development server
- **CSS** — Responsive and modern UI styling
- **REST API Integration** — Communication with the Flask backend

## Backend

- **Python** — Backend development
- **Flask** — REST API and server-side application framework
- **JWT** — Authentication and session management
- **SMTP** — Email OTP verification and password reset

## Database

- **PostgreSQL** — Persistent relational database for users, goals, savings, transactions, rewards, and application data

## Artificial Intelligence

- **Google Gemini API** — Powers Nickel AI, the intelligent financial assistant
- **Context-aware AI responses** — Provides personalized assistance using relevant Nickel financial information

## Security

- **Argon2id** — Secure password hashing
- **Unique Salt** — Protects password hashes against precomputed attacks
- **Password Pepper** — Additional server-side protection for password hashing
- **AES-256-GCM** — Authenticated encryption for sensitive financial data
- **Environment Variables** — Secure storage of API keys, database credentials, encryption keys, and other secrets
- **JWT Authentication** — Secure API authentication

## Gamification

- **XP & Levels** — Rewards users for consistent saving behavior
- **Coins** — Virtual reward currency
- **Streaks** — Encourages consistent saving
- **Leaderboard** — Competitive reward system
- **Daily Spin Wheel** — Daily randomized rewards
- **Streak Shield** — Protects users from losing their saving streak
- **Unlockable Avatars** — Collectible rewards for users

## Development & Version Control

- **Git** — Version control
- **GitHub** — Source code hosting and collaboration
- **VS Code / Antigravity** — Development environment
Environment-based secrets
Development
Git
GitHub
VS Code / Antigravity

# 🔄 Application Workflow

A simplified Nickel workflow looks like this:

```text
                         ┌─────────────────┐
                         │      User       │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Create Account  │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Email OTP       │
                         │ Verification    │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │      Login      │
                         └────────┬────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │    Nickel Dashboard     │
                    └────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
          ▼                      ▼                      ▼
   ┌─────────────┐       ┌──────────────┐       ┌──────────────┐
   │ Dummy Bank  │       │   Savings    │       │  Nickel AI   │
   │   System    │       │    Wallet    │       │   Assistant  │
   └─────────────┘       └──────┬───────┘       └──────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ Goal-Based       │
                       │ Savings          │
                       └────────┬─────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
       ┌────────────┐    ┌────────────┐    ┌──────────────┐
       │ Create     │    │ Set Target │    │ Set Target   │
       │ Goal       │    │ Amount     │    │ Date         │
       └────────────┘    └────────────┘    └──────┬───────┘
                                                  │
                                                  ▼
                                        ┌──────────────────┐
                                        │ Configure Goal   │
                                        │ AutoPay          │
                                        └────────┬─────────┘
                                                 │
                                                 ▼
                                        ┌──────────────────┐
                                        │ Goal Progress &  │
                                        │ Transactions     │
                                        └──────────────────┘

                         Additional Features
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
      ┌────────────┐       ┌────────────┐       ┌────────────┐
      │ Leaderboard│       │ Daily Spin │       │ Transactions│
      └────────────┘       └────────────┘       └────────────┘


```
 
# 🔒 Security Disclaimer

Nickel is currently a development/hackathon project and uses a simulated banking environment.

It is not connected to real bank accounts and should not be used to manage real financial assets.

Security mechanisms implemented in the project are intended to demonstrate production-oriented security practices but should undergo additional security auditing, penetration testing, infrastructure hardening, secret management, and compliance review before handling real financial data.

# 🎯 Project Vision

Nickel aims to make saving money:

Purposeful → Automated → Intelligent → Engaging

Rather than simply showing users where their money went, Nickel helps them understand:

Where they want their money to go — and how to get there.

# 👥 Team

- **Niranjan Raj**
- **Anmol Vishisht**

# 📜 License

This project is currently intended for educational, hackathon, and demonstration purposes.
