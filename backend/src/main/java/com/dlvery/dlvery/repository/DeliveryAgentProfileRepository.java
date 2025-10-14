package com.dlvery.dlvery.repository;

import com.dlvery.dlvery.entity.DeliveryAgentProfile;
import com.dlvery.dlvery.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeliveryAgentProfileRepository extends JpaRepository<DeliveryAgentProfile, Long> {
    
    Optional<DeliveryAgentProfile> findByUser(User user);
    
    Optional<DeliveryAgentProfile> findByUserId(Long userId);
    
    @Query("SELECT p FROM DeliveryAgentProfile p WHERE p.user.username = :username")
    Optional<DeliveryAgentProfile> findByUsername(@Param("username") String username);
    
    boolean existsByUser(User user);
    
    boolean existsByUserId(Long userId);
}