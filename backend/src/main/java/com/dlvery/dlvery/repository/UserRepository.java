package com.dlvery.dlvery.repository;

import com.dlvery.dlvery.entity.User;
import com.dlvery.dlvery.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByUsernameAndRole(String username, UserRole role);
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByOauthProviderId(String oauthProviderId);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    User findByVerificationToken(String verificationToken);
    
    // Custom query to find user by either username or email
    @Query("SELECT u FROM User u WHERE u.username = :identifier OR u.email = :identifier")
    Optional<User> findByUsernameOrEmail(@Param("identifier") String identifier);
}