import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import logo from "../assets/logo.png";

const plants = [
  { label: "Jaipur", value: "jaipur" },
  { label: "Gujarat", value: "gujarat" },
  { label: "Mumbai", value: "mumbai" },
];

export default function LoginPage() {
  const [form, setForm] = useState({ userId: "", password: "", plant: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.down("md"));

  const validateWithBigQuery = async ({ userId, password, plant }) => {
    // TODO: Replace with real BigQuery API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (userId === "admin" && password === "admin123" && plant) {
          resolve({ success: true, role: "Admin" });
        } else {
          resolve({
            success: false,
            message: "Invalid credentials or permissions",
          });
        }
      }, 800);
    });
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await validateWithBigQuery(form);
    setLoading(false);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.message || "Please fill all fields");
    }
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
      </Paper>
    </Box>
  );
}
