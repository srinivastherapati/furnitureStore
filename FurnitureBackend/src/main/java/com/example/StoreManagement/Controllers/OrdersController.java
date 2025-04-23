package com.example.StoreManagement.Controllers;

import com.example.StoreManagement.Model.*;
import com.example.StoreManagement.Repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/orders")
@CrossOrigin
public class OrdersController {
    @Autowired
    private OrdersRepo ordersRepo;

    @Autowired
    private OrderItemRepo orderItemsRepo;
    @Autowired
    private PaymentsRepo paymentsRepo;
    @Autowired
    private ProductsRepo productsRepo;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private ProductVariantRepo productVariantRepo;

    // 1. Place an order (from cart items)
    @PostMapping("/place/{customerId}")
    public ResponseEntity<?> placeOrder(@PathVariable String customerId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> orderList = (Map<String, Object>) payload.get("order");
        List<Map<String, Object>> items = (List<Map<String, Object>>) orderList.get("items");

        if (items.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cart is empty");
        }

        double totalAmount = 0.0;
        List<String> orderItemList = new ArrayList<>(); // Temporary list to store order items
        List<String> outOfStockItems = new ArrayList<>(); // To notify items that couldn't be fully fulfilled

        String orderId = UUID.randomUUID().toString();

        for (Map<String, Object> itemData : items) {
            String productName = (String) itemData.get("name");
            int requestedQuantity = (int) itemData.get("quantity");
            String size= (String) itemData.get("size");

            Products product = productsRepo.findByName(productName);
            ProductVariant productVariant=productVariantRepo.findByProductName(productName);

            if (productVariant == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Product not found: " + productName);
            }
            List<ProductVariant> list=product.getProductVariants();

            int availableStock =productVariant.getStock();
            if (availableStock == 0) {
                outOfStockItems.add(productName + " (Out of Stock) for" +productVariant.getSize() );
                continue;
            }

            int fulfilledQuantity = Math.min(requestedQuantity, availableStock);

            totalAmount += productVariant.getPrice() * fulfilledQuantity;

            // Update stock and save product
            productVariant.setStock(availableStock - fulfilledQuantity);
            productVariantRepo.save(productVariant);

            // Create and save order item
            OrderItems orderItem = new OrderItems();
            orderItem.setOrderId(orderId);
            orderItem.setProductId(product.getId());
            orderItem.setProductName(product.getName());
            orderItem.setQuantity(fulfilledQuantity);
            orderItem.setSize(productVariant.getSize());
            orderItem.setPriceAtOrder(productVariant.getPrice());
            orderItemsRepo.save(orderItem);

            orderItemList.add(orderItem.getId());

            // Handle partially fulfilled items
            if (fulfilledQuantity < requestedQuantity) {
                outOfStockItems.add(productName + " (Only " + fulfilledQuantity + " fulfilled, " + (requestedQuantity - fulfilledQuantity) + " out of stock)");
            }
        }

        if (orderItemList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No items could be fulfilled due to stock unavailability.");
        }

        // Save the order
        Orders order = new Orders();
        order.setId(orderId);
        order.setCustomerId(customerId);
        order.setOrderDate(new Date());
        order.setStatus("PLACED");
        order.setTotalAmount(totalAmount);
        order.setOrderItemIds(orderItemList); // Embed the order items
        ordersRepo.save(order);

        // Save the payment
        Payments payment = new Payments();
        payment.setUserId(customerId);
        payment.setOrderId(orderId);
        payment.setPaymentMethod("CARD");
        payment.setStatus("COMPLETED");
        payment.setTotalAmount(totalAmount);
        paymentsRepo.save(payment);

        StringBuilder responseMessage = new StringBuilder("Order placed successfully with ID: " + orderId);
        if (!outOfStockItems.isEmpty()) {
            responseMessage.append("\nNote: Some items were partially or not fulfilled:\n");
            for (String message : outOfStockItems) {
                responseMessage.append("- ").append(message).append("\n");
            }
        }
Queue<Integer> q= new LinkedList<>();
        return ResponseEntity.ok(responseMessage.toString());
    }



    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getCustomerOrders(@PathVariable String customerId) {
        List<Orders> orders = ordersRepo.findByCustomerId(customerId);
        if (orders.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.EMPTY_LIST);
        }

