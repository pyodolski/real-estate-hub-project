package com.realestate.app.domain.auth.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Controller
public class PasswordResetViewController {

    @GetMapping("/reset-password")
    public void redirectToStatic(@RequestParam("token") String token,
                                 HttpServletResponse resp) throws IOException {
        String encoded = URLEncoder.encode(token, StandardCharsets.UTF_8);
        resp.sendRedirect("/reset-password.html?token=" + encoded);
    }
}
