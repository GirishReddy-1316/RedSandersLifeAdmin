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
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { axiosInstance } from '../api';
import { Button } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const orderStatus = ['Placed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function OrdersList() {
  const [rows, setRows] = React.useState([]);
  const [rowModesModel, setRowModesModel] = React.useState({});
  const [token, setToken] = React.useState(JSON.parse(localStorage.getItem("admin_token")) || "");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleSaveClick = async (row) => {
    const { id, orderStatus } = row;
    try {
      let axiosConfig = {
        headers: {
          'authorization': `Bearer ${token}`
        }
      };
      await axiosInstance.post(`/order/update/${id}`, {
        status: orderStatus,
      }, axiosConfig);
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
    toast.success("Order deleted successfully", { duration: 2000 });
  };

  const handleSaveView = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
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

  const handleEditClick = (id) => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    handleSaveClick(updatedRow);
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
              key={1}
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={handleSaveView(id)}
            />,
            <GridActionsCellItem
              key={2}
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
            key={1}
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={() => handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key={2}
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const fetchUserOrders = async () => {
    let config;
    if (fromDate && toDate) {
      config = {
        headers: {
          "authorization": `Bearer ${token}`
        },
        params: { fromDate, toDate }
      }
    } else {
      config = {
        headers: {
          "authorization": `Bearer ${token}`
        }
      }
    }
    try {
      const response = await axiosInstance.get(`/admin/orderList`, config);
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

  useEffect(() => {
    fetchUserOrders();
  }, []);

  async function fetchFilterOrderList() {
    const currentDate = new Date();
    const selectedFromDate = new Date(fromDate);
    const selectedToDate = new Date(toDate);

    if (selectedFromDate > currentDate || selectedToDate > currentDate) {
      toast.warning("Future dates cannot be searched.", { duration: 2000 });
      return;
    }

    if (selectedFromDate > selectedToDate) {
      toast.warning("From date cannot be greater than To date.", { duration: 2000 });
      return;
    }

    if (!fromDate || !toDate) {
      toast.warning("Please provide a valid from date and to date.", { duration: 2000 });
      return;
    }

    await fetchUserOrders();
    setFromDate("");
    setToDate("");
  }

  const handleClearFilter = () => {
    setFromDate("");
    setToDate("");
    fetchUserOrders();
  };

  const exportData = () => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, `orders_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div>
      <h1>Orders List</h1>
      <div style={{ padding: '10px', display: 'flex', alignItems: 'center' }}>
        <Link to="/dashboard">
          <button>Go to Dashboard</button>
        </Link>
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
          <Button variant="contained" onClick={() => fetchFilterOrderList()}>
            Apply Filter
          </Button>
          <Button variant="contained" onClick={handleClearFilter}>
            Clear Filter
          </Button>
          <Button variant="contained" onClick={exportData}>
            Export Data
          </Button>
        </div>
      </div>
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
