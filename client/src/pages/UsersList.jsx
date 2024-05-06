import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";
import { axiosInstance } from "../api";
import AddUserModal from "./addUserModel";
import { randomId } from "@mui/x-data-grid-generator";

function EditToolbar(props) {
  let { fetchUsers } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = React.useState(JSON.parse(localStorage.getItem("admin_token")) || "");

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
      const response = await axiosInstance.post(`/admin/users/create`, userData, axiosConfig);
      await fetchUsers();
      toast.success("User added successfully", { duration: 2000 });
    } catch (error) {
      toast.error("Failed to add user: " + error.message);
    }
  };
  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleOpenModal}>
        Add user
      </Button>
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
        id: user._id, // Assign the _id property as the id for each row
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

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => async () => {
    const row = rows.find(r => r.id === id);
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (row) => async () => {
    let { id } = row
    const editedRowIndex = rows.findIndex(r => r.id === id);
    console.log("row", rows, editedRowIndex, "edited", row)
    if (editedRowIndex === -1) {
      toast.error("Row not found.");
      return;
    }

    const editedRow = rows[editedRowIndex];
    try {
      const axiosConfig = {
        headers: {
          'authorization': `Bearer ${token}`
        }
      };
      const response = await axiosInstance.put(`/admin/users/${id}`, {
        username: editedRow.username,
        email: editedRow.email
      }, axiosConfig);

      const updatedRow = response.data;

      setRows(prevRows => {
        const newRows = [...prevRows];
        newRows[editedRowIndex] = updatedRow;
        return newRows;
      });

      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });

      toast.success("User saved successfully", { duration: 2000 });
    } catch (error) {
      toast.error("Error saving user: " + error.message);
    }
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
    console.log("processRowUpdate", newRow);
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
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
      field: "createdAt",
      headerName: "Registration Date",
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
      getActions: (row) => {
        const isInEditMode = rowModesModel[row.id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(row)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(row.id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(row.id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(row.id)}
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
          onRowEditStop={(newRow, oldRow) => processRowUpdate(newRow)}
          slots={{
            toolbar: (props) => (
              <EditToolbar {...props} fetchUsers={fetchUsers} />
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
