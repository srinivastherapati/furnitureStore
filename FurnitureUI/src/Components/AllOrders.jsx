import React, { useState, useEffect, useCallback } from "react";
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
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { getAllOrders, updateOrderStatus } from "./ServerRequests"; // Assuming you have these requests
import Buttons from "./UI/Buttons"; // Assuming you have this Buttons component

const statusOptions = [
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
  "Cancelled (By User)",
  "Cancelled (By Admin)",
];

const AllOrders = () => {
  const [totalOrders, setOrders] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    getAllOrders()
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch orders:", error);
        setError("Failed to fetch orders.");
        setLoading(false);
      });
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus)
      .then(() => {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId ? { ...order, status: newStatus } : order
          )
        );
      })
      .catch((error) => {
        console.error("Failed to update order status:", error);
      });
  };

  const handleCancelOrder = useCallback((id, status) => {
    if (["READY", "READY FOR PICKUP", "DELIVERED"].includes(status)) {
      alert("Order cannot be canceled. Refund cannot be issued.");
    } else {
      // cancelOrder(id); Assuming cancelOrder is implemented in ServerRequests
      alert("Order Cancelled, Refund Initiated");
      window.location.reload();
    }
  }, []);

  const handleOpenOrderItems = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseOrderItems = () => {
    setSelectedOrder(null);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
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
        All Orders
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Date</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Order Status</TableCell>
              <TableCell>Order Items</TableCell>
              <TableCell>Change Status</TableCell>
             
            </TableRow>
          </TableHead>
          <TableBody>
            {totalOrders.map((order) => {
              // Dynamically modify status options for each order
              const dynamicStatusOptions = statusOptions.map((option) =>
                order.deliveryType === "pickup" && option === "READY"
                  ? "READY FOR PICKUP"
                  : option
              );

              return (
                <TableRow key={order.orderId}>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell>${order.totalPayment.toFixed(2)}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenOrderItems(order)}>
                      <Visibility />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.orderId, e.target.value)
                      }
                      disabled={["DELIVERED", "CANCELLED"].includes(order.status)}
                      style={{
                        backgroundColor: "#1d1a16",
                        color: "#d9e2f1",
                        border: "none",
                        padding: "5px",
                      }}
                    >
                      {dynamicStatusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                 
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Items Dialog */}
      {selectedOrder && (
        <Dialog open={Boolean(selectedOrder)} onClose={handleCloseOrderItems}>
          <DialogTitle>Order Items</DialogTitle>
          <DialogContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Quantity Bought</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedOrder.products.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.quantityBought}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseOrderItems} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AllOrders;
