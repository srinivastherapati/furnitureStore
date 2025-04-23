import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import ErrorPage from "./ErrorPage";
import { getAllCustomers } from "./ServerRequests";


const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#2e2e2e",
    minHeight: "100vh",
    color: "#fff",
    width: "100%",
  },
  table: {
    borderCollapse: "collapse",
  },
  tableHeader: {
    backgroundColor: "#865D36",
    color: "#fff",
    fontWeight: "bold",
  },
  tableCell: {
    backgroundColor: "black",
    color: "black",
    border: "none",
    fontsize:"15px"
  },
};


const AllUsers = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllCustomers()
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch((error) => setError(error || "Failed to fetch customers"));
  }, []);

  if (isLoading) {
    return (
      <Box className="loading-spinner">
        <CircularProgress className="MuiCircularProgress-root" />
      </Box>
    );
  }
  if (error) {
    return <ErrorPage title="Failed to fetch customers" message={error.message} />;
  }

  return (
    <Box className={styles.container}>
      <TableContainer component={Paper} style={{ boxShadow: "none" }}>
        <Table>
          <TableHead >
            <TableRow>
              <TableCell className={styles.tableHeader}>Customer Name</TableCell>
              <TableCell className={styles.tableHeader}>Customer Email</TableCell>
              <TableCell className={styles.tableHeader} align="center">
                Number of Orders
              </TableCell>
              <TableCell className={styles.tableHeader} align="center">
                Total Order Value
              </TableCell>
              <TableCell className={styles.tableHeader} align="center">
                Last Order Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="MuiTableBody-root">
            {customers.map((customer, idx) => (
              <TableRow key={idx} className="MuiTableRow-root">
                <TableCell className="MuiTableCell-root">
                  {customer.customerName}
                </TableCell>
                <TableCell className="MuiTableCell-root">
                  {customer.customerEmail}
                </TableCell>
                <TableCell className="MuiTableCell-root" align="center">
                  {customer.numberOfOrders}
                </TableCell>
                <TableCell className="MuiTableCell-root" align="center">
                  ${customer.customerTotalOrderValue.toFixed(2)}
                </TableCell>
                <TableCell className="MuiTableCell-root" align="center">
                  {customer.numberOfOrders !== 0
                    ? new Date(customer.lastOrderDate).toLocaleDateString()
                    : "Order not Placed"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AllUsers;
