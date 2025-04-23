package com.example.StoreManagement.Repositories;

import com.example.StoreManagement.Model.ProductVariant;
import com.example.StoreManagement.Model.Products;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;


public interface ProductVariantRepo extends MongoRepository<ProductVariant,String > {
    ProductVariant findByProductName(String productName);
    List<ProductVariant> findAllByProductName(String name);
   // ProductVariant findByProductNameAndSize(String productName);
    List<Products> findAllByOrderByPriceAsc();
    List<Products> findAllByOrderByPriceDesc();
}
