// src/main/java/com/zemenbank/fleetmanagement/controller/NotificationController.java
package com.zemenbank.fleetmanagement.controller;

import com.zemenbank.fleetmanagement.model.Notification;
import com.zemenbank.fleetmanagement.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    @GetMapping("/unread")
    public List<Notification> getUnreadNotifications() {
        return notificationRepository.findByReadFalse();
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationRepository.findById(id).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }
}
