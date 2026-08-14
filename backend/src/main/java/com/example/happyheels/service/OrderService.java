package com.example.happyheels.service;

import com.example.happyheels.DTO.OrderRequest;
import com.example.happyheels.DTO.OrderResponse;
import com.example.happyheels.DTO.OrderItemRequest;
import com.example.happyheels.DTO.OrderItemResponse;
import com.example.happyheels.model.*;
import com.example.happyheels.repo.OrderRepository;
import com.example.happyheels.repo.ProductRepo;
import com.example.happyheels.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepo productRepo;

    public OrderService(OrderRepository orderRepository, UserRepository userRepository, ProductRepo productRepo) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepo = productRepo;
    }

    public OrderResponse createOrder(OrderRequest request, String userEmail, MultipartFile bankSlip) throws IOException {
        // Try to find user, but don't require it for order creation
        User user = userRepository.findByEmail(userEmail).orElse(null);

        // Calculate total amount
        BigDecimal totalAmount = request.getOrderItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Create order
        Order order = Order.builder()
                .user(user) // Can be null for guest orders
                .shippingAddress(request.getShippingAddress())
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .customerEmail(request.getCustomerEmail())
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING)
                .build();

        // Handle bank slip upload
        if (bankSlip != null && !bankSlip.isEmpty()) {
            order.setBankSlipFileName(bankSlip.getOriginalFilename());
            order.setBankSlipFileType(bankSlip.getContentType());
            order.setBankSlipData(bankSlip.getBytes());
        }

        // Create order items
        List<OrderItem> orderItems = request.getOrderItems().stream()
                .map(itemRequest -> {
                    Product product = productRepo.findById(itemRequest.getProductId())
                            .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));

                    return OrderItem.builder()
                            .order(order)
                            .product(product)
                            .quantity(itemRequest.getQuantity())
                            .price(itemRequest.getPrice())
                            .productName(itemRequest.getProductName())
                            .build();
                })
                .collect(Collectors.toList());

        order.setOrderItems(orderItems);
        Order savedOrder = orderRepository.save(order);

        return convertToResponse(savedOrder);
    }

    public List<OrderResponse> getUserOrders(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Order> orders = orderRepository.findByUserOrderByOrderDateDesc(user);
        return orders.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByOrderDateDesc();
        return orders.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        List<Order> orders = orderRepository.findByStatusOrderByOrderDateDesc(status);
        return orders.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);

        return convertToResponse(updatedOrder);
    }

    public byte[] getBankSlip(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getBankSlipData() == null) {
            throw new RuntimeException("No bank slip found for this order");
        }

        return order.getBankSlipData();
    }

    private OrderResponse convertToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getProductName(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
                ))
                .collect(Collectors.toList());

        return new OrderResponse(
                order.getId(),
                order.getCustomerName(),
                order.getCustomerEmail(),
                order.getCustomerPhone(),
                order.getShippingAddress(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getOrderDate(),
                order.getUpdatedAt(),
                order.getBankSlipData() != null,
                order.getBankSlipFileName(),
                order.getBankSlipFileType(),
                itemResponses
        );
    }

    public Long getPendingOrdersCount() {
        return orderRepository.countByStatus(OrderStatus.PENDING);
    }

    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return convertToResponse(order);
    }
}