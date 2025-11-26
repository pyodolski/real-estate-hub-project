package com.realestate.app.domain.user.dto;

import com.realestate.app.domain.auth.dto.TagSelection;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record UpdateProfileRequest(
        String intro,
        String profileImageUrl,
        String phoneNumber,
        @NotBlank String currentPassword,
        List<TagSelection> tags
) {}
