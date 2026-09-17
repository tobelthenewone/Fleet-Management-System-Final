// src/main/java/com/zemenbank/fleetmanagement/scheduler/InsurancePolicyNotifier.java
package com.zemenbank.fleetmanagement.scheduler;

import com.zemenbank.fleetmanagement.model.Notification;
import com.zemenbank.fleetmanagement.model.InsurancePolicy;
import com.zemenbank.fleetmanagement.repository.InsurancePolicyRepository;
import com.zemenbank.fleetmanagement.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class InsurancePolicyNotifier {

    private final InsurancePolicyRepository insurancePolicyRepository;
    private final NotificationRepository notificationRepository;

    @Scheduled(cron = "0 0 0 */3 * ?")
    public void checkInsuranceExpirations() {
        LocalDate today = LocalDate.now();
        LocalDate in30Days = today.plusDays(30);
        List<InsurancePolicy> expiringSoon = insurancePolicyRepository.findByEndDateBetween(today, in30Days);
        List<InsurancePolicy> expired = insurancePolicyRepository.findByEndDateBefore(today);

        expiringSoon.forEach(policy -> {
            long daysUntilExpiry = java.time.temporal.ChronoUnit.DAYS.between(today, policy.getEndDate());
            String msg = String.format("⚠️ Policy %s is expiring in %d days (on %s)", 
                policy.getPolicyNumber(), 
                daysUntilExpiry,
                policy.getEndDate());
            saveNotification(msg);
        });

        expired.forEach(policy -> {
            String msg = "❌ Policy " + policy.getPolicyNumber() + " has expired on " + policy.getEndDate();
            saveNotification(msg);
        });
    }

    private void saveNotification(String message) {
        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setDate(LocalDate.now());
        notification.setRead(false);
        notificationRepository.save(notification);
    }
}
