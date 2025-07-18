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
  Divider,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useTheme } from "@mui/material/styles";

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
  const [error, setError] = useState("");
  const [showMore, setShowMore] = useState(false);
  const fileInputRef = useRef();
  const cameraInputRef = useRef();
  const resultsRef = useRef();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const showMoreRef = useRef();
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    localStorage.removeItem("searchPreview");
    localStorage.removeItem("searchResults");
    setPreview(null);
    setResults([]);
  }, []);

  const fetchResults = async (imageFile) => {
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
            ? `${import.meta.env.VITE_API_URL}/api/search`
            : "/api/search"
        }`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setResults(data.results || []);
        localStorage.setItem(
          "searchResults",
          JSON.stringify(data.results || [])
        );
        if (preview) localStorage.setItem("searchPreview", preview);
        if (!data.results || data.results.length === 0) {
          setLoading(false);
          return;
        }
      } else {
        setError(data.message || "Search failed.");
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  function resizeImage(file, maxWidth = 4000, maxHeight = 4000) {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = function () {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          file.type,
          0.95
        );
      };
      img.src = URL.createObjectURL(file);
    });
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    console.log("Selected file:", file);

    if (file) {
      const resizedBlob = await resizeImage(file, 4000, 4000);
      const resizedFile = new File([resizedBlob], file.name, {
        type: file.type,
      });
      setImage(resizedFile);
      const url = URL.createObjectURL(resizedFile);
      setPreview(url);
      setResults([]);
      setHasSearched(false);
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
    setResults([]);
    setHasSearched(true);
    await fetchResults(image);
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  const predictedSku =
    results && results.length > 0 ? results[0].sku_code : null;

  return (
    <Box>
      <Paper sx={{ maxWidth: 500, mx: "auto", p: 4, mb: 4 }}>
        <Typography variant="h6" fontWeight={700} mb={2} textAlign={"center"}>
          Search Product{" "}
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
      {error && (
        <Typography color="error" sx={{ textAlign: "center", mb: 2 }}>
          {error}
        </Typography>
      )}
      {results.length > 0 && (
        <Box ref={resultsRef}>
          {isMobile ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  mt: 6,
                  mb: 2,
                  gap: 2,
                  width: "100%",
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight={900}
                  sx={{
                    fontSize: 22,
                    letterSpacing: 0.5,
                    textAlign: "center",
                  }}
                >
                  Top identified SKU
                </Typography>

                <Card
                  component={motion.div}
                  whileHover={subtleMotion.whileHover}
                  sx={{
                    borderRadius: 2,
                    boxShadow: 1,
                    textAlign: "center",
                    minHeight: 90,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#fff",
                    border: "1px solid #e0e0e0",
                    p: 1.2,
                    overflow: "hidden",
                    transition: "background 0.2s",
                    cursor: "pointer",
                    width: "90%",
                    mx: "auto",
                  }}
                  elevation={0}
                >
                  <CardContent
                    sx={{
                      width: "100%",
                      p: 1,
                      "&:last-child": { pb: "8px" },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight={900}
                      sx={{
                        color: "#0057b8",
                        fontSize: 15,
                        mb: 0.2,
                        lineHeight: 1.1,
                      }}
                    >
                      {results[0].name}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{
                        color: "#222",
                        letterSpacing: 1,
                        fontSize: 13,
                        mb: 0.2,
                        lineHeight: 1.1,
                      }}
                    >
                      SKU: {results[0].sku_code}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{
                        color: "#388e3c",
                        fontSize: 12,
                        lineHeight: 1.1,
                      }}
                    >
                      Confidence:{" "}
                      {results[0].similarity_score !== undefined
                        ? `${(results[0].similarity_score * 100).toFixed(2)}%`
                        : "N/A"}
                    </Typography>
                  </CardContent>
                </Card>

                {results.length > 1 && !showMore && (
                  <Button
                    variant="outlined"
                    sx={{
                      borderRadius: 50,
                      fontWeight: 700,
                      px: 4,
                      py: 1.2,
                      minWidth: 140,
                      mt: 2,
                      whiteSpace: "nowrap",
                    }}
                    onClick={() => {
                      setShowMore(true);
                      setTimeout(() => {
                        if (showMoreRef.current) {
                          showMoreRef.current.scrollIntoView({
                            behavior: "smooth",
                          });
                        }
                      }, 100);
                    }}
                  >
                    View More
                  </Button>
                )}
              </Box>

              {showMore && (
                <Grid
                  container
                  spacing={2}
                  sx={{
                    mt: 0,
                    px: 2,
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                  ref={showMoreRef}
                >
                  {results.slice(1).length === 0 ? (
                    <Grid item xs={12}>
                      <Typography
                        color="text.secondary"
                        sx={{
                          textAlign: "center",
                          fontSize: 15,
                          mt: 2,
                          mb: 2,
                        }}
                      >
                        No more results found.
                      </Typography>
                    </Grid>
                  ) : (
                    results.slice(1).map((res, idx) => (
                      <Grid item xs={12} key={res.sku_code || idx + 1}>
                        <Card
                          component={motion.div}
                          whileHover={subtleMotion.whileHover}
                          sx={{
                            borderRadius: 2,
                            boxShadow: 1,
                            textAlign: "center",
                            minHeight: 90,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            background: "#fff",
                            border: "1px solid #e0e0e0",
                            p: 1.2,
                            overflow: "hidden",
                            transition: "background 0.2s",
                            cursor: "pointer",
                          }}
                          elevation={0}
                        >
                          <CardContent
                            sx={{
                              width: "100%",
                              p: 1,
                              "&:last-child": { pb: "8px" },
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight={900}
                              sx={{
                                color: "#0057b8",
                                fontSize: 15,
                                mb: 0.2,
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
                                fontSize: 13,
                                mb: 0.2,
                                lineHeight: 1.1,
                              }}
                            >
                              SKU: {res.sku_code}
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{
                                color: "#388e3c",
                                fontSize: 12,
                                lineHeight: 1.1,
                              }}
                            >
                              Confidence:{" "}
                              {res.similarity_score !== undefined
                                ? `${(res.similarity_score * 100).toFixed(2)}%`
                                : "N/A"}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  )}
                  <Grid
                    item
                    xs={12}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mt: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                      sx={{
                        borderRadius: 50,
                        fontWeight: 700,
                        px: 4,
                        py: 1.2,
                        minWidth: 140,
                        whiteSpace: "nowrap",
                      }}
                      onClick={() => setShowMore(false)}
                    >
                      Hide
                    </Button>
                  </Grid>
                </Grid>
              )}

              <Box sx={{ textAlign: "center", mt: 4 }}>
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
                    width: "90%",
                    maxWidth: 320,
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
                    if (predictedSku) {
                      navigate("/feedback", {
                        state: {
                          image: preview,
                          predictedSku,
                        },
                      });
                    }
                  }}
                  disabled={!predictedSku}
                >
                  Not satisfied? Give Feedback
                </Button>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                mt: 6,
                mb: 3,
                gap: 2,
                width: "100%",
                position: "relative",
              }}
            >
              <Typography
                variant="h5"
                fontWeight={900}
                sx={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: { sm: 26, md: 30 },
                  letterSpacing: 0.5,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              >
                Top identified SKU
              </Typography>

              <Box sx={{ flexGrow: 1 }} />

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
                  ml: 2,
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
                  if (predictedSku) {
                    navigate("/feedback", {
                      state: { image: preview, predictedSku },
                    });
                  }
                }}
                disabled={!predictedSku}
              >
                Not satisfied? Give Feedback
              </Button>
            </Box>
          )}
          {!isMobile && (
            <Grid
              container
              spacing={2}
              justifyContent="center"
              alignItems="stretch"
            >
              <Grid
                item
                xs={12}
                md={4}
                key={results[0].sku_code || 0}
                sx={{
                  overflow: "visible",
                  ...(isMobile && {
                    px: 0,
                    mb: 1.2,
                  }),
                  display: "flex",
                  alignItems: "center",
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
                      {results[0].name}
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
                      SKU: {results[0].sku_code}
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
                      Confidence:{" "}
                      {results[0].similarity_score !== undefined
                        ? `${(results[0].similarity_score * 100).toFixed(2)}%`
                        : "N/A"}{" "}
                    </Typography>
                  </CardContent>
                </Card>
                {!isMobile && results.length > 1 && !showMore && (
                  <Button
                    variant="outlined"
                    sx={{
                      borderRadius: 50,
                      fontWeight: 700,
                      px: 4,
                      py: 1.2,
                      minWidth: 140,
                      ml: 2,
                      mt: 0,
                      whiteSpace: "nowrap",
                      alignSelf: "center",
                    }}
                    onClick={() => setShowMore(true)}
                  >
                    View More
                  </Button>
                )}
              </Grid>
              {isMobile && results.length > 1 && !showMore && (
                <Grid
                  item
                  xs={12}
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    mt: 1,
                  }}
                >
                  <Button
                    variant="outlined"
                    sx={{
                      borderRadius: 50,
                      fontWeight: 700,
                      px: 4,
                      py: 1.2,
                      minWidth: 140,
                      mt: isMobile ? 2 : 0,
                      whiteSpace: "nowrap",
                    }}
                    onClick={() => setShowMore(true)}
                  >
                    View More
                  </Button>
                </Grid>
              )}
              {results.length > 1 && showMore && (
                <>
                  <Grid
                    item
                    xs={12}
                    md="auto"
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "stretch",
                      height: isMobile ? "auto" : "100%",
                      my: isMobile ? 2 : 0,
                    }}
                  >
                    <Divider
                      orientation={isMobile ? "horizontal" : "vertical"}
                      flexItem
                      sx={{
                        borderColor: "#bdbdbd",
                        borderWidth: 2,
                        borderRadius: 2,
                        background:
                          "linear-gradient(180deg, #e3f2fd 0%, #f4f6fb 100%)",
                        minHeight: isMobile ? 0 : 180,
                        minWidth: isMobile ? "90%" : 0,
                      }}
                    />
                  </Grid>
                  {results.slice(1, 3).map((res, idx) => (
                    <Grid
                      item
                      xs={12}
                      md={4}
                      key={res.sku_code || idx + 1}
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
                            SKU: {res.sku_code}
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
                            Confidence:{" "}
                            {res.similarity_score !== undefined
                              ? `${(res.similarity_score * 100).toFixed(2)}%`
                              : "N/A"}{" "}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                  <Grid
                    item
                    xs={12}
                    md="auto"
                    sx={{
                      display: "flex",
                      justifyContent: isMobile ? "flex-end" : "flex-end",
                      alignItems: "center",
                      mt: isMobile ? 1 : 0,
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        mt: 2,
                      }}
                    >
                      <Button
                        variant="outlined"
                        sx={{
                          borderRadius: 50,
                          fontWeight: 700,
                          px: 4,
                          py: 1.2,
                          minWidth: 140,
                          whiteSpace: "nowrap",
                        }}
                        onClick={() => setShowMore(false)}
                      >
                        Hide
                      </Button>
                    </Box>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </Box>
      )}
      {!loading && results.length === 0 && image && hasSearched && (
        <Typography
          color="text.secondary"
          sx={{ textAlign: "center", mt: 4, fontSize: 18, fontWeight: 500 }}
        >
          No results found. Please try another image.
        </Typography>
      )}
    </Box>
  );
}
