import { useState } from "react";
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

const uploadedImage = localStorage.getItem("uploadedImage");

const fakeFeedbacks = [
  {
    id: 1,
    image: uploadedImage || "https://source.unsplash.com/60x60/?spare-part",
    suggestedCode: "SP-1004",
    user: "emp123",
    date: "2024-06-01",
  },
  {
    id: 2,
    image: uploadedImage || "https://source.unsplash.com/60x60/?machine",
    suggestedCode: "SP-1005",
    user: "emp456",
    date: "2024-06-02",
  },
];

const fakeUsers = [
  { id: 1, userId: "emp123", role: "Moderator" },
  { id: 2, userId: "emp456", role: "User" },
];

export default function UserPanelPage() {
  const [role] = useState("Admin");
  const [feedbacks, setFeedbacks] = useState(fakeFeedbacks);
  const [users, setUsers] = useState(fakeUsers);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [userForm, setUserForm] = useState({ userId: "", role: "" });
  const [showPwdDialog, setShowPwdDialog] = useState(false);
  const [pwdForm, setPwdForm] = useState({ oldPwd: "", newPwd: "" });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.down("md"));
  const [openImgModal, setOpenImgModal] = useState(false);
  const [modalImgSrc, setModalImgSrc] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editPwd, setEditPwd] = useState("");

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
      const res = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000/api"
        }/admin/user/${userId}`,
        { method: "DELETE" }
      );
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
    if (confirmAction === "approve") {
      // TODO: Integrate with backend approve API
      setFeedbacks((fbs) => fbs.filter((fb) => fb.id !== selectedFeedback));
    } else if (confirmAction === "reject") {
      // TODO: Integrate with backend reject API
      setFeedbacks((fbs) => fbs.filter((fb) => fb.id !== selectedFeedback));
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
  const handlePwdSubmit = (e) => {
    e.preventDefault();
    // TODO: Call change password API
    setShowPwdDialog(false);
    setPwdForm({ oldPwd: "", newPwd: "" });
    setSnackbar({
      open: true,
      message: "Password changed!",
      severity: "success",
    });
  };

  const handleUserFormChange = (e) =>
    setUserForm({ ...userForm, [e.target.name]: e.target.value });

  const handleEditPwdChange = (e) => setEditPwd(e.target.value);

  const handleUserSubmit = (e) => {
    e.preventDefault();
    setUsers((prev) => {
      const exists = prev.find((u) => u.userId === userForm.userId);
      if (exists) {
        setSnackbar({
          open: true,
          message: "User Updated",
          severity: "success",
        });

        return prev.map((u) =>
          u.userId === userForm.userId ? { ...u, role: userForm.role } : u
        );
      }
      setSnackbar({ open: true, message: "User Created", severity: "success" });

      return [
        ...prev,
        {
          id: prev.length ? Math.max(...prev.map((u) => u.id)) + 1 : 1,
          userId: userForm.userId,
          role: userForm.role,
        },
      ];
    });
    setShowUserDialog(false);
    setUserForm({ userId: "", role: "" });
    setSnackbar({ open: true, message: "User Created", severity: "success" });
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
            onClick={() => setShowUserDialog(true)}
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
              label="User ID"
              name="userId"
              value={userForm.userId}
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
              sx={{ borderRadius: 3, minWidth: 100, fontWeight: 700 }}
            >
              {isEditMode ? "Save" : "Save"}
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
                <span style={{ fontWeight: 400 }}>{userToDelete.userId}</span>
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
                "& .MuiTableCell-root": {
                  fontSize: isXs ? 13 : 15,
                  px: isXs ? 1 : 2,
                  py: isXs ? 0.5 : 1.2,
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    User ID
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Role
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Actions
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Delete
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell align="center">{u.userId}</TableCell>
                    <TableCell align="center">{u.role}</TableCell>
                    <TableCell align="center">
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
                      >
                        Edit
                      </Button>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
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
                ))}
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
                "& .MuiTableCell-root": {
                  fontSize: isXs ? 13 : 15,
                  px: isXs ? 1 : 2,
                  py: isXs ? 0.5 : 1.2,
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Image
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Suggested Code
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    User
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Date
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feedbacks.map((fb) => (
                  <TableRow key={fb.id}>
                    <TableCell align="center">
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

                    <TableCell align="center">{fb.suggestedCode}</TableCell>
                    <TableCell align="center">{fb.user}</TableCell>
                    <TableCell align="center">{fb.date}</TableCell>
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
                        fontSize={isXs ? 13 : 15}
                      >
                        No pending feedbacks
                      </Typography>
                    </TableCell>
                  </TableRow>
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
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
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
    </Box>
  );
}
