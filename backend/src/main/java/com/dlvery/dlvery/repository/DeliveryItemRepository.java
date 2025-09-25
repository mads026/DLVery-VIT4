package com.dlvery.dlvery.repository;

import com.dlvery.dlvery.entity.DeliveryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeliveryItemRepository extends JpaRepository<DeliveryItem, Long> {
}