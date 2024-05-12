import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { axiosInstance } from "../api";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Button,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

function AdminRegistrationPage() {
  const [token, setToken] = React.useState(
    JSON.parse(localStorage.getItem("admin_token")) || ""
  );
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phoneNumber: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/admin/create", formData, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      toast.success("Admin account created successfully!", { duration: 2000 });
      setFormData({
        email: "",
        password: "",
        phoneNumber: "",
      });
    } catch (error) {
      console.error("Error creating admin account:", error);
      if (error.response) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <Link to="/dashboard">
          <button>Go to Dashboard</button>
        </Link>
      </div>
      <Container maxWidth="md" mt={5}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Create New Admin Account"
                sx={{ textAlign: "center", color: "common.black" }}
              />
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{ borderBottom: "none" }}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ borderBottom: "none" }}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    style={{ borderBottom: "none" }}
                    margin="normal"
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Submit
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default AdminRegistrationPage;
