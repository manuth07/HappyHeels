package com.example.happyheels.controller;

import com.example.happyheels.model.OrderStatus;
import com.example.happyheels.repo.OrderRepository;
import com.example.happyheels.repo.ProductRepo;
import com.example.happyheels.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired
    private ProductRepo productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        try {
            // Total products count
            long totalProducts = productRepository.count();
            stats.put("totalProducts", totalProducts);

            // Total users count
            long totalUsers = userRepository.count();
            stats.put("totalUsers", totalUsers);

            // Pending orders count
            Long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
            stats.put("pendingOrders", pendingOrders != null ? pendingOrders : 0);

            // Total revenue from delivered orders
            Double totalRevenue = orderRepository.sumTotalAmountByStatus(OrderStatus.DELIVERED);
            stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);

        } catch (Exception e) {
            // Fallback values if there's an error
            stats.put("totalProducts", 0);
            stats.put("totalUsers", 0);
            stats.put("pendingOrders", 0);
            stats.put("totalRevenue", 0.0);
        }

        return ResponseEntity.ok(stats);
    }

    // Additional endpoint for more detailed stats
    @GetMapping("/detailed")
    public ResponseEntity<Map<String, Object>> getDetailedStats() {
        Map<String, Object> detailedStats = new HashMap<>();

        // Count orders by each status
        for (OrderStatus status : OrderStatus.values()) {
            Long count = orderRepository.countByStatus(status);
            detailedStats.put(status.name().toLowerCase() + "Orders", count != null ? count : 0);
        }

        // Total revenue from different statuses
        Double pendingRevenue = orderRepository.sumTotalAmountByStatus(OrderStatus.PENDING);
        Double deliveredRevenue = orderRepository.sumTotalAmountByStatus(OrderStatus.DELIVERED);
        Double confirmedRevenue = orderRepository.sumTotalAmountByStatus(OrderStatus.CONFIRMED);

        detailedStats.put("pendingRevenue", pendingRevenue != null ? pendingRevenue : 0.0);
        detailedStats.put("deliveredRevenue", deliveredRevenue != null ? deliveredRevenue : 0.0);
        detailedStats.put("confirmedRevenue", confirmedRevenue != null ? confirmedRevenue : 0.0);

        return ResponseEntity.ok(detailedStats);
    }
}