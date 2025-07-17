import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const subtleMotion = {
  whileHover: {
    y: -2,
    scale: 1.025,
    boxShadow: "0 2px 12px 0 rgba(0,0,0,0.08)",
    transition: { type: "spring", stiffness: 300, damping: 22 },
  },
};

export default function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalCodes: "-", totalImages: "-" });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stats`);
        const data = await res.json();
        if (res.ok && data.success) {
          const mappedStats = {
            totalCodes:
              data.stats?.master_skus ?? data.stats?.totalCodes ?? "-",
            totalImages:
              data.stats?.total_records ?? data.stats?.totalImages ?? "-",
          };
          setStats(mappedStats);
        } else {
          setStats({ totalCodes: "-", totalImages: "-" });
          setSnackbar({
            open: true,
            message: data.message || "Failed to fetch stats.",
            severity: "error",
          });
        }
      } catch (err) {
        setStats({ totalCodes: "-", totalImages: "-" });
        setSnackbar({
          open: true,
          message: "Network error.",
          severity: "error",
        });
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <Box>
      <Grid
        container
        spacing={3}
        mb={4}
        justifyContent="center"
        alignItems="center"
      >
        <Grid item xs={12} sm={8} md={5}>
          <motion.div {...subtleMotion}>
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                cursor: "pointer",
                minHeight: 120,
              }}
            >
              <Typography variant="h6" color="primary">
                Total Spare Part Codes
              </Typography>
              {loading ? (
                <CircularProgress size={28} sx={{ mt: 1 }} />
              ) : (
                <Typography variant="h3" fontWeight={700}>
                  {stats?.totalCodes ?? "-"}
                </Typography>
              )}
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={8} md={5}>
          <motion.div {...subtleMotion}>
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                cursor: "pointer",
                minHeight: 120,
              }}
            >
              <Typography variant="h6" color="primary">
                Total Images Collected
              </Typography>
              {loading ? (
                <CircularProgress size={28} sx={{ mt: 1 }} />
              ) : (
                <Typography variant="h3" fontWeight={700}>
                  {stats?.totalImages ?? "-"}
                </Typography>
              )}
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
      <Grid container spacing={2} justifyContent="center">
        <Grid item>
          <motion.div {...subtleMotion}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate("/upload")}
              sx={{ minWidth: 160, borderRadius: 50 }}
            >
              Upload Image
            </Button>
          </motion.div>
        </Grid>
        <Grid item>
          <motion.div {...subtleMotion}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/search")}
              sx={{
                minWidth: 160,
                borderRadius: 50,
                bgcolor: "#43a047",
                color: "#fff",
                "&:hover": { bgcolor: "#388e3c" },
              }}
            >
              Search Product
            </Button>
          </motion.div>
        </Grid>
        <Grid item>
          <motion.div {...subtleMotion}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/user-panel")}
              sx={{
                minWidth: 160,
                borderRadius: 50,
                bgcolor: "#d32f2f",
                color: "#fff",
                "&:hover": { bgcolor: "#b71c1c" },
              }}
            >
              User Panel
            </Button>
          </motion.div>
        </Grid>
      </Grid>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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
    </Box>
  );
}
