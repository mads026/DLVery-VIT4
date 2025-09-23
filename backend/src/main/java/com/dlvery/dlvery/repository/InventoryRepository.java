package com.dlvery.dlvery.repository;

import com.dlvery.dlvery.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findBySku(String sku);

    boolean existsBySku(String sku);

    List<Inventory> findByIsDamagedTrue();
}