package com.example.StoreManagement.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "Product Variant")
@Data
public class ProductVariant {
    @Id
    private String id;
    private String size;
    private String type;
    private String dimension;
    private String productName;
    private double price;
    private int stock;
}
