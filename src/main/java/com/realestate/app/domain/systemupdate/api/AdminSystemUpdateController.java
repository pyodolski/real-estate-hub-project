package com.realestate.app.domain.systemupdate.api;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/system-updates")
@RequiredArgsConstructor
public class AdminSystemUpdateController {
    private final ApplicationEventPublisher events;

    public record CreateUpdateRequest(String title, String body) {}

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public void create(@RequestBody CreateUpdateRequest req) {
        events.publishEvent(new com.realestate.app.domain.systemupdate.event.SystemUpdateEvent(
                req.title(), req.body()
        ));
    }
}