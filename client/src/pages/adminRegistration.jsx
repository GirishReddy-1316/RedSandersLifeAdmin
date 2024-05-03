import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { axiosInstance } from '../api';

function AdminRegistrationPage() {
    const [token, setToken] = React.useState(JSON.parse(localStorage.getItem("admin_token")) || "");
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        phoneNumber: ''
    });

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/admin/create', formData, {
                headers: {
                    "authorization": `Bearer ${token}`
                }
            });
            toast.success("Admin account created successfully!");
            setFormData({
                email: '',
                password: '',
                phoneNumber: ''
            })
        } catch (error) {
            console.error('Error creating admin account:', error);
            toast.error("Failed to create admin account!");
        }
    };

    return (
        <div className="container m-auto">
            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <div className="card shadow-lg border-0 rounded-lg mt-5">
                        <div className="card-header">
                            <h3 className="text-center font-weight-light my-4">Create New Admin Account</h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-floating mb-3">
                                    <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} required />
                                    <label htmlFor="email">Email</label>
                                </div>
                                <div className="form-floating mb-3">
                                    <input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleChange} required />
                                    <label htmlFor="password">Password</label>
                                </div>
                                <div className="form-floating mb-3">
                                    <input type="tel" className="form-control" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                                    <label htmlFor="phoneNumber">Phone Number</label>
                                </div>
                                <div className="d-flex align-items-center justify-content-between mt-4 mb-0">
                                    <button type="submit" className="btn btn-primary">Submit</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminRegistrationPage;