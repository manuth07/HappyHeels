package com.example.happyheels.controller;

import com.example.happyheels.DTO.OrderRequest;
import com.example.happyheels.DTO.OrderResponse;
import com.example.happyheels.model.OrderStatus;
import com.example.happyheels.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Create new order with bank slip
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<OrderResponse> createOrder(
            @RequestPart("order") String orderJson,
            @RequestPart(value = "bankSlip", required = false) MultipartFile bankSlip,
            Authentication authentication) throws IOException {

        System.out.println("Order creation request received");
        System.out.println("Authentication: " + (authentication != null ? authentication.getName() : "null"));
        System.out.println("Order JSON: " + orderJson);

        // Parse JSON to OrderRequest
        ObjectMapper objectMapper = new ObjectMapper();
        OrderRequest orderRequest = objectMapper.readValue(orderJson, OrderRequest.class);

        System.out.println("Parsed order request: " + orderRequest.getCustomerEmail());

        // Use email from order request if no authentication
        String userEmail = authentication != null ? authentication.getName() : orderRequest.getCustomerEmail();
        OrderResponse response = orderService.createOrder(orderRequest, userEmail, bankSlip);
        return ResponseEntity.ok(response);
    }

    // Get user's orders
    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponse>> getUserOrders(Authentication authentication) {
        String userEmail = authentication.getName();
        List<OrderResponse> orders = orderService.getUserOrders(userEmail);
        return ResponseEntity.ok(orders);
    }

    // Get single order by ID
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long orderId) {
        OrderResponse order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    // Get all orders (admin only)
    @GetMapping("/admin/all")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    // Get orders by status (admin only)
    @GetMapping("/admin/status/{status}")
    public ResponseEntity<List<OrderResponse>> getOrdersByStatus(@PathVariable OrderStatus status) {
        List<OrderResponse> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }

    // Update order status (admin only)
    @PutMapping("/admin/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {

        OrderResponse response = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(response);
    }

    // Get bank slip image
    @GetMapping("/{orderId}/bank-slip")
    public ResponseEntity<byte[]> getBankSlip(@PathVariable Long orderId) {
        OrderResponse orderResponse = orderService.getOrderById(orderId);
        byte[] bankSlipData = orderService.getBankSlip(orderId);

        HttpHeaders headers = new HttpHeaders();
        
        // Set content type based on file type
        if (orderResponse.getBankSlipFileName() != null) {
            String fileName = orderResponse.getBankSlipFileName().toLowerCase();
            if (fileName.endsWith(".png")) {
                headers.setContentType(MediaType.IMAGE_PNG);
            } else if (fileName.endsWith(".jpeg") || fileName.endsWith(".jpg")) {
                headers.setContentType(MediaType.IMAGE_JPEG);
            } else if (fileName.endsWith(".pdf")) {
                headers.setContentType(MediaType.APPLICATION_PDF);
            } else {
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            }
            headers.setContentDispositionFormData("inline", orderResponse.getBankSlipFileName());
        } else {
            headers.setContentType(MediaType.IMAGE_JPEG);
            headers.setContentDispositionFormData("inline", "bank-slip.jpg");
        }

        return new ResponseEntity<>(bankSlipData, headers, HttpStatus.OK);
    }

    // Get pending orders count (admin dashboard)
    @GetMapping("/admin/pending-count")
    public ResponseEntity<Long> getPendingOrdersCount() {
        Long count = orderService.getPendingOrdersCount();
        return ResponseEntity.ok(count);
    }
}