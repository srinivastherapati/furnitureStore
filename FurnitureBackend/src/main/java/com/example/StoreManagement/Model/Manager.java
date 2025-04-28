package com.example.StoreManagement.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "Manager")
@Data
public class Manager {

    @Id
    private String id;
    private String firstName;
    private String email;
    private String password;
    private String phoneNumber;
    private String role;
    private boolean isApproved;
    private List<String> address;
}
