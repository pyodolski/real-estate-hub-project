package com.realestate.app.domain.auth.security;

import lombok.*;
import org.springframework.security.core.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
@AllArgsConstructor
public class AuthUser implements UserDetails {
    private final Long id;
    private final String email;
    private final String role; // regular|broker|admin

    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
    }
    @Override public String getPassword() { return ""; }
    @Override public String getUsername() { return email; }
    @Override public boolean isAccountNonExpired()   { return true; }
    @Override public boolean isAccountNonLocked()    { return true; }
    @Override public boolean isCredentialsNonExpired(){ return true; }
    @Override public boolean isEnabled()             { return true; }
}
