import os
import shutil
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_document():
    doc = docx.Document()

    # Page Margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Color definitions
    PRIMARY = RGBColor(15, 23, 42)       # Slate 900
    SECONDARY = RGBColor(37, 99, 235)    # Blue 600
    DARK_GREY = RGBColor(51, 65, 85)     # Slate 700
    MUTED_GREY = RGBColor(100, 116, 139) # Slate 500
    EMERALD = RGBColor(16, 185, 129)     # Emerald 600

    def set_cell_background(cell, hex_color):
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
        cell._tc.get_or_add_tcPr().append(shd)

    def add_title(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2)
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(24)
        run.font.bold = True
        run.font.color.rgb = PRIMARY
        return p

    def add_subtitle(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(14)
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.color.rgb = SECONDARY
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(15)
        run.font.bold = True
        run.font.color.rgb = PRIMARY
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.color.rgb = SECONDARY
        return p

    def add_body(text, bold_prefix=None, space_after=4):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.name = 'Calibri'
            r_pre.font.size = Pt(10.5)
            r_pre.font.bold = True
            r_pre.font.color.rgb = PRIMARY
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(10.5)
        run.font.color.rgb = DARK_GREY
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.name = 'Calibri'
            r_pre.font.size = Pt(10.5)
            r_pre.font.bold = True
            r_pre.font.color.rgb = PRIMARY
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(10.5)
        run.font.color.rgb = DARK_GREY
        return p

    def add_callout(text, title='ARCHITECTURE UPDATE'):
        table = doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False
        table.columns[0].width = Inches(6.9)
        cell = table.cell(0, 0)
        set_cell_background(cell, 'F8FAFC')
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.15
        r1 = p.add_run(f'📌 {title}: ')
        r1.font.name = 'Calibri'
        r1.font.bold = True
        r1.font.size = Pt(10)
        r1.font.color.rgb = SECONDARY
        r2 = p.add_run(text)
        r2.font.name = 'Calibri'
        r2.font.size = Pt(10)
        r2.font.color.rgb = DARK_GREY

    # ==========================================
    # 1. HEADER
    # ==========================================
    add_title("NICKEL 2.0 — COMPLETE TECHNICAL SPECIFICATION")
    add_subtitle("AI-Driven FinTech Operating System | Architecture, Modules & Roadmap")

    add_body("This document serves as the authoritative, up-to-date technical context and architecture specification for Nickel 2.0. All legacy prototypes (such as dummy bank accounts and disconnected savings levels) have been fully superseded by autonomous Goal-Based Savings, real-world Expense Tracker Net Cash Flow integration, context-rich Gemini AI coaching, and competitive behavioral gamification.", bold_prefix="Document Status: Fully Synchronized & Operational | ")

    # ==========================================
    # 2. CORE IDENTITY & VISION
    # ==========================================
    add_h1("1. Core Identity & Problem Statement")
    add_body("Nickel", bold_prefix="Project Name: ")
    add_body("Nickel 2.0 (Hackathon Master Edition / FinTech AI OS)", bold_prefix="Version: ")
    add_body("Financial Technology (FinTech), Behavioral Economics & Autonomous AI Planning", bold_prefix="Domain: ")
    add_body("College students, Gen Z, first-time earners, young professionals, and anyone struggling with consistent savings habits.", bold_prefix="Target Audience: ")

    add_h2("The Core Problem")
    add_body("Young earners conceptually know they need to save, but behavioral friction and instant gratification prevent them from doing so consistently. Traditional finance apps (e.g. Mint, Splitwise, standard bank portals) are purely passive and informational: they show retroactive graphs, historical balances, and static budgets, but never actively intervene or help users achieve specific financial milestones.")

    add_h2("The Nickel 2.0 Vision")
    add_bullet("Nickel is NOT just an expense tracker.", bold_prefix="Autonomous: ")
    add_bullet("Nickel is NOT just a budgeting spreadsheet or static balance display.", bold_prefix="Execution-Oriented: ")
    add_bullet("Nickel is NOT just an isolated chatbot giving generic textbook tips.", bold_prefix="Context-Aware AI: ")
    add_bullet("Nickel IS an intelligent financial operating system that autonomously links day-to-day spending with goal-based savings, daily gamified habits, and personalized AI coaching to ensure users actually achieve their dreams.", bold_prefix="The Definition: ")

    # ==========================================
    # 3. MODERN TECH STACK & INFRASTRUCTURE
    # ==========================================
    add_h1("2. Modern Tech Stack & Architecture")

    add_h2("Frontend Tier")
    add_bullet("React 18 + TypeScript (Strict mode typing across all components)", bold_prefix="Core Framework: ")
    add_bullet("Vite (High-performance build tooling and hot-module replacement)", bold_prefix="Bundler: ")
    add_bullet("Tailwind CSS with dark-first, clean fintech monochrome palette (#111 dark panels, modern slate/zinc accents)", bold_prefix="Styling: ")
    add_bullet("Recharts (Responsive data visualization, SVG trends, stacked progress bars)", bold_prefix="Charts: ")
    add_bullet("Lucide React (Streamlined featherweight icon set)", bold_prefix="Icons: ")
    add_bullet("jsPDF (Client-side institutional financial report generation)", bold_prefix="PDF Reporting: ")

    add_h2("Backend Tier")
    add_bullet("Python 3.10+ with Flask RESTful API architecture", bold_prefix="Server: ")
    add_bullet("Flask-SQLAlchemy with PostgreSQL (ACID compliant, foreign keys, cascades)", bold_prefix="ORM & Database: ")
    add_bullet("Flask-JWT-Extended (Stateless secure authentication tokens)", bold_prefix="Authentication: ")
    add_bullet("APScheduler (Advanced Python Scheduler for automated background jobs)", bold_prefix="Autonomous Scheduler: ")
    add_bullet("Google GenAI SDK (Gemini Flash models for real-time coaching and OCR bill extraction)", bold_prefix="AI Engine: ")
    add_bullet("Argon2 / Bcrypt with server-side password pepper and AES column-level encryption for sensitive PII", bold_prefix="Security: ")

    # ==========================================
    # 4. APPLICATION WORKFLOW
    # ==========================================
    add_h1("3. End-to-End Application Workflow")
    add_body("Landing Page → Modern Auth (Email/Password or Google SSO) → 6-digit Email OTP Verification → Secure JWT Session → Dashboard Hub → Autonomous Modules (Goal Savings, Expense Tracker, Split Groups, AI Coach, Rewards Shop).")

    # ==========================================
    # 5. CORE FUNCTIONAL MODULES
    # ==========================================
    add_h1("4. Core Functional Modules (In-Depth)")

    add_h2("Module 1: Goal-Based Savings (Fully Implemented & Core)")
    add_body("Rather than saving money arbitrarily, Nickel centers around targeted life milestones (e.g. 'Buy a Laptop', 'Emergency Fund', 'New Bike', 'Vacation').")
    add_bullet("Goal Creation: User specifies Goal Name, Target Amount (₹), Target Date, Icon, and optional Description.", bold_prefix="Milestone Engine: ")
    add_bullet("Real-Time Tracking: Tracks exact saved amount, remaining balance, percentage completion, and days remaining.", bold_prefix="Visual Progress: ")
    add_bullet("Supports DAILY, WEEKLY, MONTHLY, and CUSTOM (every N days) debit cycles.", bold_prefix="Multi-Frequency AutoPay: ")
    add_bullet("An automated background APScheduler cron job runs daily at 1:00 AM local time, automatically executing all goals where next_run_date <= today.", bold_prefix="Autonomous 1:00 AM Execution: ")
    add_bullet("AutoPay debits directly from the user's Expense Tracker Net Cash Flow balance (no dummy bank).", bold_prefix="Real-World Net Cash Flow Linking: ")
    add_bullet("Every successful debit automatically logs an expense in the Expense Tracker with merchant '<Goal Name> autopay debit' under the 'Savings' category.", bold_prefix="Automated Transaction Ledger: ")
    add_bullet("If Net Cash Flow < AutoPay amount, the goal is automatically PAUSED, a FAILED GoalTransaction is recorded with the exact shortfall, and an in-app warning notification is sent, preventing overdraft.", bold_prefix="Insufficient Balance Protection: ")
    add_bullet("Allows users to test buying an item to see its exact impact on goal completion date, with options to 'SKIP' (credits goal, accelerates timeline, awards +50 XP) or 'BUY' (logs splurge, delays timeline).", bold_prefix="Purchase Impact Simulator: ")

    add_callout(
        "AutoPay runs automatically every morning at 1:00 AM for all frequencies (Daily, Weekly, Monthly, Custom) directly drawing from Expense Tracker Net Cash Flow. Failed debits pause safely without penalty.",
        title="AUTONOMOUS 1:00 AM AUTOPAY"
    )

    add_h2("Module 2: Expense Tracker & Net Cash Flow")
    add_body("A comprehensive real-world double-entry ledger that serves as the funding foundation for the entire ecosystem.")
    add_bullet("Net Cash Flow = Total Lifetime Income - Total Lifetime Expenses. Represents liquid surplus available for savings.", bold_prefix="Net Cash Flow Metric: ")
    add_bullet("Multi-category tracking (Food & Dining, Rent & Housing, Groceries, Savings, Bills & Utilities, Shopping, Entertainment, etc.).", bold_prefix="Categorized Ledger: ")
    add_bullet("Users can upload image or PDF bills. Nickel utilizes Google Gemini Vision to extract merchant, invoice number, line items, and total amount automatically.", bold_prefix="AI Bill Receipt Scanner (OCR): ")
    add_bullet("Tracks recurring monthly subscriptions (Netflix, Spotify, Gym, Utilities) with renewal reminders and monthly burden totals.", bold_prefix="Subscription Management: ")
    add_bullet("Category breakdown pie charts, monthly inflow vs. outflow bars, and CSV / PDF one-click export.", bold_prefix="Spending Analytics: ")

    add_h2("Module 3: Nickel AI Financial Coach (Context-Aware)")
    add_body("Nickel AI is not a detached generic chatbot. It receives real-time structured context from the backend on every request.")
    add_bullet("The build_nickel_context engine dynamically compiles user profile, Net Cash Flow, categorized spending ranked by amount with percentages, top 5 largest individual expenses, active goals, auto-saving frequencies, daily saving pace, and group splits into the prompt context.", bold_prefix="Live Multi-Module Context: ")
    add_bullet("Users can ask real questions like 'What did I spend the most on?', 'How is my laptop goal doing?', or 'How much can I afford to save today?', and receive precise answers with exact figures.", bold_prefix="Deterministic Grounding: ")
    add_bullet("Operates on gemini-flash-lite-latest with automated fallbacks to gemini-3.5-flash-lite and local database-driven intelligence if offline.", bold_prefix="Resilient Model Pipeline: ")

    add_h2("Module 4: Gamification & Behavioral Economics")
    add_body("Nickel transforms tedious financial discipline into an engaging, habit-forming experience.")
    add_bullet("Linked to Goal-Based Savings. Increments and awards +50 XP every day a daily AutoPay or savings deposit is maintained.", bold_prefix="Daily Saving Streak: ")
    add_bullet("Streak Shields protect users from losing their streak when an AutoPay fails or a day is missed.", bold_prefix="Streak Shields: ")
    add_bullet("Earned through saving milestones, maintaining streaks, skipping impulsive purchases, and financial literacy quizzes. Unlocks levels and badges.", bold_prefix="XP & Leveling System: ")
    add_bullet("Virtual currency earned through quizzes, leaderboard ranks, and daily wheel spins, redeemable in the Rewards Shop.", bold_prefix="Coins Economy: ")
    add_bullet("24-hour interactive wheel spin granting bonus coins, XP, and streak shields.", bold_prefix="Daily Wheel Spin: ")
    add_bullet("Bite-sized weekly financial literacy quizzes covering inflation, compounding, mutual funds, and budgeting.", bold_prefix="Financial Literacy Quizzes: ")
    add_bullet("Weekly, monthly, and seasonal leaderboards ranking users competitively across the community.", bold_prefix="Competitive Leaderboards: ")

    add_h2("Module 5: Split Expenses (Social Bill Sharing)")
    add_body("Group expense sharing for roommates, trips, and outings without leaving the Nickel application.")
    add_bullet("Create persistent rooms with invite codes and multi-member balances.", bold_prefix="Split Rooms: ")
    add_bullet("Equal, exact amount, and percentage-based splitting with multi-payer support.", bold_prefix="Split Methods: ")
    add_bullet("Calculates optimal peer-to-peer settlement paths to minimize total transactions.", bold_prefix="Debt Settlement: ")

    # ==========================================
    # 6. RETIRED PROTOTYPE FEATURES
    # ==========================================
    add_h1("5. Retired Prototype Features (Migration Log)")
    add_body("To transition from a prototype to a real-world FinTech application, the following legacy elements were permanently decommissioned:")
    add_bullet("Retired and purged from backend and frontend. Arbitrary percentages without specific goal targets were ineffective for long-term retention.", bold_prefix="Old 'Save Money' Module (Easy 20%, Medium 30%, Hard 40%): ")
    add_bullet("Replaced with real-world Expense Tracker Net Cash Flow. Simulated bank inputs created data inconsistency and lacked realism.", bold_prefix="Simulated / Dummy Bank Account: ")
    add_bullet("All AutoPay logic was migrated into Goal-Based Savings, directly updating the real Expense Tracker ledger.", bold_prefix="Dummy Bank AutoPay: ")
    add_bullet("Reconciled all disparate balance counters so TopNavbar, GoalCards, and Dashboard display unified numbers.", bold_prefix="Inconsistent Balance Metrics: ")

    # ==========================================
    # 7. FEATURE STATUS MATRIX
    # ==========================================
    add_h1("6. Feature Implementation Status Matrix")

    table = doc.add_table(rows=1, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    col_widths = [Inches(2.5), Inches(1.5), Inches(2.9)]
    for i, w in enumerate(col_widths):
        table.columns[i].width = w

    hdr_cells = table.rows[0].cells
    hdr_titles = ["Feature / Component", "Current Status", "Key Operational Details"]
    for i, cell in enumerate(hdr_cells):
        cell.width = col_widths[i]
        set_cell_background(cell, "0F172A")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        run = p.add_run(hdr_titles[i])
        run.font.name = 'Calibri'
        run.font.bold = True
        run.font.size = Pt(10)
        run.font.color.rgb = RGBColor(255, 255, 255)

    data = [
        ("Goal-Based Savings", "Operational", "Target goals, completion forecasts, simulator, PDF export"),
        ("1:00 AM Automated AutoPay", "Operational", "APScheduler daily cron, Daily/Weekly/Monthly/Custom, Net Cash Flow linked"),
        ("Net Cash Flow Linking", "Operational", "Auto-debits from Net Cash Flow, logs '<Goal> autopay debit' in tracker"),
        ("Insufficient Funds Guard", "Operational", "Auto-pauses goal, records failed transaction, sends warning notification"),
        ("Expense Tracker", "Operational", "Full transaction ledger, analytics charts, CSV/PDF export"),
        ("AI Bill Receipt OCR", "Operational", "Gemini vision receipt scanning for automatic transaction extraction"),
        ("Nickel AI Coach", "Operational", "Gemini-powered coach with dynamic multi-module financial context"),
        ("Daily Saving Streak", "Operational", "Linked to daily savings, grants +50 XP/day, protected by shields"),
        ("Gamification (XP/Levels/Coins)", "Operational", "Dynamic leveling curve, coin economy, streak shields, daily wheel spin"),
        ("Split Expenses", "Operational", "Group rooms, equal/custom splits, debt settlement minimization"),
        ("Financial Quizzes", "Operational", "Educational quizzes granting coins and XP"),
        ("Legacy Save Money / Dummy Bank", "Retired", "Deleted from database, models, and UI; replaced by real Net Cash Flow")
    ]

    for row_idx, (feat, stat, detail) in enumerate(data):
        row = table.add_row()
        cells = row.cells
        bg_col = "F8FAFC" if row_idx % 2 == 0 else "FFFFFF"
        for i, cell in enumerate(cells):
            cell.width = col_widths[i]
            set_cell_background(cell, bg_col)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(3)
            run = p.add_run([feat, stat, detail][i])
            run.font.name = 'Calibri'
            run.font.size = Pt(9.5)
            if i == 1:
                run.font.bold = True
                run.font.color.rgb = EMERALD if stat == "Operational" else MUTED_GREY
            else:
                run.font.color.rgb = PRIMARY if i == 0 else DARK_GREY

    # ==========================================
    # 8. FUTURE ROADMAP (NICKEL 3.0)
    # ==========================================
    add_h1("7. Future Roadmap (Nickel 3.0)")
    add_bullet("Integration with RBI-licensed Account Aggregators (Setu, OneMoney) for automated bank statement syncing.", bold_prefix="Open Banking & Account Aggregator: ")
    add_bullet("Machine learning forecasting that predicts upcoming subscription spikes and automatically throttles AutoPay to prevent overdraft.", bold_prefix="Predictive Cash Flow Throttling: ")
    add_bullet("Collaborative savings rooms where friends save collectively towards shared group targets (trips, gear).", bold_prefix="Group Goal Challenges: ")
    add_bullet("Seamless sweep-in micro-investments into liquid mutual funds (7% p.a.) for goal balances.", bold_prefix="Micro-Investing Integration: ")

    # Save to disk
    out_path_project = r"c:\Users\lenovo\Desktop\nickel\NICKEL_2.0_PROJECT_DOCUMENTATION.docx"
    doc.save(out_path_project)
    print(f"Document saved successfully to {out_path_project}")

    # Also copy to artifacts dir
    artifacts_dir = r"C:\Users\lenovo\.gemini\antigravity\brain\bfa37cb6-9448-461b-b212-7041c9333082"
    out_path_artifact = os.path.join(artifacts_dir, "NICKEL_2.0_PROJECT_DOCUMENTATION.docx")
    shutil.copy2(out_path_project, out_path_artifact)
    print(f"Document copied successfully to {out_path_artifact}")

if __name__ == '__main__':
    create_document()

