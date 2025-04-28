import React, { useState } from "react";
import "./AddVariant.css";
import { addProduct } from "./ServerRequests";

export default function AddVariantModal({ product, onClose, onAddVariant }) {
  const [size, setSize] = useState("");
  const [dimension, setDimension] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState("");

  const handleAddVariant = async () => {
    if (!dimension || !price || !stock) {
      setError("Please fill in all the required fields.");
      return;
    }

    const newProduct = {
      name: product.name,
      description: product.description,
      productId: product.id,
      imageUrl: product.imageUrl,
      productVariants: [
        {
          size,
          dimension,
          productName: product.name,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
          type: "mattresses",
        },
      ],
    };

    try {
      const response = await addProduct(newProduct);
      if (response) {
        alert("Product variant added successfully!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to add variant:", error);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Add Variant for "{product.name}"</h2>

        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label>Type of Wood:</label>
          <select value={dimension} onChange={(e) => setDimension(e.target.value)}>
            <option value="">-- Select Wood Type --</option>
            <option value="Teak">Teak</option>
            <option value="Oak">Oak</option>
            <option value="Pine">Pine</option>
            <option value="Walnut">Walnut</option>
          </select>
        </div>

        <div className="form-group">
          <label>Price ($):</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
          />
        </div>

        <div className="form-group">
          <label>Stock Quantity:</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Enter available stock"
          />
        </div>

        <div className="modal-actions">
          <button className="primary-btn" onClick={handleAddVariant}>Add Variant</button>
          <button className="secondary-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
