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
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";
import { randomId } from "@mui/x-data-grid-generator";
import { IconButton } from "@mui/material";

function EditToolbar({ getproductList, setFormData, setImage, setOpen, setIsEditMode, initialRows, rows }) {
  const handleOpen = () => {
    setFormData({
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
    setImage(null);
    setIsEditMode(false);
    setOpen(true);
  };

  const exportData = () => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, `products_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleOpen}>
        Add Product
      </Button>
      <Button variant="contained" onClick={exportData}>
        Export Data
      </Button>
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
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState("");

  const [image, setImage] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editRowId, setEditRowId] = React.useState(null);
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      if (image) {
        formDataToSend.append("file", image);
        formDataToSend.append("upload_preset", "exjqodc2");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dg5dkcpkn/image/upload",
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
        const uploadedImageUrl = imageData.secure_url;

        formData.image = uploadedImageUrl;
      }

      const productData = {
        ...formData,
      };

      if (isEditMode) {
        const productResponse = await axiosInstance.post(
          `/products/update/${editRowId}`,
          productData,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );

        if (productResponse.status !== 200) {
          toast.error("Failed to update product.");
          return;
        }

        toast.success("Product updated successfully", { duration: 2000 });
      } else {
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

        toast.success("Product added successfully", { duration: 2000 });
      }

      await getproductList();
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

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    const selectedRow = rows.find((row) => row.id === id);
    setFormData(selectedRow);
    setImage(null);
    setIsEditMode(true);
    setEditRowId(id);
    setOpen(true);
  };

  const handleSaveView = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleSaveClick = async (editedRow) => {
    const { id } = editedRow;
    try {
      const axiosConfig = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      await axiosInstance.post(
        `/products/update/${id}`,
        editedRow,
        axiosConfig
      );
      toast.success("Product saved successfully", { duration: 2000 });
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product. Please try again later.");
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    }
  };

  const handleDeleteClick = (id) => async () => {
    alert("Are you sure you want to delete this product?");
    let axiosConfig = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    await axiosInstance.delete(
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
      setRows(initialRows);
    } else {
      const filteredRows = rows.filter(
        (row) =>
          row.id.toString().toLowerCase().includes(keyword) ||
          row.name.toString().toLowerCase().includes(keyword)
      );
      setRows(filteredRows);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "brandName", headerName: "Brand", width: 150, editable: true },
    { field: "image", headerName: "Image", width: 150, editable: true },
    { field: "name", headerName: "Name", width: 150, editable: true },
    { field: "price", headerName: "Price", width: 150, editable: true },
    { field: "category", headerName: "Category", width: 150, editable: true },
    { field: "size", headerName: "Size", width: 150, editable: true },
    { field: "featured", headerName: "Featured", width: 150, editable: true },
    { field: "slug", headerName: "Slug", width: 150, editable: true },
    { field: "desc", headerName: "Description", width: 150, editable: true },
    // { field: "additionalBulletPoints", headerName: "Additional Bullet Points", width: 200, editable: true },
    { field: "isProductReady", headerName: "Product Ready", width: 150, editable: true },
    { field: "ingredients", headerName: "Ingredients", width: 150, editable: true },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      type: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveView(id)}
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

  const getproductList = async () => {
    try {
      let response = await axiosInstance.get("/products");
      const productsWithId = response.data.map((product) => ({
        ...product,
        id: product._id,
      }));
      setRows(productsWithId);
      setinitialRows(productsWithId);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  React.useEffect(() => {
    getproductList();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setImage(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result);
    };
    reader.readAsDataURL(selectedFile);
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
          onRowEditStop={handleRowEditStop}
          components={{
            Toolbar: EditToolbar,
          }}
          componentsProps={{
            toolbar: { getproductList, setFormData, setImage, setOpen, setIsEditMode, rows, initialRows },
          }}
        />
        <Modal open={open} onClose={() => setOpen(false)}>
          <Box
            component="form"
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
            <TextField
              name="brandName"
              label="Brand Name"
              value={formData.brandName}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              name="price"
              label="Price"
              value={formData.price}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              name="category"
              label="Category"
              value={formData.category}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              name="size"
              label="Size"
              value={formData.size}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              name="slug"
              label="Slug"
              value={formData.slug}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              name="desc"
              label="Description"
              value={formData.desc}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              name="ingredients"
              label="Ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            {formData.additionalBulletPoints.map((bulletPoint, index) => (
              <Box key={index} sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
                <TextField
                  label="Bullet Point Heading"
                  value={bulletPoint.heading}
                  onChange={(e) => handleBulletPointChange(index, "heading", e.target.value)}
                  sx={{ mb: 1 }}
                />
                <TextField
                  label="Bullet Point Description"
                  value={bulletPoint.description}
                  onChange={(e) => handleBulletPointChange(index, "description", e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Button variant="outlined" color="error" onClick={() => handleRemoveBulletPoint(index)}>Remove Bullet Point</Button>
              </Box>
            ))}
            <Button variant="outlined" onClick={handleAddBulletPoint}>Add Bullet Point</Button>

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
            {imagePreviewUrl && (
              <div style={{ marginTop: "10px", textAlign: "center" }}>
                <img src={imagePreviewUrl} alt="Product Preview" style={{ maxWidth: "100%", maxHeight: "200px" }} />
              </div>
            )}
            <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
              {isEditMode ? "Update Product" : "Add Product"}
            </Button>
          </Box>
        </Modal>
      </Box>
    </div>
  );
}
