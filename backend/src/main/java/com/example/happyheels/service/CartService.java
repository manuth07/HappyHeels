package com.example.happyheels.service;

import com.example.happyheels.DTO.CartItemResponse;
import com.example.happyheels.DTO.CartMergeRequest;
import com.example.happyheels.model.CartItem;
import com.example.happyheels.model.Product;
import com.example.happyheels.model.User;
import com.example.happyheels.repo.CartItemRepository;
import com.example.happyheels.repo.ProductRepo;
import com.example.happyheels.repo.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepo productRepo;

    public CartService(CartItemRepository cartItemRepository, UserRepository userRepository, ProductRepo productRepo) {
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepo = productRepo;
    }

    public List<CartItemResponse> getCart(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));
        return cartItemRepository.findByUserOrderByIdAsc(user)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CartItemResponse addOrUpdateItem(String userEmail, Long productId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepo.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartItem> existing = cartItemRepository.findByUserAndProduct(user, product);
        CartItem item = existing.orElseGet(() -> CartItem.builder()
                .user(user)
                .product(product)
                .quantity(0)
                .unitPrice(product.getPrice())
                .build());

        item.setQuantity(item.getQuantity() + quantity);
        item.setUnitPrice(product.getPrice());

        CartItem saved = cartItemRepository.save(item);
        return toResponse(saved);
    }

    public CartItemResponse setQuantity(String userEmail, Long productId, int quantity) {
        if (quantity <= 0) {
            return removeItem(userEmail, productId);
        }
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepo.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem item = cartItemRepository.findByUserAndProduct(user, product)
                .orElseGet(() -> CartItem.builder()
                        .user(user)
                        .product(product)
                        .quantity(0)
                        .unitPrice(product.getPrice())
                        .build());

        item.setQuantity(quantity);
        item.setUnitPrice(product.getPrice());
        CartItem saved = cartItemRepository.save(item);
        return toResponse(saved);
    }

    public CartItemResponse removeItem(String userEmail, Long productId) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepo.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartItem> existing = cartItemRepository.findByUserAndProduct(user, product);
        if (existing.isPresent()) {
            cartItemRepository.delete(existing.get());
        }
        return new CartItemResponse(null, product.getId(), product.getName(), product.getBrand(), product.getPrice(), 0, product.getStockQuantity());
    }

    public void clearCart(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));
        cartItemRepository.deleteByUser(user);
    }

    public List<CartItemResponse> mergeGuestCart(String userEmail, CartMergeRequest request) {
        if (request == null || request.getItems() == null) {
            return getCart(userEmail);
        }
        for (CartMergeRequest.GuestCartItem gi : request.getItems()) {
            if (gi.getQuantity() > 0) {
                addOrUpdateItem(userEmail, gi.getProductId(), gi.getQuantity());
            }
        }
        return getCart(userEmail);
    }

    private CartItemResponse toResponse(CartItem item) {
        Product p = item.getProduct();
        return new CartItemResponse(
                item.getId(),
                p.getId(),
                p.getName(),
                p.getBrand(),
                item.getUnitPrice(),
                item.getQuantity(),
                p.getStockQuantity()
        );
    }
}


