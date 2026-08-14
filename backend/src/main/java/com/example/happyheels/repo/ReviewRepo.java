package com.example.happyheels.repo;

import com.example.happyheels.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepo extends JpaRepository<Review, Long> {
    List<Review> findByProductId(Long productId);
    List<Review> findByUserId(Long userId);
    List<Review> findAllByOrderByCreatedAtDesc();
    boolean existsByProductIdAndUserId(Long productId, Long userId);
}
