package com.realestate.app.domain.auth;

public interface PasswordResetMailer {
    void sendResetLink(String toEmail, String resetUrl);
}