        // Fetch order details with associated products
        List<Map<String, Object>> response = orders.stream().map(order -> {
            Map<String, Object> orderDetails = new HashMap<>();
            orderDetails.put("orderId", order.getId());
            orderDetails.put("totalPayment", order.getTotalAmount());
            orderDetails.put("orderDate",order.getOrderDate());
            orderDetails.put("status",order.getStatus());

            // Fetch products from OrderItems
            List<OrderItems> items = orderItemsRepo.findByOrderId(order.getId());
            List<Map<String, Object>> products = items.stream().map(item -> {
                Map<String, Object> productDetails = new HashMap<>();
                Products product = productsRepo.findById(item.getProductId()).orElse(null);
                if (product != null) {
                    productDetails.put("productId", product.getId());
                    productDetails.put("name", product.getName());
                }
                productDetails.put("quantityBought", item.getQuantity());
                return productDetails;
            }).collect(Collectors.toList());

            orderDetails.put("products", products);
            return orderDetails;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }


    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderDetails(@PathVariable String orderId) {
        Orders order = ordersRepo.findById(orderId).orElse(null);
        if (order == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found");
        }

        // Fetch items in the order
        List<OrderItems> items = orderItemsRepo.findByOrderId(orderId);
        return ResponseEntity.ok(items);
    }
    @GetMapping("/get")
    public ResponseEntity<?> getTotalOrderDetails() {
        List<Orders> ordersList = ordersRepo.findAll();
        if (ordersList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found");
        }

        List<Map<String, Object>> response = ordersList.stream().map(order -> {
            Map<String, Object> orderDetails = new HashMap<>();
            orderDetails.put("orderId", order.getId());
            orderDetails.put("totalPayment", order.getTotalAmount());
            orderDetails.put("orderDate",order.getOrderDate());
            orderDetails.put("status",order.getStatus());
            Customer customer=customerRepository.findById(order.getCustomerId()).orElse(null);
            orderDetails.put("customerName",customer.getFirstName());
            orderDetails.put("customerEmail",customer.getEmail());
            // Fetch products from OrderItems
            List<OrderItems> items = orderItemsRepo.findByOrderId(order.getId());
            List<Map<String, Object>> products = items.stream().map(item -> {
                Map<String, Object> productDetails = new HashMap<>();
                Products product = productsRepo.findById(item.getProductId()).orElse(null);
                if (product != null) {
                    productDetails.put("productId", product.getId());
                    productDetails.put("name", product.getName());
                }
                productDetails.put("quantityBought", item.getQuantity());
                return productDetails;
            }).collect(Collectors.toList());

            orderDetails.put("products", products);
            return orderDetails;
        }).toList();
        return ResponseEntity.ok(response);
    }
    @PostMapping("/cancel-order/{orderId}")
    public ResponseEntity<?> cancelOrder(@PathVariable String orderId) {
        // Retrieve the payment for the given order
        Optional<Payments> paymentOptional = paymentsRepo.findByOrderId(orderId);
        if (paymentOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Payment not found for this order");
        }
        Payments payment = paymentOptional.get();

        // Update the payment status
        payment.setStatus("REFUNDED");
        paymentsRepo.save(payment);

        // Process refund if payment method is card
        if ("CARD".equalsIgnoreCase(payment.getPaymentMethod())) {
            // Here you can implement refund logic with a payment gateway (e.g., Stripe, PayPal)
            // For now, we'll just simulate a successful refund.
            System.out.println("Refund of amount " + payment.getTotalAmount() + " processed successfully");
        }

        Optional<Orders> orderOptional = ordersRepo.findById(orderId);
        if (orderOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found");
        }
        Orders order = orderOptional.get();
        order.setStatus("CANCELLED");
        ordersRepo.save(order);

        // Update product quantities for items in the cancelled order
        List<OrderItems> orderItems = orderItemsRepo.findByOrderId(orderId);
        for (OrderItems item : orderItems) {
            Optional<Products> productOptional = productsRepo.findById(item.getProductId());
            if (productOptional.isPresent()) {
                ProductVariant productVariant = productVariantRepo.findByProductName(productOptional.get().getName());
                productVariant.setStock(productVariant.getStock() + item.getQuantity());
                productVariantRepo.save(productVariant);
            }
        }

        return ResponseEntity.ok("Order cancelled and refund processed successfully");
    }

    @PutMapping("/update-status/{orderId}/{status}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderId, @PathVariable String status) {
        Orders order = ordersRepo.findById(orderId).orElse(null);
        if (order == null || order.getStatus().equals("CANCELLED")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found");
        }
        order.setStatus(status);
        ordersRepo.save(order);
        return ResponseEntity.ok("Order status updated to " + status);
    }

}
