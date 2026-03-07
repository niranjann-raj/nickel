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
<body style="font-family: 'Segoe UI', sans-serif; background: #f9fafb; padding: 40px 0; margin: 0;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(99,102,241,0.12);">
    <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6, #14B8A6); padding: 32px; text-align: center;">
      <h1 style="color: white; font-size: 28px; font-weight: 900; margin: 0;">nickle</h1>
    </div>
    <div style="padding: 40px 32px;">
      <h2 style="color: #111827; font-size: 22px; font-weight: 800; margin: 0 0 8px;">Here's your one-time code</h2>
      <p style="color: #6B7280; margin: 0 0 28px;">Use this code to {action}. It expires in <strong>5 minutes</strong>.</p>
      <div style="background: #f3f4f6; border-radius: 16px; padding: 24px; text-align: center; letter-spacing: 12px; font-size: 36px; font-weight: 900; color: #6366F1;">{otp}</div>
      <p style="color: #9CA3AF; font-size: 13px; margin: 24px 0 0;">If you didn't request this, you can safely ignore this email.</p>
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
