package com.realestate.app.domain.property.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PropertyImageResponse {
    private Long id;
    private String imageUrl;
}
