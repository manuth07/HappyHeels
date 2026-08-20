package com.example.happyheels.controller;

import com.example.happyheels.model.Product;
import com.example.happyheels.service.ProductService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(service.getAllProducts());
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = service.getProductById(id);
        if (product != null) {
            return ResponseEntity.ok(product);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/product")
    public ResponseEntity<?> addProduct(
            @RequestPart Product product,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile,
            Authentication authentication) {
        try {
            Product savedProduct = service.addProduct(product, imageFile);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error adding product: " + e.getMessage());
        }
    }

    @GetMapping("/product/{productId}/image")
    public ResponseEntity<Resource> getImageByProductId(@PathVariable Long productId) {
        Product product = service.getProductById(productId);
        Resource resource = service.getProductImageResource(productId);

        if (resource == null || !resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        MediaType mediaType = MediaType.IMAGE_JPEG;
        if (product.getImageType() != null && !product.getImageType().isEmpty()) {
            try {
                mediaType = MediaType.parseMediaType(product.getImageType());
            } catch (Exception ignored) {
            }
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(resource);
    }

    @PutMapping("/product/{id}")
    public ResponseEntity<String> updateProduct(
            @PathVariable Long id,
            @RequestPart Product product,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        try {
            Product updatedProduct = service.updateProduct(id, product, imageFile);
            if (updatedProduct != null) {
                return ResponseEntity.ok("updated");
            }
            return ResponseEntity.badRequest().body("Failed to update product");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating product: " + e.getMessage());
        }
    }

    @DeleteMapping("/product/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        Product product = service.getProductById(id);
        if (product != null) {
            service.deleteProduct(id);
            return ResponseEntity.ok("deleted");
        }
        return ResponseEntity.badRequest().body("Product not found");
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<Product>> searchProduct(@RequestParam String keyword) {
        List<Product> products = service.searchProducts(keyword);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/category/{category}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String category) {
        List<Product> products = service.getProductsByCategory(category);
        return ResponseEntity.ok(products);
    }
}
