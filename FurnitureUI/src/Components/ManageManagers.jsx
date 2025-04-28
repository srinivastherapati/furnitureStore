import { useEffect, useState } from "react";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api"; 

export default function ManageManagers() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all managers on component load
  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/customer/get/managers`);
      setManagers(response.data);
    } catch (error) {
      console.error("Error fetching managers:", error);
      alert(error.response?.data || "Failed to fetch managers");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalToggle = async (managerId) => {
    try {
      await axios.post(`${API_BASE_URL}/customer/approve/manager/${managerId}`);
      fetchManagers(); // Refresh the list after approval/rejection
      alert("Manager status updated successfully");
    } catch (error) {
      console.error("Error approving/rejecting manager:", error);
      alert(error.response?.data || "Action failed");
    }
  };

  if (loading) return <p>Loading managers...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Manage Managers</h2>
      {managers.length === 0 ? (
        <p>No managers found</p>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>First Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Phone</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {managers.map((manager) => (
                <TableRow key={manager.id}>
                  <TableCell>{manager.firstName}</TableCell>
                  <TableCell>{manager.email}</TableCell>
                  <TableCell>{manager.phoneNumber}</TableCell>
                  <TableCell>{manager.approved ? "Approved" : "Pending"}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color={manager.approved ? "error" : "primary"}
                      onClick={() => handleApprovalToggle(manager.id)}
                    >
                      {manager.approved ? "Reject" : "Approve"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
