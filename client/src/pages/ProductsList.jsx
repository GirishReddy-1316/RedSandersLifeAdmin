import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";
import { Image, CloudinaryContext } from "cloudinary-react";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { axiosInstance } from "../api";
import { toast } from "react-toastify";

import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";
import {
  randomId,
} from "@mui/x-data-grid-generator";

function EditToolbar(props) {
  const { setRows, setRowModesModel, setImageUrl, imageUrl } = props;
  const [image, setImage] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    brandName: "jiyaba",
    image: "",
    name: "Red Sanders Water",
    price: "₹1000",
    category: "Drink",
    size: "3500 ml",
    featured: true,
    slug: "red-sanders-water",
    desc:
      "Where does this come from: It's extracted from the roots of the red sanders plant using a special method. By drinking this water, you can enjoy extra health benefits along with a pleasant taste. Furthermore, the regular water used in this process is purified RO drinking water, and we've also added some natural sugars that are beneficial to our health.",
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
    });
    setImage(e.target.files[0])

  };

  const handleSubmit = async () => {
    try {
      await handleUpload()
      const formDataToSend = {
        ...formData,
        image: imageUrl
      };
      console.log(formDataToSend)
      const response = await axiosInstance.post(`/products/insert`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Product added successfully");
      setOpen(false);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product. Please try again later.");
    }
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "ml_default");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dxhoawdbh/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setImageUrl(data.secure_url);
        toast.success("Product uploaded successfully");
      } else {
        console.error("Failed to upload image");
        toast.error("Failed to upload image");
      }
    } catch (error) {
      toast.error("Failed to upload image");
      console.error("Error uploading image:", error);
    }
  };

  return (
    <GridToolbarContainer>
      <CloudinaryContext cloudName="ml_default">
        <input type="file" onChange={handleFileChange} />

      </CloudinaryContext>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleOpen}>
        Add Product
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <h2 id="modal-title">Add New Product</h2>
          <TextField
            label="Brand Name"
            name="brandName"
            value={formData.brandName}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Size"
            name="size"
            value={formData.size}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            name="desc"
            value={formData.desc}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <input type="file" onChange={handleFileChange} />
          <Button variant="contained" onClick={handleSubmit}>
            Add
          </Button>
        </Box>
      </Modal>
    </GridToolbarContainer>
  );
}

export default function ProductsList() {
  const [rows, setRows] = React.useState([]);
  const [rowModesModel, setRowModesModel] = React.useState({});
  const [token, setToken] = React.useState(JSON.parse(localStorage.getItem("admin_token")) || "");
  const [imageUrl, setImageUrl] = React.useState(null);

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => async () => {
    try {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });

      const editedRow = rows.find((row) => row.id === id);
      let axiosConfig = {
        headers: {
          'authorization': `Bearer ${token}`
        }
      };

      let response;
      if (editedRow.isNew) {
        response = await axiosInstance.post(`/products/insert`, editedRow, axiosConfig);
      } else {
        response = await axiosInstance.put(`/products/update/${id}`, editedRow, axiosConfig);
      }

      const updatedRowData = response.data;

      setRows((prevRows) =>
        prevRows.map((row) => (row.id === updatedRowData.id ? updatedRowData : row))
      );

      toast.success("Product saved successfully");
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product. Please try again later.");
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    }
  };


  const handleDeleteClick = (id) => async () => {
    let axiosConfig = {
      headers: {
        'authorization': `Bearer ${token}`
      }
    };
    const response = await axiosInstance.delete(`/products/delete/${id}`, axiosConfig);
    setRows(rows.filter((row) => row.id !== id));
    toast.success("Product deleted successfully");
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
      setRows(initialRows); // Reset rows to their original state
    } else {
      const filteredRows = rows.filter(
        (row) =>
          row.productId.toLowerCase().includes(keyword) ||
          row.productName.toString().includes(keyword)
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
    {
      field: "id", headerName: "Product Id", type: "number", width: 180, align: "left",
      headerAlign: "left", editable: true
    },
    {
      field: "brandName",
      headerName: "Brand Name",
      type: "string",
      width: 180,
      align: "left",
      headerAlign: "left",
      editable: true,
    },
    {
      field: "image",
      headerName: "Image Name",
      type: "string",
      width: 180,
      align: "left",
      headerAlign: "left",
      editable: true,
    },
    {
      field: "name",
      headerName: "Product Name",
      type: "string",
      width: 180,
      align: "left",
      headerAlign: "left",
      editable: true,
    },
    {
      field: "price",
      headerName: "Price",
      type: "string",
      width: 180,
      align: "left",
      headerAlign: "left",
      editable: true,
    },
    {
      field: "category",
      headerName: "Category",
      type: "string",
      width: 180,
      align: "left",
      headerAlign: "left",
      editable: true,
    },
    {
      field: "size",
      headerName: "Size",
      type: "string",
      width: 180,
      align: "left",
      headerAlign: "left",
      editable: true,
    },
    {
      field: "featured",
      headerName: "Featured Product",
      type: "string",
      width: 180,
      align: "left",
      headerAlign: "left",
      editable: true,
    },
    {
      field: "slug",
      headerName: "Product URL",
      type: "string",
      width: 180,
      align: "left",
      headerAlign: "left",
      editable: true,
    },
    {
      field: "desc",
      headerName: "Description",
      type: "string",
      width: 180,
      align: "left",
      headerAlign: "left",
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

  React.useEffect(() => {
    const getproductList = async () => {
      try {
        const response = await axiosInstance.get(`/products`, {
          headers: {
            "authorization": `Bearer ${token}`
          }
        });
        const products = response.data.map((product, index) => ({
          ...product,
          id: product._id
        }));
        setRows(products);
      } catch (error) {
        console.log('Error fetching orders:', error);
        toast.error(
          error.response ? error.response.data.message : error.message,
          { duration: 2000, position: "top-center" }
        );
      }
    };

    getproductList();
  }, []);



  return (
    <div>
      <h1>Products List</h1>
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
              <EditToolbar {...props} imageUrl={imageUrl} setImageUrl={setImageUrl} />
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
