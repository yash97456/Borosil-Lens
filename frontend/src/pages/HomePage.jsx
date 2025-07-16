import { useState, useEffect } from "react";
import { Box, Paper, Typography, Grid, Button } from "@mui/material";
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
  const [stats, setStats] = useState({ totalCodes: 0, totalImages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stats`);
        const data = await res.json();
        console.log("Raw stats API response:", data);
        if (res.ok && data.success) {
          const mappedStats = {
            totalCodes: data.stats?.master_skus ?? data.stats?.totalCodes ?? 0,
            totalImages:
              data.stats?.total_records ?? data.stats?.totalImages ?? 0,
          };
          console.log("Mapped stats for UI:", mappedStats);
          setStats(mappedStats);
        } else {
          setError(data.message || "Failed to fetch stats.");
        }
      } catch (err) {
        setError("Network error.");
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
            <Paper sx={{ p: 3, textAlign: "center", cursor: "pointer" }}>
              <Typography variant="h6" color="primary">
                Total Spare Part Codes
              </Typography>
              <Typography variant="h3" fontWeight={700}>
                {loading ? "..." : stats?.totalCodes ?? 0}
              </Typography>
            </Paper>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={8} md={5}>
          <motion.div {...subtleMotion}>
            <Paper sx={{ p: 3, textAlign: "center", cursor: "pointer" }}>
              <Typography variant="h6" color="primary">
                Total Images Collected
              </Typography>
              <Typography variant="h3" fontWeight={700}>
                {loading ? "..." : stats?.totalImages ?? 0}
              </Typography>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
      {error && (
        <Typography color="error" sx={{ textAlign: "center", mb: 2 }}>
          {error}
        </Typography>
      )}
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
    </Box>
  );
}
