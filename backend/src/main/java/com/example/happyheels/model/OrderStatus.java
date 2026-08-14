package com.example.happyheels.model;

public enum OrderStatus {
    PENDING,       // Order placed, waiting for slip verification
    CONFIRMED,     // Slip verified, payment confirmed
    PROCESSING,    // Order being prepared
    SHIPPED,       // Order shipped to customer
    DELIVERED,     // Order delivered
    CANCELLED      // Order cancelled
}
