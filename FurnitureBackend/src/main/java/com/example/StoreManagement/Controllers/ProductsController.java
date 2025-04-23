package com.example.StoreManagement.Controllers;

import com.example.StoreManagement.Model.ProductVariant;
import com.example.StoreManagement.Model.Products;
import com.example.StoreManagement.Repositories.ProductVariantRepo;
import com.example.StoreManagement.Repositories.ProductsRepo;
import com.example.StoreManagement.Service.ProductsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductsController {
    @Autowired
    private ProductsService productsService;
    @Autowired
    private  ProductsRepo productsRepo;
    @Autowired
    private ProductVariantRepo productVariantRepo;

    @PostMapping("/add")
    public ResponseEntity<?> createProduct(@RequestBody Products products){
        System.out.println("entered add product");
        System.out.println(products);
        if(products.getName()==null){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("product name can't be  null");
        }

        if (productsService.isProductExists(products.getName())) {
            Products existingProduct = productsRepo.findByName(products.getName());

            // Append new variants to the existing variants list
            if (existingProduct.getProductVariants() != null) {
                existingProduct.getProductVariants().addAll(products.getProductVariants());
            } else {
                existingProduct.setProductVariants(products.getProductVariants());
            }
            Optional.ofNullable(existingProduct.getProductVariants())
                    .ifPresent(variants -> variants.forEach(productVariantRepo::save));

            return ResponseEntity.ok("Added new variants");
        }
        if(products.getDescription()==null){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("product description can't be  null");
        }
        if(products.getImageUrl()==null){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("product image required");
        }

        products.setRating(0);
        Optional.ofNullable(products.getProductVariants())
                .ifPresent(variants -> variants.forEach(productVariantRepo::save));
        productsRepo.save(products);
        return ResponseEntity.status(HttpStatus.CREATED).body("product added successfully");
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteProductByName(@PathVariable String id) {
        // Check if the product exists by name
        Products products=productsRepo.findById(id).orElse(null);
        if (products==null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Product with id " + id + " does not exist.");
        }

        // Perform the delete operation
        productsService.deleteProductByName(products.getName());
        return ResponseEntity.ok("Product with name " + products.getName() + " has been deleted successfully.");
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateProduct(
            @PathVariable String id,
            @RequestBody Products updateRequest) {
        System.out.println("Entered updateProduct");
        System.out.println("Update Request: " + updateRequest);

        // Check if the product exists
        Optional<Products> optionalProduct = productsService.getProductById(id);
        if (optionalProduct.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Product with ID " + id + " not found.");
        }
        // Update fields selectively
        Products product = optionalProduct.get();

        if (updateRequest.getName() != null && !updateRequest.getName().isEmpty()) {
            product.setName(updateRequest.getName());
        }
        if (updateRequest.getDescription() != null && !updateRequest.getDescription().isEmpty()) {
            product.setDescription(updateRequest.getDescription());
        }
        if (updateRequest.getImageUrl() != null && !updateRequest.getImageUrl().isEmpty()) {
            product.setImageUrl(updateRequest.getImageUrl());
        }
        System.out.println(product);
        // Save the updated product
        productsRepo.save(product);
        return ResponseEntity.ok("Product updated successfully.");
    }

    @GetMapping("/get")
    public ResponseEntity<?> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            Pageable pageable) {

        List<Products> productsList;

        // If category is provided, filter by category
        if (category != null && !category.isEmpty()) {
            productsList = productsRepo.findByCategory(category, pageable);
        }
        // If search is provided, filter by name (case insensitive)
        else if (search != null && !search.isEmpty()) {
            productsList = productsRepo.findByNameContainingIgnoreCase(search, pageable);
        }
        // Otherwise, fetch all products
        else {
            productsList = productsRepo.findAll(pageable).getContent();
        }

        // Sort the results based on the sortBy parameter
        if (sortBy != null) {
            switch (sortBy) {
                case "A-Z":
                    productsList.sort(Comparator.comparing(Products::getName));
                    break;
                case "Z-A":
                    productsList.sort(Comparator.comparing(Products::getName).reversed());
                    break;
                case "price: low to high":
                    productsList.sort(Comparator.comparing(p -> getLowestPrice(p.getProductVariants())));
                    break;
                case "price: high to low":
                    productsList.sort(Comparator.comparing((Products p) -> getLowestPrice(p.getProductVariants())).reversed());
                    break;
            }
        }

        // Fetch product variants
        productsList.forEach(p -> {
            List<ProductVariant> variants = productVariantRepo.findAllByProductName(p.getName());
            p.setProductVariants(variants);
        });

        return ResponseEntity.ok(productsList);
    }

    private double getLowestPrice(List<ProductVariant> variants) {
        return variants.stream()
                .mapToDouble(ProductVariant::getPrice)
                .min()
                .orElse(Double.MAX_VALUE);
    }



//    @GetMapping("/get")
//    private ResponseEntity<?> getProductsByCategory(@RequestParam String category){
//        List<Products> productsByCategory=productsRepo.findByCategory(category);
//        if(!productsByCategory.isEmpty())
//         return ResponseEntity.ok(productsByCategory);
//        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("no products available for the category"+category);
//    }

//    @GetMapping("/sorted-by-price")
//    public ResponseEntity<List<Products>> getProductsSortedByPrice(
//            @RequestParam(defaultValue = "asc") String sortOrder) {
//
//        List<Products> products;
//        if (sortOrder.equalsIgnoreCase("asc")) {
//            products = productsService.getProductsSortedByPriceAsc();
//        } else if (sortOrder.equalsIgnoreCase("desc")) {
//            products = productsService.getProductsSortedByPriceDesc();
//        } else {
//            return ResponseEntity.badRequest().body(Collections.emptyList());
//        }
//
//        return ResponseEntity.ok(products);
//    }

}
