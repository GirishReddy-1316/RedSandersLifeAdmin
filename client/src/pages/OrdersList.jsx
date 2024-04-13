import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
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

const orderStatus = ['Ordered', 'Shipped', 'Out for Delivery', 'Delivered'];
const randomStatus = () => {
  return randomArrayItem(orderStatus);
};

const initialRows = [
  {
    id: 'JYB12456778',
    customerName: 'Suresh',
    orderedOn: randomCreatedDate(),
    phoneNumber: 8790555616,
    emailId: 'giri2reddy2000@gmail.com',
    billingAddress: '#50,Mallaiahpalli, Chandragiri',
    pin: 517101,
    listOfItemsPurchased: '2 - Jiya bottles, 4 - Red Soft drink',
    quantity: 5,
    totalAmount: 450,
    orderStatus: randomStatus()
  },
  {
    id: 'JYB1235678',
    customerName: 'Naresh',
    orderedOn:  randomCreatedDate(),
    phoneNumber: 9591834456,
    emailId:'giri2reddy3000@gmail.com',
    billingAddress: '#50,Dornakambala, Tirupati',
    pin: 517101,
    listOfItemsPurchased: '2 - Jiya bottles, 4 - Red Soft drink',
    quantity: 5,
    totalAmount: 650,
    orderStatus: randomStatus()
  }
];

// function EditToolbar(props) {
  // const { setRows, setRowModesModel } = props;

  // const handleClick = () => {
  //   const id = randomId();
  //   setRows((oldRows) => [...oldRows, { id, name: '', age: '', isNew: true }]);
  //   setRowModesModel((oldModel) => ({
  //     ...oldModel,
  //     [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
  //   }));
  // };

  // return (
  //   <GridToolbarContainer>
  //     <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
  //       Add user
  //     </Button>
  //   </GridToolbarContainer>
  // );
// }

export default function OrdersList() {
  const [rows, setRows] = React.useState(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState({});

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    setRows(rows.filter((row) => row.id !== id));
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
      type: 'number',
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
      type: 'sting',
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
      valueOptions: ['Ordered', 'Shipped', 'Out for Delivery', 'Delivered'],
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