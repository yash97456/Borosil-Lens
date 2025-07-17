import { useState, useEffect } from "react";
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

  const validateWithBigQuery = async ({ userId, password }) => {
    try {
      const url = import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/api/login`
        : "/api/login";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || "Server error" };
      }
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
      setError("");
      localStorage.setItem("userId", result.userId);
      localStorage.setItem("username", result.username);
      localStorage.setItem("role", result.role);
      setSnackbar({
        open: true,
        message: "Login successful!",
        severity: "success",
      });
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } else {
      const errorMsg =
        result.message === "Invalid credentials"
          ? "Wrong Credentials"
          : result.message || "Something went wrong";
      setError(errorMsg);
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (isXs) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isXs]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 1,
        overflow: { xs: "hidden", sm: "auto" },
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
          mt: { xs: -8, sm: 0, md: 0 },
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
          variant={isXs ? "h5" : "h5"}
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
              autoFocus={isXs ? false : true}
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
            <Typography
              color="error"
              variant="body2"
              sx={{
                mt: 1,
                textAlign: "center",
                width: "100%",
                whiteSpace: "nowrap",
              }}
            >
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
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
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
              : { onClose: handleSnackbarClose })}
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
              justifyContent: { xs: "center", sm: "flex-start" },
              alignItems: { xs: "center", sm: "flex-start" },
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
