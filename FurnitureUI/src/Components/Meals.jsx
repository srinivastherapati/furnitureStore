import React, { useState,useEffect } from "react";
import useHttp from "../hooks/useHttp.jsx";
import ErrorPage from "./ErrorPage.jsx";
import MealItem from "./MealItem.jsx";
import AddMealModal from "./AddMealModal.jsx";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Drawer,
  IconButton,
  Grid,
  Typography,
} from "@mui/material";
import { FilterList, Close, Add } from "@mui/icons-material";
import { API_BASE_URL } from "./ServerRequests.jsx";

const requestConfig = {};

export default function Meals({ role, isLoggedIn, setCurrentPage }) {
  const [isAdd, setIsAdd] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [openFilters, setOpenFilters] = useState(false);

  const { response: loadProducts, isLoading, error } = useHttp(`${API_BASE_URL}/products/get`, requestConfig, []);

const fetchProducts = async () => {
  const queryParams = new URLSearchParams();
  if (searchQuery) queryParams.append("search", searchQuery);
  if (sortOption) queryParams.append("sortBy", sortOption);
  if (selectedCategories.length) queryParams.append("category", selectedCategories.join(","));

  const response = await fetch(`${API_BASE_URL}/products/get?${queryParams.toString()}`);
  const data = await response.json();
  setFilteredProducts(data);
};

useEffect(() => {
  fetchProducts();
}, [searchQuery, sortOption, selectedCategories]);

  const products = loadProducts || [];

  const categories = ["Chairs", "Beds", "Dining", "Cupboards", "Sofas", "Tables", "Cabinets"];
  const types = ["Teak", "Oak", "Pine", "Walnut", "Mahogany"];

  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchProducts();
  };
  
  const handleSort = (option) => {
    setSortOption(option);
    fetchProducts();
  };
  
  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
    fetchProducts();
  };
  

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleAddProduct = () => {
    setCurrentProduct({ name: "", imageUrl: "", description: "", category: "", woodType: "", price: 1, stock: 1 });
    setIsAdd(true);
    setShowAddModal(true);
  };

  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setIsAdd(false);
    setShowAddModal(true);
  };
  const displayedProducts = filteredProducts.length ? filteredProducts : products;


  if (isLoading) return <p className="center">Fetching Items....</p>;
  if (error) return <ErrorPage title="Failed to Fetch Items" message={error.message} />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", padding: "20px" }}>
      {/* Search & Filter Toggle Button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
        <IconButton onClick={() => setOpenFilters(true)}>
          <FilterList />
        </IconButton>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          fullWidth
          sx={{ maxWidth: 400 }}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </Box>

      {/* Filters Drawer */}
      <Drawer anchor="left" open={openFilters} onClose={() => setOpenFilters(false)}>
  <Box sx={{ width: 250, padding: 2 }}>
    <IconButton onClick={() => setOpenFilters(false)} sx={{ float: "right" }}>
      <Close />
    </IconButton>
    <Typography variant="h6">Filters</Typography>

    {/* Sorting */}
    <Typography variant="subtitle1">Sort By</Typography>
    <Select value={sortOption} onChange={(e) => handleSort(e.target.value)} fullWidth>
      <MenuItem value="A-Z">A-Z</MenuItem>
      <MenuItem value="Z-A">Z-A</MenuItem>
      <MenuItem value="price: low to high">Price: Low to High</MenuItem>
      <MenuItem value="price: high to low">Price: High to Low</MenuItem>
    </Select>

    {/* Category Filter */}
    <Typography variant="subtitle1">Category</Typography>
    <FormGroup>
      {categories.map((category) => (
        <FormControlLabel
          key={category}
          control={<Checkbox checked={selectedCategories.includes(category)} onChange={() => toggleCategory(category)} />}
          label={category}
        />
      ))}
    </FormGroup>
  </Box>
</Drawer>


      {/* Add Product Button */}
      {role==="admin" && (
        <Button
          variant="contained"
          sx={{ position: "fixed", bottom: 20, right: 20 }}
          onClick={handleAddProduct}
        >
          <Add /> Add New Item
        </Button>
      )}

      {/* Product Grid */}
      <Grid container spacing={2}>
        {displayedProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <MealItem setCurrentPage={setCurrentPage} isLoggedIn={isLoggedIn} role={role} product={product} />
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Product Modal */}
      <AddMealModal open={showAddModal} onClose={() => setShowAddModal(false)} currentProduct={currentProduct} isAdd={isAdd} />
    </Box>
  );
}
