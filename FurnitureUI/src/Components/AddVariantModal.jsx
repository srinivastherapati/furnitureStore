import React, { useState } from "react";
import { addProduct, updateProduct } from "./ServerRequests";

export default function AddVariantModal({ product, onClose, onAddVariant }) {
  const [size, setSize] = useState("");
  const [dimension, setDimension] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const productName=product.name;

  const handleAddVariant = async () => {
    if (!dimension || !price || !stock) {
      alert("Please fill in all fields!");
      return;
    }

    // Call the API with the variant details
    const np = {
      name: product.name,
      description: product.description,
      productId: product.id,
      imageUrl : product.imageUrl,
      productVariants: [
        {
          size,
          dimension,
          productName,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
          type: "matresses",
        },
      ],
    };

    try {
      const response = await addProduct(np);
      if (response) {
        alert("Added Product Successfully!");
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Variant for {product.name}</h2>
      
        <label>
          Dimension:
          <select
            value={dimension}
            onChange={(e) => setDimension(e.target.value)}
          >
            <option value="">Select Type Of Wood </option>
            <option value="Teak">Teak</option>
            <option value="Oak">Oak</option>
            <option value="Pine">Pine</option>
            <option value="Walnut">Walnut</option>
          </select>
        </label>
        <label>
          Price:
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
          />
        </label>
        <label>
          Stock:
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Enter stock quantity"
          />
        </label>
        <div className="modal-actions">
          <button onClick={handleAddVariant}>Add Variant</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
