package com.realestate.app.domain.auth.mailer;

public interface PasswordResetMailer {
    void sendResetLink(String toEmail, String resetUrl);
}
