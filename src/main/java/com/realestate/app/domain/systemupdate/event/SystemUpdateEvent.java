package com.realestate.app.domain.systemupdate.event;

public record SystemUpdateEvent(
        String title, String body
        // 필요시 대상 세그먼트 id 리스트/조건 추가 가능
) {}