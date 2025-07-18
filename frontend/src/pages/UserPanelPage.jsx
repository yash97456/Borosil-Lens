import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Avatar,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  IconButton,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { Snackbar, Alert } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import TableContainer from "@mui/material/TableContainer";

const uploadedImage = localStorage.getItem("uploadedImage");

export default function UserPanelPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    role: "",
  });
  const username = localStorage.getItem("username") || userForm.username || "";
  const [showPwdDialog, setShowPwdDialog] = useState(false);
  const [pwdForm, setPwdForm] = useState({ oldPwd: "", newPwd: "" });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [role, setRole] = useState(
    () => localStorage.getItem("role") || "User"
  );

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.down("md"));
  const [openImgModal, setOpenImgModal] = useState(false);
  const [modalImgSrc, setModalImgSrc] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editPwd, setEditPwd] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [userDialogLoading, setUserDialogLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const modalPaperSx = {
    borderRadius: 4,
    p: 2,
    background: "#fff",
    minWidth: { xs: 260, sm: 340 },
    maxWidth: { xs: "90vw", sm: 400 },
    minHeight: { xs: 240, sm: 340 },
    maxHeight: { xs: "90vh", sm: 500 },
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    mx: "auto",
    my: "auto",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    boxShadow: 24,
    outline: "none",
  };

  const apiBase = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      const url = apiBase + "/api/admin/users";
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(
          data.users.map((u) => ({
            ...u,
            userId: u.id,
          }))
        );
      }
      setLoadingUsers(false);
    };
    const fetchFeedbacks = async () => {
      setLoadingFeedbacks(true);
      try {
        const url = apiBase + "/api/feedback/pending";
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok && data.feedbacks) {
          setFeedbacks(
            data.feedbacks.map((fb) => ({
              id: fb.feedback_id,
              suggestedCode: fb.correct_sku,
              user: fb.username,
              date: fb.complaint_time
                ? (() => {
                    const d = new Date(fb.complaint_time.replace(" ", "T"));
                    return `${d.getDate().toString().padStart(2, "0")}-${(
                      d.getMonth() + 1
                    )
                      .toString()
                      .padStart(2, "0")}-${d.getFullYear()}`;
                  })()
                : "",
              image: fb.image_data
                ? `data:image/jpeg;base64,${fb.image_data}`
                : null,
            }))
          );
        }
      } catch {}
      setLoadingFeedbacks(false);
    };
    fetchUsers();
    fetchFeedbacks();
    // eslint-disable-next-line
  }, []);

  const handleApprove = (id) => {
    setConfirmAction("approve");
    setSelectedFeedback(id);
    setConfirmOpen(true);
  };
  const handleReject = (id) => {
    setConfirmAction("reject");
    setSelectedFeedback(id);
    setConfirmOpen(true);
  };

  const handleDeleteUser = async (userId, silent = false) => {
    if (
      !silent &&
      !window.confirm("Are you sure you want to delete this user?")
    )
      return;
    try {
      const res = await fetch(apiBase + "/api/admin/user/" + userId, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.userId !== userId));
        setSnackbar({
          open: true,
          message: "User deleted",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Delete failed",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Delete failed", severity: "error" });
    }
  };

  const handleConfirm = async () => {
    if (
      (confirmAction === "approve" || confirmAction === "reject") &&
      selectedFeedback
    ) {
      try {
        const res = await fetch(apiBase + "/api/admin/feedback/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feedbackId: selectedFeedback,
            approve: confirmAction === "approve",
            adminName: username,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setFeedbacks((fbs) => fbs.filter((fb) => fb.id !== selectedFeedback));
          setSnackbar({
            open: true,
            message: data.message || "Feedback updated",
            severity: "success",
          });
        } else {
          setSnackbar({
            open: true,
            message: data.message || "Action failed",
            severity: "error",
          });
        }
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Network error",
          severity: "error",
        });
      }
    } else if (confirmAction === "deleteUser" && userToDelete) {
      await handleDeleteUser(userToDelete.userId, true);
    }
    setConfirmOpen(false);
    setSelectedFeedback(null);
    setConfirmAction(null);
    setUserToDelete(null);
  };

  const handlePwdChange = (e) =>
    setPwdForm({ ...pwdForm, [e.target.name]: e.target.value });

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(apiBase + "/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: localStorage.getItem("userId"),
          oldPwd: pwdForm.oldPwd,
          newPwd: pwdForm.newPwd,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSnackbar({
          open: true,
          message: "Password changed!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Change failed",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Network error", severity: "error" });
    }
    setShowPwdDialog(false);
    setPwdForm({ oldPwd: "", newPwd: "" });
  };

  const handleUserFormChange = (e) =>
    setUserForm({ ...userForm, [e.target.name]: e.target.value });

  const handleEditPwdChange = (e) => setEditPwd(e.target.value);

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserDialogLoading(true);
    try {
      const roleMap = { User: 3, Moderator: 2, Admin: 1 };
      const res = await fetch(apiBase + "/api/admin/user", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEditMode
            ? {
                id: userForm.userId,
                ...(editPwd && editPwd.trim() !== ""
                  ? { password: editPwd }
                  : {}),
                role_id: roleMap[userForm.role],
              }
            : {
                username: userForm.username,
                password: userForm.password,
                role_id: roleMap[userForm.role],
              }
        ),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSnackbar({
          open: true,
          message: isEditMode ? "User Updated" : "User Created",
          severity: "success",
        });
        const usersRes = await fetch(apiBase + "/api/admin/users");
        const usersData = await usersRes.json();
        if (usersRes.ok && usersData.success) {
          setUsers(
            usersData.users.map((u) => ({
              ...u,
              userId: u.id,
            }))
          );
        }
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Action failed",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Network error", severity: "error" });
    }
    setShowUserDialog(false);
    setUserForm({ username: "", password: "", role: "" });
    setIsEditMode(false);
    setEditPwd("");
    setUserDialogLoading(false);
  };

  return (
    <Box
      sx={{
        maxWidth: "100vw",
        overflowX: "hidden",
        px: { xs: 0.5, sm: 1, md: 2 },
        py: { xs: 1, sm: 2 },
      }}
    >
      {role === "User" && (
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 3,
            mt: 2,
            maxWidth: 400,
            mx: "auto",
            textAlign: "center",
            borderRadius: 3,
            background: "#f5f7fa",
          }}
        >
          <Avatar
            sx={{
              width: 56,
              height: 56,
              mx: "auto",
              mb: 1,
              bgcolor: "#1976d2",
              fontWeight: 700,
              fontSize: 28,
            }}
          >
            {username ? username[0].toUpperCase() : "U"}
          </Avatar>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Welcome, {username || "User"}!
          </Typography>
        </Paper>
      )}

      <Stack
        direction={isXs ? "column" : "row"}
        spacing={2}
        mb={3}
        justifyContent="center"
        alignItems="center"
      >
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setShowPwdDialog(true)}
          sx={{
            fontWeight: 700,
            fontSize: isXs ? 15 : 16,
            px: isXs ? 2 : 3,
            borderRadius: 3,
            width: isXs ? "100%" : "auto",
          }}
          fullWidth={isXs}
        >
          Change Password
        </Button>
        {role === "Admin" && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              setUserForm({ username: "", password: "", role: "" });
              setIsEditMode(false);
              setEditPwd("");
              setShowUserDialog(true);
            }}
            sx={{
              fontWeight: 700,
              fontSize: isXs ? 15 : 16,
              px: isXs ? 2 : 3,
              borderRadius: 3,
              width: isXs ? "100%" : "auto",
            }}
            fullWidth={isXs}
          >
            Create User
          </Button>
        )}
      </Stack>
      <Dialog
        open={showPwdDialog}
        onClose={() => setShowPwdDialog(false)}
        disableScrollLock
        PaperProps={{
          sx: modalPaperSx,
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        fullScreen={false}
        maxWidth={false}
        scroll="body"
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: isXs ? 18 : 22,
            pb: 0,
            pr: 4,
            width: "100%",
          }}
        >
          Change Password
        </DialogTitle>
        <form onSubmit={handlePwdSubmit} style={{ width: "100%" }}>
          <DialogContent sx={{ pt: 1, width: "100%" }}>
            <TextField
              label="Old Password"
              name="oldPwd"
              type="password"
              value={pwdForm.oldPwd}
              onChange={handlePwdChange}
              fullWidth
              margin="normal"
              required
              sx={{ borderRadius: 2 }}
              size={isXs ? "small" : "medium"}
            />
            <TextField
              label="New Password"
              name="newPwd"
              type="password"
              value={pwdForm.newPwd}
              onChange={handlePwdChange}
              fullWidth
              margin="normal"
              required
              sx={{ borderRadius: 2 }}
              size={isXs ? "small" : "medium"}
            />
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              onClick={() => setShowPwdDialog(false)}
              variant="outlined"
              color="primary"
              sx={{ borderRadius: 3, minWidth: 100, fontWeight: 700 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ borderRadius: 3, minWidth: 100, fontWeight: 700 }}
            >
              Change
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog
        open={showUserDialog}
        disableScrollLock
        onClose={() => {
          setShowUserDialog(false);
          setIsEditMode(false);
          setEditPwd("");
        }}
        PaperProps={{
          sx: modalPaperSx,
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        fullScreen={false}
        maxWidth={false}
        scroll="body"
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: isXs ? 18 : 22,
            pb: 0,
            pr: 4,
            width: "100%",
          }}
        >
          {isEditMode ? "Edit User " : "Create User"}
        </DialogTitle>
        <form onSubmit={handleUserSubmit} style={{ width: "100%" }}>
          <DialogContent sx={{ pt: 1, width: "100%" }}>
            <TextField
              label="Username"
              name="username"
              value={userForm.username}
              onChange={handleUserFormChange}
              fullWidth
              margin="normal"
              required
              size={isXs ? "small" : "medium"}
              disabled={isEditMode}
              sx={{
                borderRadius: 2,
                "& .MuiInputBase-input.Mui-disabled": {
                  color: "#222 !important",
                  WebkitTextFillColor: "#222 !important",
                  fontWeight: 600,
                  opacity: 1,
                  background: "#f5f5f5",
                  textAlign: "center",
                },
                "& .MuiInputLabel-root.Mui-disabled": {
                  color: "#222 !important",
                  fontWeight: 700,
                  opacity: 1,
                },
              }}
            />
            {!isEditMode && (
              <TextField
                label="Password"
                name="password"
                type="password"
                value={userForm.password}
                onChange={handleUserFormChange}
                fullWidth
                margin="normal"
                required
                size={isXs ? "small" : "medium"}
                autoComplete="new-password"
                sx={{ borderRadius: 2 }}
              />
            )}
            <TextField
              label="Role"
              name="role"
              value={userForm.role}
              onChange={handleUserFormChange}
              select
              fullWidth
              margin="normal"
              required
              size={isXs ? "small" : "medium"}
              SelectProps={{
                native: false,
                MenuProps: {
                  PaperProps: {
                    sx: {
                      borderRadius: 2,
                      boxShadow: 6,
                      bgcolor: "#f9f9fb",
                      "& .MuiMenuItem-root": {
                        fontWeight: 600,
                        fontSize: isXs ? 14 : 16,
                        color: "#222",
                        justifyContent: "center",
                        "&.Mui-selected": {
                          bgcolor: "#e3f2fd",
                          color: "#1976d2",
                        },
                        "&:hover": {
                          bgcolor: "#e3f2fd",
                          color: "#1976d2",
                        },
                      },
                    },
                  },
                },
                sx: {
                  fontWeight: 600,
                  bgcolor: "#f5f7fa",
                  borderRadius: 2,
                  "& .MuiSelect-icon": {
                    color: "#1976d2",
                  },
                },
              }}
              sx={{
                borderRadius: 2,
                background: "#f5f7fa",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#bdbdbd",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#1976d2",
                },
                "& .MuiSelect-select": {
                  fontWeight: 600,
                  color: "#1976d2",
                  display: "flex",
                  justifyContent: "center",
                  textAlign: "center",
                },
              }}
            >
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Moderator">Moderator</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </TextField>
            {isEditMode && (
              <TextField
                label="Change Password"
                name="editPwd"
                type="password"
                value={editPwd}
                onChange={handleEditPwdChange}
                fullWidth
                margin="normal"
                sx={{ borderRadius: 2 }}
                size={isXs ? "small" : "medium"}
                autoComplete="new-password"
                disabled={userForm.role === "Admin"}
              />
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              onClick={() => {
                setShowUserDialog(false);
                setIsEditMode(false);
                setEditPwd("");
              }}
              variant="outlined"
              color="primary"
              sx={{ borderRadius: 3, minWidth: 100, fontWeight: 700 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                borderRadius: 3,
                minWidth: 100,
                fontWeight: 700,
                position: "relative",
              }}
              disabled={userDialogLoading}
            >
              {userDialogLoading ? (
                <CircularProgress size={22} sx={{ color: "#fff" }} />
              ) : isEditMode ? (
                "Save"
              ) : (
                "Save"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog
        open={confirmOpen}
        disableScrollLock
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          sx: {
            ...modalPaperSx,
            gap: { xs: 0, md: 1 },
          },
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        fullScreen={false}
        maxWidth={false}
        scroll="body"
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: isXs ? 16 : 20,
            pr: 4,
            width: "100%",
            pb: 0,
          }}
        >
          {confirmAction === "approve"
            ? "Approve"
            : confirmAction === "reject"
            ? "Reject"
            : confirmAction === "deleteUser"
            ? "Delete User"
            : ""}
          <IconButton
            aria-label="close"
            onClick={() => setConfirmOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
              display: { xs: "inline-flex", sm: "none" },
            }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            width: "100%",
            px: 0,
            pt: { xs: 1, md: 0 },
            pb: { xs: 0, md: 0 },
            minHeight: 0,
          }}
        >
          <Typography align="center" sx={{ mb: 0, mt: 0, lineHeight: 1.2 }}>
            {confirmAction === "deleteUser"
              ? `Are you sure you want to delete the user?`
              : `Are you sure you want to ${confirmAction} this feedback?`}
          </Typography>
          {confirmAction === "deleteUser" && userToDelete && (
            <Box sx={{ mt: 2, mb: 1, textAlign: "center" }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, fontSize: { xs: 15, md: 18 } }}
              >
                User ID:{" "}
                <span style={{ fontWeight: 400 }}>{userToDelete.username}</span>
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, fontSize: { xs: 15, md: 18 } }}
              >
                Role:{" "}
                <span style={{ fontWeight: 400 }}>{userToDelete.role}</span>
              </Typography>
            </Box>
          )}
          {(confirmAction === "approve" || confirmAction === "reject") &&
            (() => {
              const fb = feedbacks.find((f) => f.id === selectedFeedback);
              if (!fb) return null;
              return (
                <Box sx={{ mt: 2, mb: 1, textAlign: "center" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, fontSize: { xs: 15, md: 18 } }}
                  >
                    Code:{" "}
                    <span style={{ fontWeight: 400 }}>{fb.suggestedCode}</span>
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, fontSize: { xs: 15, md: 18 } }}
                  >
                    User: <span style={{ fontWeight: 400 }}>{fb.user}</span>
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, fontSize: { xs: 15, md: 18 } }}
                  >
                    Date: <span style={{ fontWeight: 400 }}>{fb.date}</span>
                  </Typography>
                </Box>
              );
            })()}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            px: 0,
            pt: { xs: 1, md: 0 },
            pb: { xs: 0.5, md: 0 },
            mt: 0,
            minHeight: 0,
          }}
        >
          <Button
            onClick={() => setConfirmOpen(false)}
            variant="outlined"
            color="primary"
            sx={{ borderRadius: 3, minWidth: 100, fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={confirmAction === "approve" ? "success" : "error"}
            sx={{ borderRadius: 3, minWidth: 100, fontWeight: 700 }}
          >
            {confirmAction === "approve"
              ? "Approve"
              : confirmAction === "reject"
              ? "Reject"
              : confirmAction === "deleteUser"
              ? "Delete User"
              : ""}{" "}
          </Button>
        </DialogActions>
      </Dialog>
      {role === "Admin" && (
        <>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            mb={2}
            sx={{
              textAlign: "center",
              fontSize: isXs ? 16 : 20,
              letterSpacing: 0.5,
              mt: 4,
            }}
          >
            Assign Permissions
          </Typography>
          <Paper
            sx={{
              p: { xs: 1, sm: 2 },
              mt: 0,
              mb: 3,
              overflowX: "auto",
              width: "100%",
            }}
          >
            <Table
              size={isXs ? "small" : "medium"}
              sx={{
                minWidth: 320,
                borderRadius: { xs: 1, sm: 3 },
                overflow: "hidden",
                boxShadow: 2,
                "& .MuiTableHead-root": {
                  background: "#e3f2fd",
                },
                "& .MuiTableCell-head": {
                  background: "#e3f2fd",
                  color: "#1976d2",
                  fontWeight: 800,
                  fontSize: isXs ? 14 : 16,
                  borderBottom: "2px solid #90caf9",
                },
                "& .MuiTableRow-root": {
                  transition: "background 0.2s",
                  "&:hover": {
                    background: "#f1f8e9",
                  },
                },
                "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)": {
                  background: "#f9f9fb",
                },
                "& .MuiTableCell-root": {
                  fontSize: isXs ? 13 : 15,
                  px: isXs ? 1 : 2,
                  py: isXs ? 0.5 : 1.2,
                  borderBottom: "1px solid #e0e0e0",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, borderRight: "2px solid #bbdefb" }}
                  >
                    Username
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, borderRight: "2px solid #bbdefb" }}
                  >
                    Role
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, borderRight: "2px solid #bbdefb" }}
                  >
                    Actions
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Delete
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingUsers ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Box
                        sx={{
                          py: 3,
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <CircularProgress size={36} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography
                        color="text.secondary"
                        fontWeight={700}
                        fontSize={isXs ? 14 : 16}
                      >
                        No users found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.userId}>
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: "2px solid #bbdefb",
                          fontWeight: 700,
                          color: "#1976d2",
                        }}
                      >
                        {u.username}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ borderRight: "2px solid #bbdefb" }}
                      >
                        {u.role}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ borderRight: "2px solid #bbdefb" }}
                      >
                        <Button
                          size={isXs ? "small" : "medium"}
                          onClick={() => {
                            setUserForm(u);
                            setEditPwd("");
                            setIsEditMode(true);
                            setShowUserDialog(true);
                          }}
                          sx={{
                            fontSize: isXs ? 13 : 15,
                            px: isXs ? 1.5 : 2,
                          }}
                          disabled={u.role === "Admin"}
                        >
                          Edit
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          disabled={u.role === "Admin"}
                          onClick={() => {
                            setUserToDelete(u);
                            setConfirmAction("deleteUser");
                            setConfirmOpen(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
      {(role === "Moderator" || role === "Admin") && (
        <>
          <Typography
            variant="h6"
            fontWeight={700}
            mb={2}
            sx={{
              textAlign: "center",
              fontSize: isXs ? 17 : 22,
              letterSpacing: 0.5,
              mt: 4,
            }}
          >
            Feedback Approval
          </Typography>
          <Paper
            sx={{
              p: { xs: 1, sm: 2 },
              mb: 3,
              overflowX: "auto",
              width: "100%",
            }}
          >
            <Table
              size={isXs ? "small" : "medium"}
              sx={{
                minWidth: 400,
                borderRadius: { xs: 1, sm: 3 },
                overflow: "hidden",
                boxShadow: 2,
                "& .MuiTableHead-root": {
                  background: "#e3f2fd",
                },
                "& .MuiTableCell-head": {
                  background: "#e3f2fd",
                  color: "#1976d2",
                  fontWeight: 800,
                  fontSize: isXs ? 14 : 16,
                  borderBottom: "2px solid #90caf9",
                },
                "& .MuiTableRow-root": {
                  transition: "background 0.2s",
                  "&:hover": {
                    background: "#fffde7",
                  },
                },
                "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)": {
                  background: "#f9f9fb",
                },
                "& .MuiTableCell-root": {
                  fontSize: isXs ? 13 : 15,
                  px: isXs ? 1 : 2,
                  py: isXs ? 0.5 : 1.2,
                  borderBottom: "1px solid #e0e0e0",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, borderRight: "2px solid #bbdefb" }}
                  >
                    Image
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, borderRight: "2px solid #bbdefb" }}
                  >
                    Suggested Code
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, borderRight: "2px solid #bbdefb" }}
                  >
                    User
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, borderRight: "2px solid #bbdefb" }}
                  >
                    Date
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingFeedbacks ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Box
                        sx={{
                          py: 3,
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <CircularProgress size={36} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {feedbacks.map((fb) => (
                      <TableRow key={fb.id}>
                        <TableCell
                          align="center"
                          sx={{ borderRight: "2px solid #bbdefb" }}
                        >
                          <Box
                            sx={{
                              width: isXs ? 60 : 90,
                              height: isXs ? 60 : 90,
                              mx: "auto",
                              borderRadius: 2,
                              overflow: "hidden",
                              boxShadow: 1,
                              background: "#fafafa",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "box-shadow 0.2s",
                              "&:hover": { boxShadow: 6 },
                            }}
                            onClick={() => {
                              setModalImgSrc(fb.image);
                              setOpenImgModal(true);
                            }}
                          >
                            <img
                              src={fb.image}
                              alt="Feedback"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                display: "block",
                                background: "#fff",
                              }}
                            />
                          </Box>
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{
                            borderRight: "2px solid #bbdefb",
                            fontWeight: 700,
                            color: "#388e3c",
                          }}
                        >
                          {fb.suggestedCode}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            borderRight: "2px solid #bbdefb",
                            fontWeight: 700,
                            color: "#388e3c",
                          }}
                        >
                          {fb.user}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            borderRight: "2px solid #bbdefb",
                            fontWeight: 700,
                            color: "#388e3c",
                          }}
                        >
                          {fb.date}
                        </TableCell>
                        <TableCell align="center">
                          <Stack
                            direction={isXs ? "column" : "row"}
                            spacing={1}
                            justifyContent="center"
                            alignItems="center"
                          >
                            <Button
                              variant="contained"
                              color="success"
                              size={isXs ? "small" : "medium"}
                              onClick={() => handleApprove(fb.id)}
                              sx={{
                                fontSize: isXs ? 13 : 15,
                                px: isXs ? 1.5 : 2,
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size={isXs ? "small" : "medium"}
                              onClick={() => handleReject(fb.id)}
                              sx={{
                                fontSize: isXs ? 13 : 15,
                                px: isXs ? 1.5 : 2,
                              }}
                            >
                              Reject
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                    {feedbacks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography
                            color="text.secondary"
                            fontWeight={700}
                            fontSize={isXs ? 14 : 16}
                          >
                            No pending feedbacks
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
      <Dialog
        open={openImgModal}
        onClose={() => setOpenImgModal(false)}
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            background: "#fff",
            boxShadow: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: "90vw",
            maxHeight: "90vh",
          },
        }}
      >
        <IconButton
          aria-label="close"
          onClick={() => setOpenImgModal(false)}
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            background: "#fff",
            color: "#d32f2f",
            border: "2px solid #f5f5f5",
            borderRadius: "50%",
            boxShadow: 2,
            "&:hover": {
              background: "#f3f3f3",
              color: "#d32f2f",
              borderColor: "#e0e0e0",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.08)",
            },
            zIndex: 2,
          }}
          size="medium"
        >
          <CloseIcon sx={{ fontSize: 22 }} />
        </IconButton>
        <Box
          sx={{
            width: { xs: "80vw", sm: 500, md: 700 },
            height: { xs: "auto", sm: "auto" },
            maxHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
        >
          <img
            src={modalImgSrc}
            alt="Full Size"
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
              borderRadius: 12,
              boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
              background: "#fff",
            }}
          />
        </Box>
      </Dialog>
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
          {...(isXs
            ? { onClose: undefined }
            : { onClose: () => setSnackbar({ ...snackbar, open: false }) })}
          severity={snackbar.severity}
          sx={{
            fontSize: { xs: 15, sm: 16 },
            px: { xs: 1, sm: 2 },
            py: { xs: 1, sm: 1.5 },
            borderRadius: 2,
            boxShadow: 2,
            width: { xs: "70vw", sm: "100%" },
            mx: { xs: "auto", sm: 0 },
            textAlign: "center",
            whiteSpace: "pre-line",
            wordBreak: "break-word",
            lineHeight: 1.4,
          }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
