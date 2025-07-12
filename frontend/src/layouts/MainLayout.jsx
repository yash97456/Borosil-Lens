import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
  Stack,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import UploadIcon from "@mui/icons-material/CloudUpload";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useState } from "react";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";

const navItems = [
  { text: "Home", icon: <DashboardIcon />, path: "/" },
  { text: "Upload Image", icon: <UploadIcon />, path: "/upload" },
  { text: "Search Product", icon: <SearchIcon />, path: "/search" },
  { text: "User Panel", icon: <PersonIcon />, path: "/user-panel" },
];

const subtleMotion = {
  whileHover: {
    y: -2,
    scale: 1.025,
    boxShadow: "0 2px 12px 0 rgba(0,0,0,0.08)",
    transition: { type: "spring", stiffness: 300, damping: 22 },
  },
};

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // --- Dummy flow ---
  /*
  const userId = "emp";
  */

  const userId = localStorage.getItem("userId") || "Guest";

  const [anchorEl, setAnchorEl] = useState(null);
  const openProfileMenu = Boolean(anchorEl);
  const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleProfileClose = () => setAnchorEl(null);

  const handleSignOut = () => {
    handleProfileClose();
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  const drawer = (
    <Box
      sx={{
        width: 260,
        bgcolor: "#f4f6fb",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 0,
      }}
      role="presentation"
      onClick={handleDrawerToggle}
    >
      <Box
        sx={{
          py: 3,
          px: 2,
          textAlign: "center",
          bgcolor: "#fff",
          borderBottom: "1.5px solid #e0e0e0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={logo}
          alt="Borosil Logo"
          style={{ height: 44, marginBottom: 12 }}
        />
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            letterSpacing: 1.5,
            color: "#0057b8",
            fontSize: 20,
            mt: 1.2,
            mb: 0,
            lineHeight: 1.2,
          }}
        >
          BOROSIL LENS
        </Typography>
      </Box>
      <List sx={{ flex: 1, py: 2 }}>
        {navItems.map((item) => (
          <motion.div
            key={item.text}
            whileHover={{
              scale: 1.04,
              x: 6,
              boxShadow: "0 4px 16px 0 rgba(0,87,184,0.08)",
            }}
            style={{ borderRadius: 14, marginBottom: 6 }}
          >
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 14,
                  mx: 1,
                  my: 0.5,
                  py: 1.2,
                  px: 2,
                  bgcolor:
                    location.pathname === item.path ? "primary.main" : "#fff",
                  color: location.pathname === item.path ? "#fff" : "#213547",
                  boxShadow:
                    location.pathname === item.path
                      ? "0 2px 12px 0 rgba(0,87,184,0.10)"
                      : "none",
                  transition: "all 0.18s",
                  "&:hover": {
                    bgcolor: "linear-gradient(90deg,#e3f2fd 60%,#bbdefb 100%)",
                    color: "#0057b8",
                  },
                  "&.Mui-selected, &.Mui-selected:hover, &:focus": {
                    bgcolor: "primary.main",
                    color: "#fff",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 38,
                    color: location.pathname === item.path ? "#fff" : "#0057b8",
                    fontSize: 26,
                    mr: 1,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 700 : 600,
                    fontSize: 17,
                    letterSpacing: 0.5,
                    color: location.pathname === item.path ? "#fff" : "#213547",
                  }}
                />
              </ListItemButton>
            </ListItem>
          </motion.div>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1201,
          bgcolor: "background.paper",
          color: "primary.main",
          boxShadow: 2,
        }}
      >
        <Toolbar
          sx={{
            minHeight: 64,
            px: 2,
            display: "flex",
            alignItems: "center",
            position: "relative",
            justifyContent: "flex-start",
          }}
        >
          {isMobile ? (
            <>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 0,
                  position: "relative",
                }}
              >
                <Box
                  component="img"
                  src={logo}
                  alt="Borosil Logo"
                  sx={{
                    height: 38,
                    width: "auto",
                    cursor: "pointer",
                    display: "block",
                  }}
                  onClick={() => navigate("/")}
                />
                <Typography
                  variant="h6"
                  sx={{
                    display: { xs: "none", md: "block" },
                    fontWeight: 900,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: "#111",
                    fontSize: 20,
                    textAlign: "center",
                    flex: 1,
                    mx: 2,
                    userSelect: "none",
                  }}
                >
                  BOROSIL LENS
                </Typography>
                <IconButton
                  color="primary"
                  edge="end"
                  onClick={handleDrawerToggle}
                  sx={{
                    position: "absolute",
                    right: 44,
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: { md: "none" },
                    zIndex: 2,
                  }}
                >
                  <MenuIcon sx={{ fontSize: 32 }} />
                </IconButton>
                <IconButton
                  color="primary"
                  onClick={handleProfileClick}
                  sx={{
                    position: "absolute",
                    right: -10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 2,
                  }}
                  aria-controls={openProfileMenu ? "profile-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={openProfileMenu ? "true" : undefined}
                >
                  <AccountCircleIcon sx={{ fontSize: 32 }} />
                </IconButton>
              </Box>
            </>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  ml: 1.5,
                  mr: 2,
                  minWidth: 160,
                }}
              >
                <Box
                  component="img"
                  src={logo}
                  alt="Borosil Logo"
                  sx={{ height: 40, width: "auto", cursor: "pointer" }}
                  onClick={() => navigate("/")}
                />
              </Box>
              <Box
                sx={{
                  flex: "0 0 auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 0,
                  mx: 2,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: "#111",
                    fontSize: { xs: 20, sm: 26, md: 32 },
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    userSelect: "none",
                  }}
                >
                  BOROSIL LENS
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  minWidth: 160,
                  ml: 2,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  {navItems.map((item) => (
                    <motion.div
                      key={item.text}
                      whileHover={{
                        y: -2,
                        scale: 1.025,
                        boxShadow: "0 2px 12px 0 rgba(0,0,0,0.08)",
                        borderRadius: 50,
                      }}
                      style={{
                        borderRadius: 50,
                        display: "inline-block",
                        background: "transparent",
                      }}
                    >
                      <Button
                        color={
                          location.pathname === item.path
                            ? "primary"
                            : "inherit"
                        }
                        variant={
                          location.pathname === item.path ? "contained" : "text"
                        }
                        startIcon={item.icon}
                        onClick={() => navigate(item.path)}
                        sx={{
                          fontWeight: 700,
                          borderRadius: 50,
                          px: 2.5,
                          bgcolor:
                            location.pathname === item.path
                              ? "primary.main"
                              : "transparent",
                          color:
                            location.pathname === item.path ? "#fff" : "#222",
                          boxShadow: "none",
                          transition: "background 0.18s, color 0.18s",
                          "&:hover": {
                            bgcolor: "#f5f5f5",
                            color: "primary.main",
                            boxShadow: "none",
                          },
                        }}
                      >
                        {item.text}
                      </Button>
                    </motion.div>
                  ))}
                  <IconButton
                    color="primary"
                    onClick={handleProfileClick}
                    sx={{
                      ml: 1,
                      mr: 0.5,
                      borderRadius: 50,
                      bgcolor: openProfileMenu ? "#e3f2fd" : "transparent",
                      transition: "background 0.18s",
                    }}
                    aria-controls={openProfileMenu ? "profile-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={openProfileMenu ? "true" : undefined}
                  >
                    <AccountCircleIcon sx={{ fontSize: 32 }} />
                  </IconButton>
                </Stack>
              </Box>
            </>
          )}
          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            open={openProfileMenu}
            onClose={handleProfileClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              sx: {
                borderRadius: 2,
                minWidth: 180,
                boxShadow: 4,
                mt: 1,
              },
            }}
          >
            <MenuItem
              sx={{
                justifyContent: "center",
                pointerEvents: "none",
                opacity: 1,
              }}
            >
              <Box sx={{ fontWeight: 900, fontSize: 16, color: "#111" }}>
                User: {userId}
              </Box>
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              onClick={handleSignOut}
              sx={{
                fontWeight: 700,
                color: "#d32f2f",
                justifyContent: "center",
              }}
            >
              Sign Out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 260,
            bgcolor: "#f4f6fb",
            borderRight: "1.5px solid #e0e0e0",
          },
        }}
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
          width: "100%",
          mt: 8,
          bgcolor: "background.default",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
