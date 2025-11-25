package com.realestate.app.domain.auth.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandlerImpl;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.realestate.app.domain.auth.jwt.JwtAuthenticationFilter;

import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(reg -> reg
                        // 프리플라이트 허용
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 루트 & 정적 리소스 & 헬스체크 열기
                        .requestMatchers(
                                "/", "/index.html", "/favicon.ico",
                                "/static/**", "/assets/**", "/css/**", "/js/**", "/files/**", "/images/**", "/webjars/**", "/api/properties/search", "/api/search/**", "/api/naver-local/**"
                        ).permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/ws-stomp/**").permitAll()

                        // 모든 HTML 파일들 허용
                        .requestMatchers("/*.html").permitAll()
                        
                        // 인증 없이 접근해야 하는 공개 API
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // 브로커 목록은 공개 (누구나 조회 가능)
                        .requestMatchers(HttpMethod.GET, "/api/brokers/**").permitAll()

                        // 부동산 검색 / 조회 공개
                        .requestMatchers(HttpMethod.GET, "/api/properties/search").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/search/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/properties/**").permitAll()

                        // 자산 승인 시스템 API (인증 필요)
                        .requestMatchers("/api/ownership/**").authenticated()

                        // 알림 API (인증 필요)
                        .requestMatchers("/api/notifications/**").authenticated()

                        // 그 외는 인증 필요
                        .anyRequest().authenticated()
                )
                // 인증 안 됐을 때 401로 명확히
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                        .accessDeniedHandler(new AccessDeniedHandlerImpl()) // 권한 부족시 403
                )
                // JWT 필터는 UsernamePasswordAuthenticationFilter 앞에
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowCredentials(true);
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000", // 프론트 개발 서버
                "http://localhost:5173", // Vite 등
                "http://localhost:8080"  // 같은 포트에서 SPA 서빙 시
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    PasswordEncoder passwordEncoder() { 
        return new BCryptPasswordEncoder(); 
    }


    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring()
                // 공통 정적 리소스 위치 (css/js/images 등)
                .requestMatchers("/css/**", "/js/**", "/images/**", "/webjars/**", "/assets/**", "/favicon.ico")
                // (선택) 스프링이 제공하는 정적 리소스 위치 전부 무시
                .requestMatchers(PathRequest.toStaticResources().atCommonLocations());
    }
}
