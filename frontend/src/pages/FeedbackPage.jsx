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
          renderInput={(params) => (
            <TextField
              {...params}
              label="Spare Part Code"
              required
              margin="normal"
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
