package com.example.happyheels.controller;

import com.example.happyheels.DTO.ReviewRequest;
import com.example.happyheels.DTO.ReviewResponse;
import com.example.happyheels.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // Add a review (authenticated users only)
    @PostMapping
    public ResponseEntity<ReviewResponse> addReview(
            @RequestBody ReviewRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        ReviewResponse response = reviewService.addReview(request, userEmail);
        return ResponseEntity.ok(response);
    }

    // Get reviews for a specific product (public)
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getProductReviews(@PathVariable Long productId) {
        List<ReviewResponse> reviews = reviewService.getReviewsByProduct(productId);
        return ResponseEntity.ok(reviews);
    }

    // Get all reviews (admin only)
    @GetMapping("/admin/all")
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        List<ReviewResponse> reviews = reviewService.getAllReviews();
        return ResponseEntity.ok(reviews);
    }

    // Update a review (user can update their own review)
    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long reviewId,
            @RequestBody ReviewRequest request,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        ReviewResponse response = reviewService.updateReview(reviewId, request, userEmail);
        return ResponseEntity.ok(response);
    }

    // Delete a review (user can delete their own review)
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<String> deleteReview(
            @PathVariable Long reviewId,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        reviewService.deleteReviewByUser(reviewId, userEmail);
        return ResponseEntity.ok("Review deleted successfully");
    }

    // Delete a review (admin only)
    @DeleteMapping("/admin/{reviewId}")
    public ResponseEntity<String> deleteReviewByAdmin(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId, true);
        return ResponseEntity.ok("Review deleted successfully");
    }
}