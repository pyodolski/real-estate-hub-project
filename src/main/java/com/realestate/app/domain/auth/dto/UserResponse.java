package com.realestate.app.domain.auth.dto;
import java.util.List;

public record UserResponse(
        Long id, String email, String username, String role,
        String phoneNumber, String intro, String profileImageUrl,
        List<SimpleTag> tags
) {
    public record SimpleTag(String groupCode, String keyCode, String label) {}
}