import React, {useState, useEffect, useCallback} from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Select,
    MenuItem,
    TextField
} from "@mui/material";
import {Visibility} from "@mui/icons-material";
import {cancelOrder, getCustomerOrders, submitProductReview} from "./ServerRequests.jsx";
import Buttons from "./UI/Buttons.jsx";

const CustomerOrders = () => {
    const [orders,
        setOrders] = useState([]);
    const [loading,
        setLoading] = useState(true);
    const [error,
        setError] = useState("");
    const [selectedOrder,
        setSelectedOrder] = useState(null);
    const [ratings,
        setRatings] = useState({});
    const [comments,
        setComments] = useState({});

    const userData = JSON.parse(localStorage.getItem("userDetails"));

    useEffect(() => {
        getCustomerOrders(userData.userId).then((data) => {
            setOrders(data);
            setLoading(false);
        }).catch((error) => {
            setError("Failed to fetch past orders.");
            console.error("Error fetching orders:", error);
            setLoading(false);
        });
    }, []);

    const handleCancelOrder = useCallback((id, status) => {
        if (["READY", "READY FOR PICKUP", "DELIVERED"].includes(status)) {
            alert("Order cannot be canceled. Refund cannot be issued.");
        } else {
            cancelOrder(id);
            alert("Order Cancelled, Refund Initiated");
            window
                .location
                .reload();
        }
    }, []);

    const handleOpenOrderItems = (order) => {
        setSelectedOrder(order);
    };

    const handleCloseOrderItems = () => {
        setSelectedOrder(null);
        setRatings();
        setComments();
    };

    const handleSubmitReview = async () => {
      const reviews = selectedOrder.products.map((product) => ({
        userId: userData.userId,
        productId: product.productId,
        rating: ratings[product.productId] || 0,
        comment: comments[product.productId] || "",
      }));
    
      try {
        await submitProductReview(reviews); // Single API call now!
        alert("Reviews submitted successfully!");
        handleCloseOrderItems();
      } catch (error) {
        console.error("Error submitting the reviews:", error);
        alert("Failed to submit reviews");
      }
    };
    

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Your Orders
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order Date</TableCell>
                            <TableCell>Total Amount</TableCell>
                            <TableCell>Order Status</TableCell>
                            <TableCell>Order Items</TableCell>
                            <TableCell>Cancel Order</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.length !== 0
                            ? (orders.map((order) => (
                                <TableRow key={order.orderId}>
                                    <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                                    <TableCell>${order
                                            .totalPayment
                                            .toFixed(2)}</TableCell>
                                    <TableCell>{order.status}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpenOrderItems(order)}>
                                            <Visibility/>
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>
                                        {order.status === "PLACED" || order.status === "PREPARING"
                                            ? (
                                                <Buttons onClick={() => handleCancelOrder(order.orderId, order.status)}>
                                                    Cancel
                                                </Buttons>
                                            )
                                            : ("Not Allowed")}
                                    </TableCell>
                                </TableRow>
                            )))
                            : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No Orders Found
                                    </TableCell>
                                </TableRow>
                            )}

                    </TableBody>
                </Table>
            </TableContainer>

            {/* Order Items Dialog with Ratings & Comments */}
            {selectedOrder && (
                <Dialog open={Boolean(selectedOrder)} onClose={handleCloseOrderItems}>
                    <DialogTitle>Order Items</DialogTitle>
                    <DialogContent>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Product Name</TableCell>
                                    <TableCell>Quantity Bought</TableCell>
                                    <TableCell>Rating</TableCell>
                                    <TableCell>Comments</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedOrder
                                    .products
                                    .map((product, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell>{product.quantityBought}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={ratings[product.productId] || ""}
                                                    onChange={(e) => setRatings((prevRatings) => ({
                                                    ...prevRatings,
                                                    [product.productId]: e.target.value
                                                }))}>

                                                    <MenuItem value="">Select</MenuItem>
                                                    <MenuItem value={1}>1</MenuItem>
                                                    <MenuItem value={2}>2</MenuItem>
                                                    <MenuItem value={3}>3</MenuItem>
                                                    <MenuItem value={4}>4</MenuItem>
                                                    <MenuItem value={5}>5</MenuItem>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    value={comments[product.productId] || ""}
                                                    onChange={(e) => setComments((prevComments) => ({
                                                    ...prevComments,
                                                    [product.productId]: e.target.value
                                                }))}
                                                    placeholder="Write a comment..."
                                                    fullWidth/>

                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseOrderItems} color="primary">
                            Close
                        </Button>
                        <Button onClick={handleSubmitReview} oncolor="secondary" variant="contained">
                            Submit Reviews
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
};

export default CustomerOrders;
