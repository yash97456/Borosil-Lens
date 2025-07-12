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

// --- Dummy flow ---
// const fakeCodes = [
//   { label: "SP-1001" },
//   { label: "SP-1002" },
//   { label: "SP-1003" },
//   { label: "SP-1004" },
// ];

export default function FeedbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const uploadedImage = location.state?.image;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const feedbackData = {
      image: uploadedImage,
      suggestedCode: code.label,
      user: localStorage.getItem("userId") || "emp456",
      date: new Date().toISOString().slice(0, 10),
    };

    try {
      const res = await fetch(
        `${
          process.env.REACT_APP_API_URL ||
          "import.meta.env.VITE_API_URL/api/feedback"
        }`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(feedbackData),
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

  // --- Dummy flow ---
  /*
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    localStorage.setItem(
      "newFeedback",
      JSON.stringify({
        image: uploadedImage || localStorage.getItem("uploadedImage"),
        suggestedCode: code.label,
        user: "emp456",
        date: new Date().toISOString().slice(0, 10),
      })
    );
    setTimeout(() => {
      setSubmitting(false);
      setCode(null);
      setSnackbar({
        open: true,
        message: "Feedback submitted!",
        severity: "success",
      });
    }, 1000);
  };
  */

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
