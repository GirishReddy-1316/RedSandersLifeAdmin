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
import { randomId } from "@mui/x-data-grid-generator";
import { IconButton } from "@mui/material";

function EditToolbar({ getproductList }) {
  const [image, setImage] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [token, setToken] = React.useState(
    JSON.parse(localStorage.getItem("admin_token")) || ""
  );
  const [formData, setFormData] = React.useState({
    brandName: "",
    image: "",
    name: "",
    price: "",
    category: "",
    size: "",
    featured: true,
    slug: "",
    desc: "",
    additionalBulletPoints: [{ heading: "", description: "" }],
    isProductReady: true,
    ingredients: "",
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
    const selectedFile = e.target.files[0];
    setImage(selectedFile);
  };

  const handleSubmit = async () => {
    try {
      const requiredFields = ['brandName', 'name', 'price', 'category', 'size', 'slug', 'desc', 'ingredients'];
      const emptyFields = requiredFields.filter(field => !formData[field]);
      if (emptyFields.length > 0) {
        toast.error(`Please fill in the following fields: ${emptyFields.join(', ')}`);
        return;
      }
      if (!image) {
        toast.error("Please select an image.");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("file", image);
      formDataToSend.append("upload_preset", "ml_default");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dxhoawdbh/image/upload",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        toast.error("Failed to upload image.");
        return;
      }

      const imageData = await response.json();
      const uploadedImageUrl = imageData.secure_url; // Store the uploaded image URL

      const productData = {
        ...formData,
        image: uploadedImageUrl, // Use the uploaded image URL
      };

      const productResponse = await axiosInstance.post(
        `/products/insert`,
        productData,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (productResponse.status !== 201) {
        toast.error("Failed to add product.");
        return;
      }

      await getproductList();
      toast.success("Product added successfully", { duration: 2000 });
      setOpen(false);
    } catch (error) {
      toast.error(
        error.response ? error.response.data.message : error.message,
        { position: "top-right" }
      );
    }
  };

  const handleAddBulletPoint = () => {
    const newBulletPoint = {
      heading: "",
      description: "",
    };
    setFormData({
      ...formData,
      additionalBulletPoints: [
        ...formData.additionalBulletPoints,
        newBulletPoint,
      ],
    });
  };

  const handleRemoveBulletPoint = (index) => {
    const updatedBulletPoints = [...formData.additionalBulletPoints];
    updatedBulletPoints.splice(index, 1);
    setFormData({
      ...formData,
      additionalBulletPoints: updatedBulletPoints,
    });
  };

  const handleBulletPointChange = (index, key, value) => {
    const updatedBulletPoints = [...formData.additionalBulletPoints];
    updatedBulletPoints[index][key] = value;
    setFormData({
      ...formData,
      additionalBulletPoints: updatedBulletPoints,
    });
  };

  return (
    <GridToolbarContainer>
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
            width: 800,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            maxHeight: 500,
            overflowY: "auto",
          }}
        >
          <h2 id="modal-title">Add New Product</h2>
          <TextField
            label="Brand Name : you can give Jiyaba for now"
            name="brandName"
            value={formData.brandName}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={{ width: "calc(50% - 16px)", mr: 2 }}
            required
          />
          <TextField
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={{ width: "calc(50% - 16px)", mr: 2 }}
            required
          />
          <TextField
            label="Price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={{ width: "calc(50% - 16px)", mr: 2 }}
            required
          />
          <TextField
            label="Category: Powder or Bevarage"
            name="category"
            value={formData.category}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={{ width: "calc(50% - 16px)", mr: 2 }}
            required
          />
          <TextField
            label="Size: ml or gm"
            name="size"
            value={formData.size}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={{ width: "calc(50% - 16px)", mr: 2 }}
            required
          />
          <TextField
            label="Slug - Product end url"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={{ width: "calc(50% - 16px)", mr: 2 }}
            required
          />
          <TextField
            label="Description : Main description about product"
            name="desc"
            value={formData.desc}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={{ width: "calc(50% - 16px)", mr: 2 }}
            required
          />
          <TextField
            label="Ingredients"
            name="ingredients"
            value={formData.ingredients}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={{ width: "calc(50% - 16px)", mr: 2 }}
            required
          />
          {formData.additionalBulletPoints.map((bulletPoint, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center" }}>
              <TextField
                label={`Heading ${index + 1}`}
                value={bulletPoint.heading}
                onChange={(e) =>
                  handleBulletPointChange(index, "heading", e.target.value)
                }
                fullWidth
                margin="normal"
                style={{ marginRight: "8px" }}
              />
              <TextField
                label={`Description ${index + 1}`}
                value={bulletPoint.description}
                onChange={(e) =>
                  handleBulletPointChange(index, "description", e.target.value)
                }
                fullWidth
                margin="normal"
                style={{ marginRight: "8px" }}
              />
              <IconButton
                onClick={() => handleRemoveBulletPoint(index)}
                aria-label="delete"
              >
                <DeleteIcon />
              </IconButton>
            </div>
          ))}
          <Button onClick={handleAddBulletPoint} startIcon={<AddIcon />}>
            Add headings
          </Button>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "10px",
            }}
          >
            <div>Upload product image here :</div>
            <div>
              <CloudinaryContext cloudName="ml_default">
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={{
                    border: "2px solid #ccc",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    fontSize: "16px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    transition: "border-color 0.3s ease",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </CloudinaryContext>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "10px",
            }}
          >
            <Button variant="contained" onClick={handleSubmit}>
              Save
            </Button>
            <Button variant="contained" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>
    </GridToolbarContainer>
  );
}

export default function ProductsList() {
  const [rows, setRows] = React.useState([]);
  const [rowModesModel, setRowModesModel] = React.useState({});
  const [initialRows, setinitialRows] = React.useState([]);
  const [token, setToken] = React.useState(
    JSON.parse(localStorage.getItem("admin_token")) || ""
  );

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
          authorization: `Bearer ${token}`,
        },
      };

      let response;
      response = await axiosInstance.post(
        `/products/update/${id}`,
        editedRow,
        axiosConfig
      );
      const updatedRowData = response.data;
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === updatedRowData.id ? updatedRowData : row
        )
      );

      toast.success("Product saved successfully", { duration: 2000 });
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product. Please try again later.");
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    }
  };

  const handleDeleteClick = (id) => async () => {
    let axiosConfig = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    const response = await axiosInstance.delete(
      `/products/delete/${id}`,
      axiosConfig
    );
    setRows(rows.filter((row) => row.id !== id));
    toast.success("Product deleted successfully", { duration: 2000 });
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
          row.id.toString().toLowerCase().includes(keyword) ||
          row.name.toString().toLowerCase().includes(keyword)
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
      field: "id",
      headerName: "Product Id",
      type: "number",
      width: 180,
      align: "left",
      headerAlign: "left",
      editable: true,
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
    getproductList();
  }, []);

  const getproductList = async () => {
    try {
      const response = await axiosInstance.get(`/products`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const products = response.data.map((product, index) => ({
        ...product,
        id: product._id,
      }));
      setRows(products);
      setinitialRows(products);
    } catch (error) {
      console.log("Error fetching orders:", error);
      toast.error(
        error.response ? error.response.data.message : error.message,
        { duration: 2000, position: "top-center" }
      );
    }
  };

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
        <input
          type="text"
          style={{
            height: "35px",
            margin: "5px 0",
          }}
          placeholder="Search..."
          onChange={handleSearch}
        />
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
              <EditToolbar {...props} getproductList={getproductList} />
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
