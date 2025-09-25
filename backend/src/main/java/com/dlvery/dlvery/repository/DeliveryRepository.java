package com.dlvery.dlvery.repository;

import com.dlvery.dlvery.entity.Delivery;
import com.dlvery.dlvery.entity.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    
    List<Delivery> findByDeliveryAgent(String deliveryAgent);
    
    List<Delivery> findByStatus(DeliveryStatus status);
    
    @Query("SELECT d FROM Delivery d WHERE d.createdAt BETWEEN :startDate AND :endDate")
    List<Delivery> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                 @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT d FROM Delivery d WHERE d.status = :status AND d.deliveryAgent = :agent")
    List<Delivery> findByStatusAndAgent(@Param("status") DeliveryStatus status, 
                                      @Param("agent") String agent);
    
     @Query("SELECT d FROM Delivery d JOIN d.items di WHERE di.product.sku = :sku")
     List<Delivery> findByProductSku(@Param("sku") String sku);
     
     @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Delivery d JOIN d.items di WHERE di.product.id = :productId")
     boolean existsByItemsProductId(@Param("productId") Long productId);
     
     @Query("SELECT d FROM Delivery d WHERE d.status = :status AND d.deliveredAt BETWEEN :startDate AND :endDate")
     List<Delivery> findByStatusAndDateRange(@Param("status") DeliveryStatus status,
                                           @Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate);

     @Query("SELECT DISTINCT d.deliveryAgent FROM Delivery d WHERE d.deliveryAgent IS NOT NULL ORDER BY d.deliveryAgent")
     List<String> findAllDeliveryAgents();
}