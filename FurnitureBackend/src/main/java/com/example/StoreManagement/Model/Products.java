package com.example.StoreManagement.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "Products")
@Data
public class Products {
    @Id
    private String id;
    private String name;
    private  String imageUrl;
    private String description;
    private String  category;
    private List<ProductVariant> productVariants;
    private double rating;
}
