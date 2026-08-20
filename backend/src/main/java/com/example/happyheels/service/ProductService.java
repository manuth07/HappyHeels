package com.example.happyheels.service;

import com.example.happyheels.model.Product;
import com.example.happyheels.repo.ProductRepo;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepo repo;
    private final FileStorageService fileStorageService;

    public ProductService(ProductRepo repo, FileStorageService fileStorageService) {
        this.repo = repo;
        this.fileStorageService = fileStorageService;
    }

    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    public Product getProductById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    public Product addProduct(Product product, MultipartFile imageFile) throws IOException {
        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = fileStorageService.storeFile(imageFile, "products");
            product.setImageName(imageFile.getOriginalFilename());
            product.setImageType(imageFile.getContentType());
            product.setImageUrl(imageUrl);
        }
        return repo.save(product);
    }

    public Product updateProduct(Long id, Product updatedProduct, MultipartFile imageFile) throws IOException {
        Product existingProduct = getProductById(id);

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setBrand(updatedProduct.getBrand());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setCategory(updatedProduct.getCategory());
        existingProduct.setDate(updatedProduct.getDate());
        existingProduct.setProductAvailable(updatedProduct.getProductAvailable());
        existingProduct.setStockQuantity(updatedProduct.getStockQuantity());

        if (imageFile != null && !imageFile.isEmpty()) {
            // Delete old file if present
            if (existingProduct.getImageUrl() != null) {
                fileStorageService.deleteFile(existingProduct.getImageUrl());
            }
            // Save new file
            String newImageUrl = fileStorageService.storeFile(imageFile, "products");
            existingProduct.setImageName(imageFile.getOriginalFilename());
            existingProduct.setImageType(imageFile.getContentType());
            existingProduct.setImageUrl(newImageUrl);
        }

        return repo.save(existingProduct);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        if (product.getImageUrl() != null) {
            fileStorageService.deleteFile(product.getImageUrl());
        }
        repo.deleteById(id);
    }

    public Resource getProductImageResource(Long id) {
        Product product = getProductById(id);
        if (product.getImageUrl() == null) {
            return null;
        }
        return fileStorageService.loadFileAsResource(product.getImageUrl());
    }

    public List<Product> searchProducts(String keyword) {
        return repo.searchProduct(keyword);
    }

    public List<Product> getProductsByCategory(String category) {
        return repo.findByCategoryIgnoreCase(category);
    }
}
