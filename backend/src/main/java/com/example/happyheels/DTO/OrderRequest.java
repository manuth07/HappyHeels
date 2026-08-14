package com.example.happyheels.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    private String shippingAddress;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private List<OrderItemRequest> orderItems;

    // Bank slip will be handled as multipart file
}

