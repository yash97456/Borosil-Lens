import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import logo from "../assets/logo.png";

export default function LoginPage() {
  const [form, setForm] = useState({ userId: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  // --- Dummy flow ---

  // const validateWithBigQuery = async ({ userId, password }) => {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       if (userId === "admin" && password === "admin123") {
  //         resolve({ success: true, role: "Admin" });
  //       } else {
  //         resolve({
  //           success: false,
  //           message: "Invalid credentials or permissions",
  //         });
  //       }
  //     }, 800);
  //   });
  // };

  const validateWithBigQuery = async ({ userId, password }) => {
    try {
      const res = await fetch(
        `${
          process.env.REACT_APP_API_URL || "import.meta.env.VITE_API_URL/api/login"
        }?userId=${encodeURIComponent(userId)}&password=${encodeURIComponent(
          password
        )}`,
        { method: "GET" }
      );
      if (!res.ok) {
        return { success: false, message: "Server error" };
      }
      const data = await res.json();
      return data;
    } catch (err) {
      return { success: false, message: "Network error" };
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.userId.trim() || !form.password.trim()) {
      setError("Please fill all fields");
      setSnackbar({
        open: true,
        message: "Please fill all fields",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    const result = await validateWithBigQuery(form);
    setLoading(false);

    if (result.success) {
      localStorage.setItem("userId", form.userId);

      setSnackbar({
        open: true,
        message: "Login successful!",
        severity: "success",
      });
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } else {
      setError(result.message || "Login failed");
      setSnackbar({
        open: true,
        message: result.message || "Login failed",
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 1,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          width: { xs: "100%", sm: 380, md: 440 },
          maxWidth: "100vw",
          borderRadius: { xs: 2, sm: 3 },
          minHeight: { xs: 0, sm: 320 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        <Box sx={{ mb: 2, textAlign: "center" }}>
          <img
            src={logo}
            alt="Borosil Logo"
            style={{
              height: isXs ? 36 : 48,
              marginBottom: 8,
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
          <Divider sx={{ mb: 2 }} />
        </Box>
        <Typography
          variant={isXs ? "h6" : "h5"}
          fontWeight={700}
          mb={2}
          textAlign="center"
        >
          Borosil Lens Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mb: 1,
            }}
          >
            <TextField
              label="User ID"
              name="userId"
              value={form.userId}
              onChange={handleChange}
              fullWidth
              margin="none"
              required
              autoFocus
              size={isXs ? "small" : "medium"}
              inputProps={{ style: { fontSize: isXs ? 14 : undefined } }}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              margin="none"
              required
              size={isXs ? "small" : "medium"}
              inputProps={{ style: { fontSize: isXs ? 14 : undefined } }}
            />
          </Box>
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, fontSize: isXs ? 15 : 16, py: isXs ? 1 : 1.5 }}
            disabled={loading}
            size={isXs ? "small" : "large"}
          >
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={2500}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{
              width: "100%",
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
    </Box>
  );
}
