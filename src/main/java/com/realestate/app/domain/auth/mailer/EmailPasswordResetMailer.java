package com.realestate.app.domain.auth.mailer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailPasswordResetMailer implements PasswordResetMailer {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")   // Gmail 로그인한 계정
    private String fromAddress;

    @Override
    public void sendResetLink(String toEmail, String resetUrl) {
        try {
            MimeMessage mime = mailSender.createMimeMessage();
            // UTF-8 인코딩, 멀티파트 false, HTML 본문 사용
            MimeMessageHelper helper = new MimeMessageHelper(mime, false, "UTF-8");

            // ✅ From은 반드시 인증 계정과 동일하게!
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("[RealEstateHub] 비밀번호 재설정 안내");

            String body = """
                    안녕하세요.<br/><br/>
                    아래 링크를 클릭해서 비밀번호를 재설정하세요:<br/>
                    <a href="%s">%s</a><br/><br/>
                    이 링크는 1시간 동안만 유효합니다.
                    """.formatted(resetUrl, resetUrl);

            helper.setText(body, true); // HTML 본문

            mailSender.send(mime);
            log.info("비밀번호 재설정 메일 전송 성공: {}", toEmail);

        } catch (MessagingException e) {
            log.error("메일 전송 실패", e);
            throw new RuntimeException("메일 발송 실패: " + e.getMessage());
        }
    }
}