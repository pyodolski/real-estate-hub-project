package com.realestate.app.domain.naver;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "naver.openapi")
public class NaverOpenApiProps {
    private String clientId;
    private String clientSecret;

    public String getClientId() { return clientId; }
    public void   setClientId(String clientId) { this.clientId = clientId; }
    public String getClientSecret() { return clientSecret; }
    public void   setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }
}
