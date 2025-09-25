package com.dlvery.dlvery.repository;

import com.dlvery.dlvery.entity.Product;
import com.dlvery.dlvery.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    Optional<Product> findBySku(String sku);
    
    List<Product> findByCategory(ProductCategory category);
    
    List<Product> findByIsDamaged(Boolean isDamaged);
    
    List<Product> findByIsPerishable(Boolean isPerishable);
    
    @Query("SELECT p FROM Product p WHERE p.isPerishable = true AND p.expiryDate <= :date")
    List<Product> findExpiringProducts(@Param("date") LocalDate date);
    
    @Query("SELECT p FROM Product p WHERE p.quantity > 0")
    List<Product> findAvailableProducts();
    
    @Query("SELECT p FROM Product p WHERE p.quantity <= :threshold")
    List<Product> findLowStockProducts(@Param("threshold") Integer threshold);

    @Query("SELECT DISTINCT p.sku FROM Product p ORDER BY p.sku")
    List<String> findAllSkus();
}