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

    long countByStatus(DeliveryStatus status);
    
    @Query("SELECT d FROM Delivery d WHERE d.createdAt BETWEEN :startDate AND :endDate")
    List<Delivery> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                 @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT d FROM Delivery d WHERE d.status = :status AND d.deliveryAgent = :agent")
    List<Delivery> findByStatusAndAgent(@Param("status") DeliveryStatus status, 
                                      @Param("agent") String agent);
    
     @Query("SELECT DISTINCT d FROM Delivery d JOIN FETCH d.items di JOIN FETCH di.product WHERE di.product.sku = :sku")
     List<Delivery> findByProductSku(@Param("sku") String sku);
     
     @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Delivery d JOIN d.items di WHERE di.product.id = :productId")
     boolean existsByItemsProductId(@Param("productId") Long productId);
     
     @Query("SELECT d FROM Delivery d WHERE d.status = :status AND d.deliveredAt BETWEEN :startDate AND :endDate")
     List<Delivery> findByStatusAndDateRange(@Param("status") DeliveryStatus status,
                                           @Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate);

     @Query("SELECT DISTINCT d.deliveryAgent FROM Delivery d WHERE d.deliveryAgent IS NOT NULL ORDER BY d.deliveryAgent")
     List<String> findAllDeliveryAgents();
     
     // Delivery Agent specific queries
     @Query("SELECT d FROM Delivery d LEFT JOIN FETCH d.items WHERE d.deliveryAgent = :agent AND d.scheduledDate = CURRENT_DATE ORDER BY d.priority ASC")
     List<Delivery> findTodaysDeliveriesByAgent(@Param("agent") String agent);

     @Query("SELECT d FROM Delivery d LEFT JOIN FETCH d.items WHERE d.deliveryAgent = :agent AND d.status IN ('PENDING', 'ASSIGNED', 'IN_TRANSIT') AND d.scheduledDate <= CURRENT_DATE ORDER BY d.priority ASC, d.scheduledDate ASC")
     List<Delivery> findPendingDeliveriesByAgent(@Param("agent") String agent);
     
     // Alternative queries for matching by user full name or email
     @Query("SELECT d FROM Delivery d WHERE (d.deliveryAgent = :agentName OR d.deliveryAgent = :agentEmail) AND d.scheduledDate = CURRENT_DATE ORDER BY d.priority ASC")
     List<Delivery> findTodaysDeliveriesByAgentNameOrEmail(@Param("agentName") String agentName, @Param("agentEmail") String agentEmail);
     
     @Query("SELECT d FROM Delivery d WHERE (d.deliveryAgent = :agentName OR d.deliveryAgent = :agentEmail) AND d.status IN ('PENDING', 'ASSIGNED', 'IN_TRANSIT') AND d.scheduledDate <= CURRENT_DATE ORDER BY d.priority ASC, d.scheduledDate ASC")
     List<Delivery> findPendingDeliveriesByAgentNameOrEmail(@Param("agentName") String agentName, @Param("agentEmail") String agentEmail);
     
     @Query("SELECT d FROM Delivery d LEFT JOIN FETCH d.items WHERE d.deliveryAgent = :agent AND d.status = 'DELIVERED' ORDER BY d.deliveredAt DESC")
     List<Delivery> findDeliveredDeliveriesByAgent(@Param("agent") String agent);
}