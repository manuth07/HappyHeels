package com.example.happyheels.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private String productName;
    private int quantity;
    private BigDecimal price;
    private BigDecimal subtotal;
}




