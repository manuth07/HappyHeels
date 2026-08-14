package com.example.happyheels.service;

import com.example.happyheels.DTO.ReviewRequest;
import com.example.happyheels.DTO.ReviewResponse;
import com.example.happyheels.model.Product;
import com.example.happyheels.model.Review;
import com.example.happyheels.model.User;
import com.example.happyheels.repo.ProductRepo;
import com.example.happyheels.repo.ReviewRepo;
import com.example.happyheels.repo.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {
    private final ReviewRepo reviewRepository;
    private final ProductRepo productRepo;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepo reviewRepository, ProductRepo productRepo, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepo = productRepo;
        this.userRepository = userRepository;
    }

    public ReviewResponse addReview(ReviewRequest request, String userEmail) {
        // Validate rating
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        // Check if user already reviewed this product
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (reviewRepository.existsByProductIdAndUserId(request.getProductId(), user.getId())) {
            throw new RuntimeException("You have already reviewed this product");
        }

        Product product = productRepo.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Review review = Review.builder()
                .comment(request.getComment())
                .rating(request.getRating())
                .product(product)
                .user(user)
                .build();

        Review savedReview = reviewRepository.save(review);
        return convertToResponse(savedReview);
    }

    public List<ReviewResponse> getReviewsByProduct(Long productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        return reviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getAllReviews() {
        List<Review> reviews = reviewRepository.findAllByOrderByCreatedAtDesc();
        return reviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public ReviewResponse updateReview(Long reviewId, ReviewRequest request, String userEmail) {
        // Validate rating
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user owns this review
        if (!review.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only update your own reviews");
        }

        // Update review
        review.setComment(request.getComment());
        review.setRating(request.getRating());

        Review updatedReview = reviewRepository.save(review);
        return convertToResponse(updatedReview);
    }

    public void deleteReviewByUser(Long reviewId, String userEmail) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user owns this review
        if (!review.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own reviews");
        }

        reviewRepository.delete(review);
    }

    public void deleteReview(Long reviewId, boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        // Only admin can delete any review, users can only delete their own
        // We'll handle this in controller with role check
        reviewRepository.delete(review);
    }

    private ReviewResponse convertToResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getComment(),
                review.getRating(),
                review.getUser().getName(),
                review.getUser().getEmail(),
                review.getCreatedAt(),
                review.getProduct().getId(),
                review.getProduct().getName()
        );
    }
}