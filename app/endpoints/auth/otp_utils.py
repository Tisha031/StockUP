"""
OTP Email Utility
Handles sending OTP codes via email.
For development, prints to console. For production, configure SMTP.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Email configuration (set these in .env for production)
SMTP_SERVER = os.getenv("SMTP_SERVER", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@stockup.com")


def send_otp_email(email: str, otp_code: str):
    """
    Send OTP code to user's email.
    
    In development mode (no SMTP configured), prints to console.
    In production mode (SMTP configured), sends actual email.
    """
    
    # Development mode - print to console
    if not SMTP_SERVER or not SMTP_USERNAME or not SMTP_PASSWORD:
        print("\n" + "="*60)
        print("📧 OTP EMAIL (Development Mode)")
        print("="*60)
        print(f"To: {email}")
        print(f"Subject: Your StockUP Verification Code")
        print(f"\nYour verification code is: {otp_code}")
        print(f"This code will expire in 5 minutes.")
        print("="*60 + "\n")
        return
    
    # Production mode - send actual email
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        message = MIMEMultipart("alternative")
        message["Subject"] = "Your StockUP Verification Code"
        message["From"] = FROM_EMAIL
        message["To"] = email
        
        # Email body
        text = f"""
        Your StockUP Verification Code
        
        Your verification code is: {otp_code}
        
        This code will expire in 5 minutes.
        
        If you didn't request this code, please ignore this email.
        """
        
        html = f"""
        <html>
          <body>
            <h2>Your StockUP Verification Code</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">{otp_code}</h1>
            <p>This code will expire in 5 minutes.</p>
            <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
          </body>
        </html>
        """
        
        part1 = MIMEText(text, "plain")
        part2 = MIMEText(html, "html")
        message.attach(part1)
        message.attach(part2)
        
        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(FROM_EMAIL, email, message.as_string())
        
        print(f"✓ OTP email sent to {email}")
        
    except Exception as e:
        print(f"✗ Failed to send email to {email}: {e}")
        raise
