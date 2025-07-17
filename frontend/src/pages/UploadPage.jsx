import { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Autocomplete,
  Divider,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { Snackbar, Alert } from "@mui/material";
import { styled } from "@mui/material/styles";
import { CircularProgress } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";

const StyledPopper = styled("div")(({ theme }) => ({
  "& .MuiAutocomplete-listbox": {
    maxHeight: 260,
    overflowY: "auto",
    padding: 0,
    scrollbarWidth: "thin",
    scrollbarColor: "#1976d2 #f5f5f5",
    "&::-webkit-scrollbar": {
      width: 8,
      background: "#f5f5f5",
      borderRadius: 8,
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#1976d2",
      borderRadius: 8,
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "#1565c0",
    },
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
  },
  "& .MuiAutocomplete-option": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontWeight: 500,
    fontSize: 16,
    padding: "10px 0",
    transition: "background 0.18s",
    background: "#fff",
    "&[aria-selected='true']": {
      background: "#e3f2fd",
      color: "#1976d2",
    },
    "&:hover": {
      background: "#e3f2fd",
      color: "#1976d2",
    },
  },
}));

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
  const [autoOpen, setAutoOpen] = useState(false);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/codes`);
        const data = await res.json();
        if (res.ok && data.success) setCodes(data.codes);
      } catch (err) {}
    };
    fetchCodes();
  }, []);

  function resizeImage(file, maxWidth = 4000, maxHeight = 4000) {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = function () {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          file.type,
          0.95
        );
      };
      img.src = URL.createObjectURL(file);
    });
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const resizedBlob = await resizeImage(file, 4000, 4000);
      const resizedFile = new File([resizedBlob], file.name, {
        type: file.type,
      });
      setImage(resizedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        localStorage.setItem("uploadedImage", reader.result);
      };
      reader.readAsDataURL(resizedFile);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!spareCode) {
      setSnackbar({
        open: true,
        message: "Spare part code is required.",
        severity: "error",
      });
      return;
    }
    if (!image) {
      setSnackbar({
        open: true,
        message: "Image is required.",
        severity: "error",
      });
      return;
    }
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("sku_code", spareCode.label);
      formData.append("username", localStorage.getItem("userId") || "emp456");
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
            ? `${import.meta.env.VITE_API_URL}/api/upload`
            : "/api/upload"
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
        message: "Network error",
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
          getOptionLabel={(option) =>
            option.label +
            (option.description ? ` - ${option.description}` : "")
          }
          value={spareCode}
          onChange={(_, value) => {
            setSpareCode(value);
            if (isXs) {
              const input = document.querySelector(
                'input[name="Search Spare Part Code"]'
              );
              if (input) input.blur();
            }
          }}
          filterOptions={(options, { inputValue }) =>
            options.filter(
              (option) =>
                option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
                (option.description &&
                  option.description
                    .toLowerCase()
                    .includes(inputValue.toLowerCase()))
            )
          }
          noOptionsText={
            <Box
              sx={{
                bgcolor: "#fff",
                color: "#888",
                textAlign: "center",
                py: 2,
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              No options
            </Box>
          }
          renderOption={(props, option) => (
            <li
              {...props}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <span style={{ fontWeight: 600 }}>{option.label}</span>
              {option.description && (
                <span style={{ fontSize: 13, color: "#666" }}>
                  {option.description}
                </span>
              )}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Spare Part Code"
              placeholder="Type to Search Codes..."
              InputProps={{
                ...params.InputProps,
                sx: {
                  borderRadius: 2,
                  fontWeight: 500,
                  fontSize: 16,
                  bgcolor: "#f5faff",
                },
              }}
              inputProps={{
                ...params.inputProps,
                style: { textAlign: "center" },
                name: "Search Spare Part Code",
              }}
            />
          )}
          PaperComponent={({ children }) => (
            <StyledPopper>{children}</StyledPopper>
          )}
          disablePortal={isXs}
          sx={{
            mb: 2,
            "& .MuiInputBase-root": {
              borderRadius: 2,
              fontWeight: 500,
              fontSize: 16,
              bgcolor: "#f5faff",
            },
            "& .MuiAutocomplete-endAdornment": {
              right: 12,
            },
          }}
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
            type="button"
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
          {uploading ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Uploading...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </form>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            xs: {
              width: "70vw",
              left: "50%",
              transform: "translateX(-50%)",
              minWidth: "unset",
              maxWidth: "unset",
              boxSizing: "border-box",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              padding: "0",
            },
          },
        }}
      >
        <Alert
          {...(isXs
            ? { onClose: undefined }
            : { onClose: () => setSnackbar({ ...snackbar, open: false }) })}
          severity={snackbar.severity}
          sx={{
            width: { xs: "70vw", sm: "100%" },
            fontSize: { xs: 15, sm: 16 },
            px: { xs: 1, sm: 2 },
            py: { xs: 1, sm: 1.5 },
            borderRadius: 2,
            boxShadow: 2,
            textAlign: { xs: "center", sm: "left" },
            mx: { xs: "auto", sm: 0 },
            whiteSpace: "nowrap",
            justifyContent: { xs: "center", sm: "flex-start" },
            alignItems: { xs: "center", sm: "flex-start" },
          }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
