"""
Email Utilities
Handles OTP and password reset email sending with real SMTP support.
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from dotenv import load_dotenv

load_dotenv()

# Email Configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@stockup.com")


def send_email(to_email: str, subject: str, body_html: str, body_text: str = None):
    """
    Send email to user.
    
    In development mode (no SMTP configured), prints to console.
    In production mode (SMTP configured), sends actual email via SMTP.
    """
    
    # Development mode - print to console
    if not all([SMTP_SERVER, SMTP_USERNAME, SMTP_PASSWORD]):
        print("\n" + "="*80)
        print("📧 EMAIL (Development Mode)")
        print("="*80)
        print(f"To: {to_email}")
        print(f"From: {FROM_EMAIL}")
        print(f"Subject: {subject}")
        print("-" * 80)
        print("HTML Body:")
        print(body_html)
        if body_text and body_text != body_html:
            print("-" * 80)
            print("Text Body:")
            print(body_text)
        print("="*80 + "\n")
        return True
    
    # Production mode - send actual email
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = formataddr(('StockUP', FROM_EMAIL))
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Attach text version
        if body_text:
            text_part = MIMEText(body_text, 'plain', 'utf-8')
            msg.attach(text_part)
        
        # Attach HTML version
        html_part = MIMEText(body_html, 'html', 'utf-8')
        msg.attach(html_part)
        
        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"✓ Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        print(f"✗ Failed to send email to {to_email}: {str(e)}")
        raise e


def send_otp_email(email: str, otp_code: str):
    """Send OTP verification code to user's email"""
    
    subject = "Your StockUP Verification Code"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>StockUP - Verification Code</title>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .logo {{ font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }}
            .otp-code {{ font-size: 36px; font-weight: bold; color: #2563eb; text-align: center; background: #f8fafc; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0; border: 2px dashed #2563eb; }}
            .footer {{ text-align: center; margin-top: 30px; font-size: 14px; color: #666; }}
            .warning {{ background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">StockUP</div>
                <h1>Email Verification</h1>
            </div>
            
            <p>Hi there!</p>
            
            <p>Thank you for registering with StockUP. To complete your account setup, please use the verification code below:</p>
            
            <div class="otp-code">{otp_code}</div>
            
            <div class="warning">
                <strong>⚠️ Important:</strong> This code will expire in 5 minutes. If you didn't request this verification, please ignore this email.
            </div>
            
            <p>Once verified, you'll have access to all StockUP features including:</p>
            <ul>
                <li>📊 Personal watchlists and portfolios</li>
                <li>🎯 Price alerts and target tracking</li>
                <li>📝 Investment journal</li>
                <li>💰 DCF valuation models</li>
            </ul>
            
            <div class="footer">
                <p>If you have any questions, contact us at support@stockup.com</p>
                <p>© 2026 StockUP. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""
    StockUP - Email Verification
    
    Hi there!
    
    Thank you for registering with StockUP. To complete your account setup, please use the verification code below:
    
    Verification Code: {otp_code}
    
    Important: This code will expire in 5 minutes. If you didn't request this verification, please ignore this email.
    
    Once verified, you'll have access to all StockUP features including personal watchlists, price alerts, investment journal, and DCF models.
    
    If you have any questions, contact us at support@stockup.com
    
    © 2026 StockUP. All rights reserved.
    """
    
    return send_email(email, subject, html_body, text_body)


def send_password_reset_email(email: str, reset_token: str, reset_url: str):
    """Send password reset email to user"""
    
    subject = "Reset Your StockUP Password"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>StockUP - Password Reset</title>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .logo {{ font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }}
            .reset-button {{ display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }}
            .reset-button:hover {{ background: #1d4ed8; }}
            .footer {{ text-align: center; margin-top: 30px; font-size: 14px; color: #666; }}
            .warning {{ background: #fee2e2; border: 1px solid #ef4444; padding: 15px; border-radius: 5px; margin: 20px 0; }}
            .code-block {{ background: #f8fafc; padding: 15px; border-radius: 5px; font-family: monospace; word-break: break-all; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">StockUP</div>
                <h1>Password Reset Request</h1>
            </div>
            
            <p>Hi there!</p>
            
            <p>We received a request to reset your StockUP account password. Click the button below to set a new password:</p>
            
            <div style="text-align: center;">
                <a href="{reset_url}" class="reset-button">Reset My Password</a>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <div class="code-block">{reset_url}</div>
            
            <div class="warning">
                <strong>🔒 Security Notice:</strong> This reset link will expire in 1 hour. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
            </div>
            
            <p>For security reasons, if you continue to have trouble accessing your account, please contact our support team.</p>
            
            <div class="footer">
                <p>If you have any questions, contact us at support@stockup.com</p>
                <p>© 2026 StockUP. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""
    StockUP - Password Reset Request
    
    Hi there!
    
    We received a request to reset your StockUP account password. Use the link below to set a new password:
    
    Reset Link: {reset_url}
    
    Security Notice: This reset link will expire in 1 hour. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
    
    For security reasons, if you continue to have trouble accessing your account, please contact our support team.
    
    If you have any questions, contact us at support@stockup.com
    
    © 2026 StockUP. All rights reserved.
    """
    
    return send_email(email, subject, html_body, text_body)