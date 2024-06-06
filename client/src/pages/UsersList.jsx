import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";
import { axiosInstance } from "../api";
import AddUserModal from "./addUserModel";

function EditToolbar(props) {
  let { fetchUsers } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = React.useState(JSON.parse(localStorage.getItem("admin_token")) || "");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveUser = async (userData) => {
    const axiosConfig = {
      headers: {
        'authorization': `Bearer ${token}`
      }
    };
    try {
      await axiosInstance.post(`/admin/users/create`, userData, axiosConfig);
      await fetchUsers();
      toast.success("User added successfully", { duration: 2000 });
      handleCloseModal();
    } catch (error) {
      console.log(error);
      toast.error(
        error.response ? error.response.data.message : error.message,
        { position: "top-right" }
      );
    }
  };

  const handleClearFilter = () => {
    setFromDate(null);
    setToDate(null);
    props.fetchUsers();
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleOpenModal}>
        Add user
      </Button>
      <div style={{ padding: '10px', display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '10px', fontWeight: 'bold' }}>From Date: </span>
        <input
          type="date"
          onChange={(e) => { setFromDate(e.target.value) }}
          value={fromDate}
          style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
          format="y-MM-dd"
        />
      </div>
      <div style={{ padding: '10px', display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '10px', fontWeight: 'bold' }}>To Date: </span>
        <input
          type="date"
          onChange={(e) => { setToDate(e.target.value) }}
          value={toDate}
          style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
          format="y-MM-dd"
        />
      </div>
      <div
        style={{ width: "50%", display: 'flex', justifyContent: "space-between" }}
      >
        <Button variant="contained" onClick={() => props.fetchfilterUsers({ fromDate, toDate })}>
          Apply Filter
        </Button>
        <Button variant="contained" onClick={handleClearFilter}>
          Clear Filter
        </Button>
      </div>
      <AddUserModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
      />
    </GridToolbarContainer>
  );
}

export default function UsersList() {
  const [rows, setRows] = useState([]);
  const [initialRows, setInitialRows] = useState([]);
  const [token, setToken] = useState(JSON.parse(localStorage.getItem("admin_token")) || "");
  const [rowModesModel, setRowModesModel] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const fetchfilterUsers = async (params) => {

    const currentDate = new Date();
    const selectedFromDate = new Date(params.fromDate);
    const selectedToDate = new Date(params.toDate);

    if (selectedFromDate > currentDate || selectedToDate > currentDate) {
      toast.warning("Future dates cannot be searched.", { duration: 2000 });
      return;
    }

    if (selectedFromDate > selectedToDate) {
      toast.warning("From date cannot be greater than To date.", { duration: 2000 });
      return;
    }

    if (!params.fromDate && !params.toDate) {
      toast.warning("Please provide a valid from date.", { duration: 2000 });
      return;
    }

    setLoading(true);
    toast.info("Loading users...");
    try {
      const axiosConfig = {
        headers: {
          'authorization': `Bearer ${token}`
        },
        params
      };
      const response = await axiosInstance.get("/admin/customer-list", axiosConfig);
      const usersWithIds = response.data.map((user) => ({
        ...user,
        id: user._id,
        isGoogleSignIn: user.googleEmail ? true : false,
        createdAt: new Date(user.createdAt),
      }));
      setRows(usersWithIds);
      setInitialRows(usersWithIds);
      setLoading(false);
      toast.success("Users loaded successfully", { duration: 2000 });
    } catch (error) {
      setError(error.message);
      setLoading(false);
      toast.error("Error loading users: " + error.message);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    toast.info("Loading users...");
    try {
      const axiosConfig = {
        headers: {
          'authorization': `Bearer ${token}`
        }
      };
      const response = await axiosInstance.get("/admin/customer-list", axiosConfig);
      const usersWithIds = response.data.map((user) => ({
        ...user,
        id: user._id,
        isGoogleSignIn: user.googleEmail ? true : false,
        phoneNumber: user.googleEmail ? "NA" : user.phoneNumber,
        createdAt: new Date(user.createdAt),
      }));
      setRows(usersWithIds);
      setInitialRows(usersWithIds);
      setLoading(false);
      toast.success("Users loaded successfully", { duration: 2000 });
    } catch (error) {
      setError(error.message);
      setLoading(false);
      toast.error("Error loading users: " + error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (id) => async () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => async () => {
    try {
      const axiosConfig = {
        headers: {
          'authorization': `Bearer ${token}`
        }
      };
      await axiosInstance.delete(`/admin/users/${id}`, axiosConfig);
      setRows(rows.filter(row => row.id !== id));
      toast.success("User deleted successfully", { duration: 2000 });
    } catch (error) {
      toast.error("Error deleting user: " + error.message);
    }
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const handleSearch = (event) => {
    const keyword = event.target.value ? event.target.value.toLowerCase() : '';
    if (keyword.trim() === "") {
      setRows(initialRows);
    } else {
      const filteredRows = rows.filter(
        (row) =>
          row.username.toLowerCase().includes(keyword) ||
          row.email.toLowerCase().includes(keyword)
      );
      setRows(filteredRows);
    }
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    updateRowData(updatedRow);
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  // APIs
  const updateRowData = async (row) => {
    const { id, username, email } = row;

    try {
      const axiosConfig = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };

      await axiosInstance.put(
        `/admin/users/${id}`,
        {
          username,
          email,
        },
        axiosConfig
      );

      toast.success('User saved successfully', { duration: 2000 });
    } catch (error) {
      toast.error('Error saving user: ' + error.message);
    }
  };

  const columns = [
    { field: "id", headerName: "User Id", width: 180, editable: true },
    { field: "username", headerName: "User Name", width: 180, editable: true },
    {
      field: "email",
      headerName: "Email",
      type: "string",
      width: 180,
      align: "left",
      headerAlign: "left",
      editable: true,
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone Number',
      type: 'number',
      width: 180,
      editable: true,
      align: 'left',
      headerAlign: 'left',
    },
    {
      field: "isGoogleSignIn",
      headerName: "IsGoogleSignIn",
      type: "string",
      width: 180,
      align: "left",
      headerAlign: "left",
      editable: true,
    },
    {
      field: "createdAt",
      headerName: "Registration Date \n MM/DD/YYYY",
      type: "date",
      width: 180,
      editable: true,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key={1}
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key={2}
              icon={<CancelIcon />}
              label='Cancel'
              className='textPrimary'
              onClick={handleCancelClick(id)}
              color='inherit'
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key={1}
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key={2}
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <div>
      <h1>Customers List</h1>
      <Link to="/dashboard">
        <button>Go to Dashboard</button>
      </Link>
      <Box
        sx={{
          height: 500,
          width: "100%",
          "& .actions": {
            color: "text.secondary",
          },
          "& .textPrimary": {
            color: "text.primary",
          },
        }}
      >
        <input type="text" style={{
          height: '35px',
          margin: '5px 0',
        }} placeholder="Search..." onChange={handleSearch} />
        <DataGrid
          rows={rows}
          columns={columns}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          slots={{
            toolbar: (props) => (
              <EditToolbar {...props} fetchUsers={fetchUsers} fetchfilterUsers={fetchfilterUsers} />
            ),
          }}
          slotProps={{
            toolbar: { setRows, setRowModesModel },
          }}
        />
      </Box>
    </div>
  );
}
