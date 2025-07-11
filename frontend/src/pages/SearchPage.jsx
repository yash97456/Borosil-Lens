import { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useTheme } from "@mui/material/styles";

const fakeResults = [
  {
    sku: "SP-1001",
    name: "Gear Assembly",
    confidence: 0.97,
  },
  {
    sku: "SP-1002",
    name: "Valve Kit",
    confidence: 0.89,
  },
  {
    sku: "SP-1003",
    name: "Bearing Set",
    confidence: 0.81,
  },
];

const subtleMotion = {
  whileHover: {
    y: -2,
    scale: 1.025,
    boxShadow: "0 2px 12px 0 rgba(0,0,0,0.10)",
    transition: { type: "spring", stiffness: 300, damping: 22 },
  },
};

export default function SearchPage() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const cameraInputRef = useRef();
  const resultsRef = useRef();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const savedResults = localStorage.getItem("searchResults");
    const savedPreview = localStorage.getItem("searchPreview");
    if (savedResults) setResults(JSON.parse(savedResults));
    if (savedPreview) setPreview(savedPreview);
  }, []);

  const fetchResults = async (imgFile) => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(fakeResults), 1200)
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
      setResults([]);
      localStorage.removeItem("searchResults");
      localStorage.setItem("searchPreview", url);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setImage(null);
    setPreview(null);
    setResults([]);
    localStorage.removeItem("searchResults");
    localStorage.removeItem("searchPreview");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    const res = await fetchResults(image);
    setResults(res);
    setLoading(false);
    localStorage.setItem("searchResults", JSON.stringify(res));
    if (preview) localStorage.setItem("searchPreview", preview);
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  return (
    <Box>
      <Paper sx={{ maxWidth: 500, mx: "auto", p: 4, mb: 4 }}>
        <Typography variant="h6" fontWeight={700} mb={2} textAlign={"center"}>
          Capture / Upload Image
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box
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
                onClick={handleRemove}
                color="error"
                size="small"
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  bgcolor: "#fff",
                  zIndex: 2,
                  boxShadow: 1,
                  "&:hover": { bgcolor: "#ffeaea" },
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
                  Click to upload or capture image
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
          <motion.div {...subtleMotion}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={!image || loading}
              sx={{
                mt: 2,
                borderRadius: 50,
                fontWeight: 700,
                boxShadow: "none",
                background: "#0057b8",
                "&:hover": {
                  background: "#003c7e",
                  color: "#fff",
                  boxShadow: "0 2px 12px 0 rgba(0,0,0,0.10)",
                },
              }}
            >
              {loading ? "Loading..." : "Show Results"}
            </Button>
          </motion.div>
        </form>
      </Paper>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {results.length > 0 && (
        <Box ref={resultsRef}>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "stretch" : "center",
              justifyContent: isMobile ? "flex-start" : "center",
              mb: isMobile ? 2 : 3,
              mt: 6,
              gap: isMobile ? 1.5 : 3,
              width: "100%",
              textAlign: isMobile ? "center" : "left",
            }}
          >
            <Typography
              variant="h5"
              fontWeight={900}
              sx={{
                fontSize: { xs: 22, sm: 26, md: 30 },
                letterSpacing: 0.5,
                mb: isMobile ? 0.5 : 0,
                flex: "none",
              }}
            >
              Top 3 Identified SKUs
            </Typography>
            {!isMobile && (
              <motion.div
                {...subtleMotion}
                style={{
                  display: "inline-block",
                  borderRadius: 50,
                  marginLeft: 24,
                  marginTop: 0,
                  width: "auto",
                }}
              >
                <Button
                  variant="contained"
                  sx={{
                    fontWeight: 700,
                    borderRadius: 50,
                    px: 4,
                    py: 1.2,
                    bgcolor: "#f9a825",
                    color: "#222",
                    fontSize: 16,
                    boxShadow: 2,
                    background:
                      "linear-gradient(90deg, #f9a825 60%, #ffd54f 100%)",
                    minWidth: 220,
                    "&:hover": {
                      bgcolor: "#fbc02d",
                      background:
                        "linear-gradient(90deg, #ffd54f 60%, #f9a825 100%)",
                      color: "#111",
                    },
                  }}
                  onClick={() => {
                    setResults([]);
                    localStorage.removeItem("searchResults");
                    localStorage.removeItem("searchPreview");
                    navigate("/feedback", { state: { image: preview } });
                  }}
                >
                  Not satisfied? Give Feedback
                </Button>
              </motion.div>
            )}
          </Box>
          <Grid container spacing={2} justifyContent="center">
            {results.map((res, idx) => (
              <Grid
                item
                xs={12}
                md={4}
                key={res.sku}
                sx={{
                  overflow: "visible",
                  ...(isMobile && {
                    px: 0,
                    mb: 1.2,
                  }),
                }}
              >
                <Card
                  component={motion.div}
                  whileHover={subtleMotion.whileHover}
                  sx={{
                    borderRadius: isMobile ? 2 : 4,
                    boxShadow: isMobile ? 1 : 4,
                    textAlign: "center",
                    minHeight: isMobile ? 90 : 180,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    background: isMobile
                      ? "#fff"
                      : "linear-gradient(135deg, #e3f2fd 0%, #f4f6fb 100%)",
                    border: isMobile
                      ? "1px solid #e0e0e0"
                      : "1.5px solid #e0e0e0",
                    p: isMobile ? 1.2 : 2,
                    overflow: "hidden",
                    transition: "background 0.2s",
                    cursor: "pointer",
                    width: isMobile ? "100%" : undefined,
                    mx: isMobile ? 0 : undefined,
                  }}
                  elevation={0}
                >
                  <CardContent
                    sx={{
                      width: "100%",
                      p: isMobile ? 1 : 2,
                      "&:last-child": { pb: isMobile ? "8px" : "16px" },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight={900}
                      sx={{
                        color: "#0057b8",
                        fontSize: isMobile ? 15 : 18,
                        mb: isMobile ? 0.2 : 0.5,
                        lineHeight: 1.1,
                      }}
                    >
                      {res.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{
                        color: "#222",
                        letterSpacing: 1,
                        fontSize: isMobile ? 13 : 16,
                        mb: isMobile ? 0.2 : 0.5,
                        lineHeight: 1.1,
                      }}
                    >
                      SKU: {res.sku}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{
                        color: "#388e3c",
                        fontSize: isMobile ? 12 : 15,
                        lineHeight: 1.1,
                      }}
                    >
                      Confidence: {(res.confidence * 100).toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {isMobile && (
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <motion.div
                {...subtleMotion}
                style={{ display: "inline-block", borderRadius: 50 }}
              >
                <Button
                  variant="contained"
                  sx={{
                    fontWeight: 700,
                    borderRadius: 50,
                    px: 4,
                    py: 1.2,
                    bgcolor: "#f9a825",
                    color: "#222",
                    fontSize: 16,
                    boxShadow: 2,
                    background:
                      "linear-gradient(90deg, #f9a825 60%, #ffd54f 100%)",
                    minWidth: 220,
                    width: "100%",
                    "&:hover": {
                      bgcolor: "#fbc02d",
                      background:
                        "linear-gradient(90deg, #ffd54f 60%, #f9a825 100%)",
                      color: "#111",
                    },
                  }}
                  onClick={() => {
                    setResults([]);
                    localStorage.removeItem("searchResults");
                    localStorage.removeItem("searchPreview");
                    navigate("/feedback", { state: { image: preview } });
                  }}
                >
                  Not satisfied? Give Feedback
                </Button>
              </motion.div>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
