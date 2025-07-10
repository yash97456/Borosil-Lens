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
  // TODO: Replace with real API data
  const stats = {
    totalCodes: 32,
    totalImages: 34,
  };

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
                {stats.totalCodes}
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
                {stats.totalImages}
              </Typography>
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
              Upload Images
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
