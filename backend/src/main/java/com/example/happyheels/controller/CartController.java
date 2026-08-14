package com.example.happyheels.controller;

import com.example.happyheels.DTO.CartItemResponse;
import com.example.happyheels.DTO.CartMergeRequest;
import com.example.happyheels.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getCart(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(cartService.getCart(email));
    }

    @PostMapping("/add")
    public ResponseEntity<CartItemResponse> add(Authentication authentication,
                                                @RequestParam Long productId,
                                                @RequestParam int quantity) {
        String email = authentication.getName();
        return ResponseEntity.ok(cartService.addOrUpdateItem(email, productId, quantity));
    }

    @PutMapping("/set")
    public ResponseEntity<CartItemResponse> set(Authentication authentication,
                                                @RequestParam Long productId,
                                                @RequestParam int quantity) {
        String email = authentication.getName();
        return ResponseEntity.ok(cartService.setQuantity(email, productId, quantity));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<CartItemResponse> remove(Authentication authentication,
                                                   @RequestParam Long productId) {
        String email = authentication.getName();
        return ResponseEntity.ok(cartService.removeItem(email, productId));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clear(Authentication authentication) {
        String email = authentication.getName();
        cartService.clearCart(email);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/merge")
    public ResponseEntity<List<CartItemResponse>> merge(Authentication authentication,
                                                        @RequestBody CartMergeRequest request) {
        String email = authentication.getName();
        return ResponseEntity.ok(cartService.mergeGuestCart(email, request));
    }
}


