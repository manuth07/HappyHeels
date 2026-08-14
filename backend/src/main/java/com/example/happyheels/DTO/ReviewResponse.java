package com.example.happyheels.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private String comment;
    private int rating;
    private String userName;
    private String userEmail;
    private LocalDateTime createdAt;
    private Long productId;
    private String productName;
}
