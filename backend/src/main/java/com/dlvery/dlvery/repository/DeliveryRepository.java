package com.dlvery.dlvery.repository;

import com.dlvery.dlvery.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    Optional<Delivery> findByOrderId(String orderId);

    List<Delivery> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<Delivery> findByStatus(String status);
}