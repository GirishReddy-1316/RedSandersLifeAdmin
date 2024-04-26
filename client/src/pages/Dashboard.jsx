import React, { useEffect, useState } from 'react'
import "../styles/Dashboard.css";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Dashboard = () => {
  const [token, setToken] = useState(JSON.parse(localStorage.getItem("auth")) || "");
  const [data, setData] = useState({});
  const navigate = useNavigate();

  const fetchLuckyNumber = async () => {

    let axiosConfig = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };


  }



  // useEffect(() => {
  //   if(token === ""){
  //     navigate("/login");
  //     toast.warn("Please login first to access dashboard");
  //   }
  // }, [token]);

  return (
    <div className='dashboard-main'>
      <h1>Dashboard</h1>
      <p>Hi Admin{data.msg}</p>
      {/* <Link to="/logout" className="logout-button">Logout</Link> */}

      <div className="home-container">
        <div className="card">
          <h2>Users List</h2>
          <p>You can see list of JiYaBa Users here</p>
          <Link to="/users">
            <button>Go to Users</button>
          </Link>
        </div>
        <div className="card">
          <h2>Orders List</h2>
          <p>You can see list of JiYaBa Orders here</p>
          <Link to="/orders">
            <button>Go to Orders</button>
          </Link>
        </div>
        <div className="card">
          <h2>Products list</h2>
          <p>You can see list of JiYaBa Products here</p>
          <Link to="/products">
            <button>Go to Products</button>
          </Link>
        </div>
        <div className="card">
          <h2>Create New Admin</h2>
          <p>You can create new Admin</p>
          <Link to="/page4">
            <button>Create Admin</button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard