package com.example.happyheels.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartMergeRequest {
    private List<GuestCartItem> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GuestCartItem {
        private Long productId;
        private int quantity;
    }
}


