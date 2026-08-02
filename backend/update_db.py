from app import create_app
from models import db, Quiz, QuizAttempt

app = create_app()
with app.app_context():
    explanations = {
        'What percentage of income does the 50/30/20 rule recommend saving?': 'The rule suggests 50% for needs, 30% for wants, and 20% for saving and investing.',
        'Which saving method involves setting aside money automatically each month?': '\"Pay yourself first\" means automatically routing a set amount into savings before spending.',
        'An emergency fund should ideally cover how many months of expenses?': 'Financial experts recommend having 3-6 months of expenses for a solid safety net.',
        'What is the best account for an emergency fund?': 'A savings account ensures your emergency money is safe, liquid, and easily accessible.',
        'What does a \"zero-based budget\" mean?': 'A zero-based budget gives every dollar a specific job until income minus expenses equals exactly zero.',
        'Which of the following is a \"need\"?': 'Rent is a basic survival necessity, unlike movies and dining out which are discretionary wants.',
        'Tracking expenses helps you to:': 'Tracking where your money goes exposes spending habits and helps you plug financial leaks.',
        'What is compound interest?': 'Compound interest allows you to earn interest on both your initial principal and accumulated past interest.',
        'Which type of interest grows your savings faster?': 'Compound interest grows exponentially making it much faster than simple fixed-rate interest over time.',
        'If you save ₹1000 at 10% simple interest for 2 years, interest earned is:': '10% of ₹1000 is ₹100. Over 2 years using simple interest, it becomes ₹200.',
        'What does a mutual fund do?': 'Mutual funds pool money from many investors to purchase a diversified portfolio of stocks or bonds.',
        'What is a stock?': 'A stock represents a fractional ownership share in a corporation.',
        'Diversification in investing means:': 'Spreading investments across different assets reduces the overall risk of losing your entire capital.',
        'What is a SIP (Systematic Investment Plan)?': 'SIP allows you to invest a fixed amount regularly, building wealth through dollar-cost averaging.',
        'Risk and return in investing are generally:': 'Higher returns typically require taking on proportionately higher levels of risk.'
    }
    count = 0
    for q in Quiz.query.all():
        if q.question in explanations:
            q.explanation = explanations[q.question]
            count += 1
    
    # Also clear attempts so user can test right away
    QuizAttempt.query.delete()
    db.session.commit()
    print(f'Done! Updated {count} questions and cleared attempts.')
