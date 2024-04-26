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
import {
  randomCreatedDate,
  randomTraderName,
  randomId,
  randomArrayItem,
} from "@mui/x-data-grid-generator";
import { axiosInstance } from "../api";

function EditToolbar(props) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = randomId();
    setRows((oldRows) => [...oldRows, { id, name: "", age: "", isNew: true }]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
    }));
    toast.success("User added for editing");
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add user
      </Button>
    </GridToolbarContainer>
  );
}

export default function UsersList() {
  const [rows, setRows] = useState([]);
  const [token, setToken] = useState(JSON.parse(localStorage.getItem("admin_token")) || "");
  const [rowModesModel, setRowModesModel] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      toast.info("Loading users...");
      try {
        let axiosConfig = {
          headers: {
            'authorization': `Bearer ${token}`
          }
        };
        const response = await axiosInstance.get("/admin/customer-list",
          axiosConfig
        );
        const usersWithIds = response.data.map((user) => ({
          ...user,
          id: user._id,
          createdAt: new Date(user.createdAt),
        }));
        setRows(usersWithIds);
        setLoading(false);
        toast.success("Users loaded successfully");
      } catch (error) {
        setError(error.message);
        setLoading(false);
        toast.error("Error loading users: " + error.message);
      }
    };

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
    let axiosConfig = {
      headers: {
        'authorization': `Bearer ${token}`
      }
    };
    console.log(row);
    const response = await axiosInstance.put(`/admin/users/${id}`, {
      username: row.username,
      email: row.email,
    }, axiosConfig);

    toast.info(`Editing user with ID: ${id}`);
  };

  const handleSaveClick = (id) => async () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    const row = rows.find(r => r.id === id);
    try {
      let axiosConfig = {
        headers: {
          'authorization': `Bearer ${token}`
        }
      };
      console.log(row);
      const response = await axiosInstance.put(`/admin/users/${id}`, {
        username: row.username,
        email: row.email,
      }, axiosConfig);

      setRows(rows.map(r => (r.id === id ? { ...r, ...response.data } : r)));
      toast.success("User saved successfully");
    } catch (error) {
      toast.error("Error saving user: " + error.message);
    }
  };

  const handleDeleteClick = (id) => async () => {
    try {
      let axiosConfig = {
        headers: {
          'authorization': `Bearer ${token}`
        }
      };
      const response = await axiosInstance.delete(`/admin/users/${id}`, axiosConfig);
      setRows(rows.filter(row => row.id !== id));
      toast.success("User deleted successfully");
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
    const keyword = event.target.value.toLowerCase();
    if (keyword.trim() === "") {
      setRows(initialRows);
    } else {
      const filteredRows = rows.filter(
        (row) =>
          row.name.toLowerCase().includes(keyword) ||
          row.email.toLowerCase().includes(keyword)
      );
      setRows(filteredRows);
    }
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns = [
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
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
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
            toolbar: EditToolbar,
          }}
          slotProps={{
            toolbar: { setRows, setRowModesModel },
          }}
        />
      </Box>
    </div>
  );
}