import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Autocomplete,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";

export default function FeedbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const uploadedImage = location.state?.image;
  const predictedSku = location.state?.predictedSku;

  useEffect(() => {
    if (!uploadedImage) {
      navigate("/search", { replace: true });
    }
  }, [uploadedImage, navigate]);

  if (!uploadedImage) {
    return null;
  }

  const [code, setCode] = useState(null);
  const [codes, setCodes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const url = import.meta.env.VITE_API_URL
          ? `${import.meta.env.VITE_API_URL}/api/codes`
          : "/api/codes";
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok && data.success) setCodes(data.codes);
      } catch (err) {}
    };
    fetchCodes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!predictedSku) {
      setSnackbar({
        open: true,
        message: "Predicted SKU is missing.",
        severity: "error",
      });
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();

      if (
        uploadedImage &&
        typeof uploadedImage === "string" &&
        uploadedImage.startsWith("blob:")
      ) {
        const response = await fetch(uploadedImage);
        const blob = await response.blob();
        formData.append("file", blob, "feedback.jpg");
      } else if (
        uploadedImage &&
        typeof uploadedImage === "string" &&
        uploadedImage.startsWith("data:")
      ) {
        const arr = uploadedImage.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        const imageBlob = new Blob([u8arr], { type: mime });
        formData.append("file", imageBlob, "feedback.jpg");
      } else if (uploadedImage instanceof File) {
        formData.append("file", uploadedImage, uploadedImage.name);
      } else {
        setSnackbar({
          open: true,
          message: "Invalid image format.",
          severity: "error",
        });
        setSubmitting(false);
        return;
      }

      formData.append("username", localStorage.getItem("userId") || "emp456");
      formData.append("predicted_sku", predictedSku);
      formData.append("correct_sku", code.label);

      const res = await fetch(
        import.meta.env.VITE_API_URL
          ? `${import.meta.env.VITE_API_URL}/api/feedback`
          : "/api/feedback",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setCode(null);
        setSnackbar({
          open: true,
          message: "Feedback submitted!",
          severity: "success",
        });
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1200);
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Submission failed.",
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
    setSubmitting(false);
  };

  return (
    <Paper sx={{ maxWidth: 400, mx: "auto", p: 4 }}>
      {uploadedImage && (
        <Box sx={{ mb: 2, textAlign: "center" }}>
          <img
            src={uploadedImage}
            alt="Uploaded"
            style={{
              width: 180,
              height: 180,
              objectFit: "contain",
              borderRadius: 12,
              background: "#fafafa",
              margin: "0 auto",
              display: "block",
            }}
          />
        </Box>
      )}
      <Typography variant="h6" fontWeight={700} mb={2} textAlign={"center"}>
        Suggest Spare Part Code
      </Typography>
      <form onSubmit={handleSubmit}>
        <Autocomplete
          options={codes}
          value={code}
          onChange={(_, v) => setCode(v)}
          renderOption={(props, option) => (
            <li
              {...props}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "10px 0",
                fontWeight: 500,
                fontSize: 16,
                background: "#fff",
                transition: "background 0.18s",
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
          PaperComponent={({ children }) => (
            <div
              style={{
                maxHeight: 260,
                overflowY: "auto",
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
                scrollbarWidth: "thin",
                scrollbarColor: "#1976d2 #f5f5f5",
              }}
              className="custom-scrollbar"
            >
              {children}
            </div>
          )}
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
          autoSelect={false}
          openOnFocus={false}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Spare Part Code"
              required
              margin="normal"
              inputProps={{
                ...params.inputProps,
                style: { textAlign: "center" },
              }}
              inputRef={null}
            />
          )}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={!code || submitting}
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
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
          {...(window.innerWidth <= 600
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
