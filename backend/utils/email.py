import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_otp_email(to_email: str, otp: str, purpose: str = 'register'):
    gmail_user = os.environ.get('GMAIL_USER')
    gmail_password = os.environ.get('GMAIL_APP_PASSWORD')

    subject_map = {
        'register': 'Verify your nickle account',
        'reset': 'Reset your nickle password',
    }
    subject = subject_map.get(purpose, 'Your nickle OTP code')

    action = 'verify your account' if purpose == 'register' else 'reset your password'

    body = f"""
<!DOCTYPE html>
<html>
<body style="font-family: 'Inter', -apple-system, sans-serif; background: #000000; padding: 40px 0; margin: 0;">
  <div style="max-width: 480px; margin: 0 auto; background: #121212; border-radius: 12px; overflow: hidden; border: 1px solid #222; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
    <div style="padding: 32px; text-align: center; border-bottom: 1px solid #222;">
      <a href="http://localhost:5173/" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none;">
        <span style="font-weight: 800; font-size: 2.25rem; color: #fff; letter-spacing: -0.025em;">nickle</span>
      </a>
    </div>
    <div style="padding: 40px 32px; text-align: center;">
      <h2 style="color: #fff; font-size: 22px; font-weight: 600; margin: 0 0 8px; letter-spacing: -0.025em;">Verify your email</h2>
      <p style="color: #888; font-size: 14px; margin: 0 0 28px; line-height: 1.5;">Use this code to {action}. It expires in <strong style="color: #fff;">5 minutes</strong>.</p>
      <div style="background: #000; border: 1px solid #333; border-radius: 8px; padding: 24px; text-align: center; letter-spacing: 12px; font-size: 32px; font-weight: 700; color: #fff;">{otp}</div>
      <p style="color: #666; font-size: 12px; margin: 24px 0 0;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>
"""

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = gmail_user
    msg['To'] = to_email
    msg.attach(MIMEText(body, 'html'))

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(gmail_user, gmail_password)
        server.sendmail(gmail_user, to_email, msg.as_string())
