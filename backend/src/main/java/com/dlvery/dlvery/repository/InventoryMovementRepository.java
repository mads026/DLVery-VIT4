package com.dlvery.dlvery.repository;

import com.dlvery.dlvery.entity.InventoryMovement;
import com.dlvery.dlvery.entity.MovementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {
    
    List<InventoryMovement> findByProductId(Long productId);
    
    List<InventoryMovement> findByMovementType(MovementType movementType);
    
    @Query("SELECT im FROM InventoryMovement im WHERE im.movementDate BETWEEN :startDate AND :endDate")
    List<InventoryMovement> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT im FROM InventoryMovement im WHERE im.movementType = :type AND im.movementDate BETWEEN :startDate AND :endDate")
    List<InventoryMovement> findByTypeAndDateRange(@Param("type") MovementType type,
                                                 @Param("startDate") LocalDateTime startDate,
                                                 @Param("endDate") LocalDateTime endDate);
}