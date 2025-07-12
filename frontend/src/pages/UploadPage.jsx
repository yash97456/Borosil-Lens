import { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Autocomplete,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { Snackbar, Alert } from "@mui/material";

// const fakeCodes = [
//   { label: "SP-1001" },
//   { label: "SP-1002" },
//   { label: "SP-1003" },
//   { label: "SP-1004" },
// ];

export default function UploadPage() {
  useEffect(() => {
    const newFeedback = localStorage.getItem("newFeedback");
    if (newFeedback) {
      try {
        const fb = JSON.parse(newFeedback);
        setFeedbacks((prev) => [
          ...prev,
          {
            id: prev.length ? Math.max(...prev.map((f) => f.id)) + 1 : 1,
            ...fb,
          },
        ]);
        localStorage.removeItem("newFeedback");
      } catch {}
    }
  }, []);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const cameraInputRef = useRef();
  const [codes, setCodes] = useState([]);
  const [spareCode, setSpareCode] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const res = await fetch(
          `${
            process.env.REACT_APP_API_URL ||
            "import.meta.env.VITE_API_URL/api/codes"
          }`
        );
        const data = await res.json();
        if (res.ok && data.success) setCodes(data.codes);
      } catch (err) {}
    };
    fetchCodes();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        localStorage.setItem("uploadedImage", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemove = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  // --- Dummy flow ---
  /*
  const handleSubmit = (e) => {
    e.preventDefault();
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setImage(null);
      setPreview(null);
      setSpareCode(null);
      setSnackbar({
        open: true,
        message: "Image Uploaded",
        severity: "success",
      });
    }, 1000);
  };
  */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!spareCode || !image) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("sku", spareCode.label);
      formData.append("image", image);
      formData.append("userId", localStorage.getItem("userId") || "emp456");

      const res = await fetch(
        `${
          process.env.REACT_APP_API_URL ||
          "import.meta.env.VITE_API_URL/api/upload"
        }`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setImage(null);
        setPreview(null);
        setSpareCode(null);
        setSnackbar({
          open: true,
          message: "Image Uploaded",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Upload failed.",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error.",
        severity: "error",
      });
    }
    setUploading(false);
  };

  return (
    <Paper sx={{ maxWidth: 500, mx: "auto", p: 4 }}>
      <Typography variant="h6" fontWeight={700} mb={2} textAlign={"center"}>
        Upload Spare Part Image
      </Typography>
      <form onSubmit={handleSubmit}>
        <Autocomplete
          options={codes}
          value={spareCode}
          onChange={(_, v) => setSpareCode(v)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Spare Part Code"
              required
              margin="normal"
              placeholder="Search or Enter Code"
            />
          )}
        />
        <Box
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          sx={{
            border: "2px dashed #bdbdbd",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            bgcolor: preview ? "background.paper" : "#f5f5f5",
            my: 2,
            cursor: "pointer",
            position: "relative",
          }}
          onClick={() => fileInputRef.current.click()}
        >
          {preview && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              color="error"
              size="small"
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                bgcolor: "#fff",
                zIndex: 2,
                boxShadow: 1,
                border: "1.5px solid #eee",
                "&:hover": { bgcolor: "#ffeaea" },
                transition: "all 0.18s",
              }}
            >
              <DeleteIcon />
            </IconButton>
          )}
          {preview ? (
            <Box
              sx={{
                width: "100%",
                maxWidth: 260,
                mx: "auto",
                mb: 1,
                aspectRatio: "1 / 1",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fafafa",
                position: "relative",
              }}
            >
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                  background: "#fff",
                }}
              />
            </Box>
          ) : (
            <Box>
              <CloudUploadIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="body2" color="text.secondary">
                Drag & drop or click to select image
              </Typography>
            </Box>
          )}
          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </Box>
        <Box sx={{ textAlign: "center", mt: 2, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PhotoCameraIcon />}
            onClick={(e) => {
              e.preventDefault();
              cameraInputRef.current.click();
            }}
            sx={{ borderRadius: 50, fontWeight: 700 }}
          >
            Capture Image
          </Button>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            ref={cameraInputRef}
            onChange={handleFileChange}
          />
        </Box>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={!spareCode || !image || uploading}
        >
          {uploading ? "Uploading..." : "Submit"}
        </Button>
      </form>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          maxWidth: 360,
          left: "50%",
          transform: "translateX(-50%)",
          top: { xs: 16, sm: 24 },
          "& .MuiPaper-root": {
            maxWidth: 360,
            mx: 1,
            borderRadius: 2,
          },
        }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            fontSize: { xs: 15, sm: 16 },
            px: { xs: 1, sm: 2 },
            py: { xs: 1, sm: 1.5 },
            borderRadius: 2,
            boxShadow: 2,
          }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
