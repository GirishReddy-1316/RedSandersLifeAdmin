import * as React from 'react';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { Link } from "react-router-dom";

import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from '@mui/x-data-grid';
import {
  randomCreatedDate,
  randomTraderName,
  randomId,
  randomArrayItem,
} from '@mui/x-data-grid-generator';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { axiosInstance } from '../api';

const orderStatus = ['Placed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function OrdersList() {
  const [rows, setRows] = React.useState([]);
  const [rowModesModel, setRowModesModel] = React.useState({});
  const [token, setToken] = React.useState(JSON.parse(localStorage.getItem("admin_token")) || "");

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    const row = rows.find(r => r.id === id);
    console.log(id, row)
  };

  const handleSaveClick = async (id) => {
    const row = rows.find(r => r.id === id);
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });

    try {
      let axiosConfig = {
        headers: {
          'authorization': `Bearer ${token}`
        }
      };
      console.log(row);
      const response = await axiosInstance.post(`/order/update/${id}`, {
        status: row.orderStatus,
      }, axiosConfig);
      setRows(rows.map(r => (r.id === id ? { ...r, ...response.data } : r)));
    } catch (error) {
      toast.error("Error saving user: " + error.message);
    }
  };

  const handleDeleteClick = async (id) => {
    let axiosConfig = {
      headers: {
        'authorization': `Bearer ${token}`
      }
    };
    const response = await axiosInstance.delete(`/order/delete/${id}`, axiosConfig);
    setRows(rows.filter((row) => row.id !== id));
    toast.success("Order deleted successfully");
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

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns = [
    { field: 'id', headerName: 'Order Id', width: 150, editable: false },
    { field: 'customerName', headerName: 'Customer Name', width: 150, editable: false },
    {
      field: 'orderedOn',
      headerName: 'Ordered on',
      type: 'date',
      width: 180,
      align: 'left',
      headerAlign: 'left',
      editable: false,
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
      field: 'emailId',
      headerName: 'Email Id',
      type: 'email',
      width: 180,
      editable: true,
      align: 'left',
      headerAlign: 'left',
    },
    {
      field: 'billingAddress',
      headerName: 'Billing Address',
      width: 180,
      editable: true,
      align: 'left',
      headerAlign: 'left',
    },
    {
      field: 'pin',
      headerName: 'Pin Code',
      type: 'number',
      width: 180,
      editable: true,
      align: 'left',
      headerAlign: 'left',
    },
    {
      field: 'listOfItemsPurchased',
      headerName: 'Items Purchased',
      width: 180,
      editable: true,
      align: 'left',
      headerAlign: 'left',
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      type: 'number',
      width: 180,
      editable: true,
      align: 'left',
      headerAlign: 'left',
    },
    {
      field: 'totalAmount',
      headerName: 'Total Amount',
      type: 'number',
      width: 180,
      editable: true,
      align: 'left',
      headerAlign: 'left',
    },
    {
      field: 'orderStatus',
      headerName: 'Order Status',
      width: 220,
      editable: true,
      type: 'singleSelect',
      valueOptions: ['Placed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
      align: 'left',
      headerAlign: 'left',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={() => handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={() => handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={() => handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const response = await axiosInstance.get(`/order/get-all`, {
          headers: {
            "authorization": `Bearer ${token}`
          }
        });
        const formattedRows = response.data.map(order => ({
          id: order._id,
          customerName: order?.mergedCustomer?.username || "",
          orderedOn: new Date(order.createdAt),
          phoneNumber: order?.mergedCustomer?.phoneNumber || "",
          emailId: order?.mergedCustomer?.email,
          billingAddress: order.shippingAddress.street + ', ' + order.shippingAddress.city,
          pin: order.shippingAddress.pin,
          listOfItemsPurchased: order.products.map(product => `${product.quantity} - ${product.name}`).join(', '),
          quantity: order.products.reduce((total, product) => total + product.quantity, 0),
          totalAmount: order.totalPrice,
          orderStatus: order.status,
        }));

        setRows(formattedRows);
      } catch (error) {
        console.log('Error fetching orders:', error);
        toast.error(
          error.response ? error.response.data.message : error.message,
          { duration: 2000, position: "top-center" }
        );
      }
    };

    fetchUserOrders();

  }, []);

  return (
    <div>
      <h1>Orders List</h1>
      <Link to="/dashboard">
        <button>Go to Dashboard</button>
      </Link>
      <Box
        sx={{
          height: 500,
          width: '100%',
          '& .actions': {
            color: 'text.secondary',
          },
          '& .textPrimary': {
            color: 'text.primary',
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          slotProps={{
            toolbar: { setRows, setRowModesModel },
          }}
        />
      </Box>
    </div>
  );
}
