// src/main/java/com/zemenbank/fleetmanagement/repository/NotificationRepository.java
package com.zemenbank.fleetmanagement.repository;

import com.zemenbank.fleetmanagement.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByReadFalse();

}
