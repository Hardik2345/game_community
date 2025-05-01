/* eslint-disable react/prop-types */
import { useState, useEffect, useContext } from "react";
import {
  Avatar,
  Button,
  Container,
  TextField,
  Box,
  Stack,
  IconButton,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import context from "../context/context";

export default function ProfilePage({ currentUser }) {
  const theme = useTheme();
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // success | error | warning | info
  });

  const a = useContext(context);

  useEffect(() => {
    setUsername(currentUser.name);
    setEmail(currentUser.email);
    setPreview(currentUser.photo);
  }, [currentUser]);

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      (password || confirmPassword || currentPassword) &&
      password !== confirmPassword
    ) {
      setSnackbar({
        open: true,
        message: "Passwords do not match",
        severity: "error",
      });
      return;
    }

    const formData = new FormData();
    if (profilePic) formData.append("photo", profilePic);
    formData.append("name", username);
    formData.append("email", email);

    a.setCurrentUser((prev) => ({
      ...prev,
      photo: profilePic,
    }));

    try {
      const res = await fetch("http://localhost:8000/api/v1/users/updateMe", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (password && currentPassword) {
        const res2 = await fetch(
          "http://localhost:8000/api/v1/users/updateMyPassword",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              passwordCurrent: currentPassword,
              password,
              passwordConfirm: confirmPassword,
            }),
          }
        );

        const passwordData = await res2.json();

        if (passwordData.status !== "success") {
          throw new Error(passwordData.message || "Password update failed");
        }
      }

      if (data.status === "success") {
        setSnackbar({
          open: true,
          message: "Profile updated successfully!",
          severity: "success",
        });
      } else {
        throw new Error(data.message || "Profile update failed");
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.message || "Error updating profile or password",
        severity: "error",
      });
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor:
            theme.palette.mode === "dark" ? "#1e1e1e" : "background.paper",
          color: "text.primary",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <Avatar
            src={
              typeof preview === "string" && preview.startsWith("data:")
                ? preview
                : `http://localhost:8000/img/users/${preview || "default.jpg"}?${Date.now()}`
            }
            sx={{ width: 80, height: 80 }}
          />
          <label htmlFor="upload-avatar">
            <input
              accept="image/*"
              id="upload-avatar"
              type="file"
              style={{ display: "none" }}
              onChange={handlePicChange}
            />
            <IconButton color="primary" component="span">
              <PhotoCamera />
            </IconButton>
          </label>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Current Password"
              type="password"
              variant="outlined"
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <TextField
              label="New Password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label="Confirm Password"
              type="password"
              variant="outlined"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button variant="contained" type="submit" fullWidth>
              Save Changes
            </Button>
          </Stack>
        </form>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
