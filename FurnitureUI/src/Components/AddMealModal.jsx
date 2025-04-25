import React, { useState } from "react";
import {
  Modal,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Button,
  Typography,
  MenuItem,
} from "@mui/material";
import { addProduct, updateProduct } from "./ServerRequests";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function AddProductModal({ open, onClose, currentProduct, isAdd }) {
    const [category,setCategory] = useState("");
  const [name, setName] = useState(currentProduct?.name || "");
  const [imageUrl, setImageUrl] = useState(currentProduct?.imageUrl || "");
  const [description, setDescription] = useState(
    currentProduct?.description || ""
  );
  const [productVariants, setVariants] = useState({
    size: currentProduct?.productVariants?.size || "",
    dimensions: currentProduct?.productVariants?.dimensions || "",
    type: currentProduct?.productVariants?.type || "",
    price:currentProduct?.productVariants?.price || 0,
    stock:currentProduct?.productVariants?.stock || 1,
  });

  const handleVariantChange = (key, value) => {
    setVariants((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const variantsArray = [
      {
        size: productVariants.size,
        type: productVariants.type,
        dimension: productVariants.dimensions, 
        price:productVariants.price,
        stock:productVariants.stock
      },
    ];
    const productData = {
      name,
      imageUrl,
      category,
      description,
      productVariants: variantsArray,
    };

    try {
      if (!isAdd) {
        const response = await updateProduct(currentProduct.id, productData);
        if (response) {
          alert("Updated Product Successfully!");
          window.location.reload();
        }
      } else {
        const response = await addProduct(productData);
        if (response) {
          alert("Added Product Successfully!");
          window.location.reload();
        }
      }
      onClose();
    } catch (err) {
      alert("Failed to submit product: " + err.message);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="add-product-modal-title"
      aria-describedby="add-product-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography id="add-product-modal-title" variant="h6" component="h2">
          {!isAdd ? "Edit Product" : "Add New Product"}
        </Typography>
        <form>
  <TextField
    label="Name"
    fullWidth
    margin="normal"
    value={name}
    onChange={(e) => setName(e.target.value)}
    required
  />
  <TextField
    label="Image URL"
    fullWidth
    margin="normal"
    value={imageUrl}
    onChange={(e) => setImageUrl(e.target.value)}
    required
  />
  <TextField
    label="Description"
    fullWidth
    margin="normal"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    required
  />

  {/* Structured Category Dropdown */}
  <FormControl fullWidth margin="normal">
    <InputLabel>Category</InputLabel>
    <Select
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      displayEmpty
      required
    >
      <MenuItem value="Chairs">Chairs</MenuItem>
      <MenuItem value="Beds">Beds</MenuItem>
      <MenuItem value="Dining">Dining</MenuItem>
      <MenuItem value="Cupboards">Cupboards</MenuItem>
      <MenuItem value="Sofas">Sofas</MenuItem>
      <MenuItem value="Tables">Tables</MenuItem>
      <MenuItem value="Cabinets">Cabinets</MenuItem>
    </Select>
  </FormControl>

  <Button
    variant="contained"
    color="primary"
    sx={{ marginTop: "20px" }}
    onClick={handleSubmit}
  >
    {!isAdd ? "Update Product" : "Add Product"}
  </Button>
</form>

      </Box>
    </Modal>
  );
}
