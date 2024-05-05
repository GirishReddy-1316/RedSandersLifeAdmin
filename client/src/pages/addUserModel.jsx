import React, { useState } from "react";
import { Modal, Box, TextField, Button } from "@mui/material";

function AddUserModal({ open, onClose, onSave }) {
    const [userData, setUserData] = useState({
        name: "",
        age: "",
        email: "",
        password: "",
        username: "",
        phoneNumber: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevUserData) => ({
            ...prevUserData,
            [name]: value,
        }));
    };

    const handleSave = () => {
        onSave(userData);
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    minWidth: 300,
                    maxWidth: 400,
                    borderRadius: 4,
                    textAlign: "center",
                }}
            >
                <h2>Add User</h2>
                <TextField
                    name="username"
                    label="Username"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={userData.username}
                    onChange={handleChange}
                />
                <TextField
                    name="email"
                    label="Email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    required
                    value={userData.email}
                    onChange={handleChange}
                />
                <TextField
                    name="password"
                    label="Password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    type="password"
                    value={userData.password}
                    onChange={handleChange}
                />
                <TextField
                    name="age"
                    label="Age"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    type="number"
                    value={userData.age}
                    onChange={handleChange}
                />
                <TextField
                    name="phoneNumber"
                    label="Phone Number"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={userData.phoneNumber}
                    onChange={handleChange}
                />
                <Button variant="contained" color="primary" onClick={handleSave}>
                    Save
                </Button>
                <Button variant="contained" onClick={onClose} sx={{ ml: 2 }}>
                    Cancel
                </Button>
            </Box>
        </Modal>
    );
}

export default AddUserModal;
