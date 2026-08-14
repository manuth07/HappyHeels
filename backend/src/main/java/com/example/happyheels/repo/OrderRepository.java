package com.example.happyheels.repo;

import com.example.happyheels.model.Order;
import com.example.happyheels.model.OrderStatus;
import com.example.happyheels.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Find orders by user, ordered by date (newest first)
    List<Order> findByUserOrderByOrderDateDesc(User user);

    // Find orders by status, ordered by date (newest first)
    List<Order> findByStatusOrderByOrderDateDesc(OrderStatus status);

    // Find all orders ordered by date (newest first)
    List<Order> findAllByOrderByOrderDateDesc();

    // Count orders by status
    Long countByStatus(OrderStatus status);

    // Calculate total revenue for orders with specific status
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = :status")
    Double sumTotalAmountByStatus(@Param("status") OrderStatus status);

    // Alternative: Calculate total revenue for all delivered orders (more specific)
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'DELIVERED'")
    Double getTotalRevenueFromDeliveredOrders();

    // Find orders by user ID
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    // Count total orders (optional)
    // This is already available via JpaRepository's count() method

    // Find orders that have bank slips uploaded (for admin)
    List<Order> findByBankSlipFileNameIsNotNullOrderByOrderDateDesc();
}