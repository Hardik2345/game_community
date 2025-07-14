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
  Tabs,
  Tab,
  Typography,
  Snackbar,
  Alert,
  useTheme,
  Paper,
  Divider,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import axios from "axios";
import context from "../context/context";

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function ProfilePage({ currentUser }) {
  const theme = useTheme();
  const a = useContext(context);

  const [tab, setTab] = useState(0);
  const [preview, setPreview] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [gv, setGv] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.name);
      setEmail(currentUser.email);
      setPreview(currentUser.photo);
      (async () => {
        try {
          const token = localStorage.getItem("token");
          const axiosConfig = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : { withCredentials: true };
          const res = await axios.get(
            `http://localhost:8000/api/v1/gv/${currentUser.id}`,
            axiosConfig
          );
          setGv(res.data.data);
        } catch {
          setGv(null);
        }
      })();
    }
  }, [currentUser]);

  const handleTabChange = (_, v) => setTab(v);
  const handleSnackbarClose = () => setSnackbar((s) => ({ ...s, open: false }));

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      (password || confirmPassword || currentPassword) &&
      password !== confirmPassword
    ) {
      return setSnackbar({
        open: true,
        message: "Passwords do not match",
        severity: "error",
      });
    }
    const formData = new FormData();
    if (profilePic) formData.append("photo", profilePic);
    formData.append("name", username);
    formData.append("email", email);
    try {
      const token = localStorage.getItem("token");
      let fetchConfig;
      if (token) {
        fetchConfig = {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        };
      } else {
        fetchConfig = {
          method: "PATCH",
          credentials: "include",
          body: formData,
        };
      }
      const res = await fetch("http://localhost:8000/api/v1/users/updateMe", fetchConfig);
      const data = await res.json();
      if (password && currentPassword) {
        let passConfig;
        if (token) {
          passConfig = {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              passwordCurrent: currentPassword,
              password,
              passwordConfirm: confirmPassword,
            }),
          };
        } else {
          passConfig = {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              passwordCurrent: currentPassword,
              password,
              passwordConfirm: confirmPassword,
            }),
          };
        }
        const res2 = await fetch(
          "http://localhost:8000/api/v1/users/updateMyPassword",
          passConfig
        );
        const pd = await res2.json();
        if (pd.status !== "success")
          throw new Error(pd.message || "Password update failed");
      }
      if (data.status === "success") {
        setSnackbar({
          open: true,
          message: "Profile updated!",
          severity: "success",
        });
        a.setCurrentUser((prev) => ({ ...prev, photo: preview }));
      } else {
        throw new Error(data.message || "Update failed");
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Tabs
        value={tab}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        centered
      >
        <Tab label="Profile" />
        <Tab label="Gaming Vitae" />
      </Tabs>

      {/* PROFILE TAB */}
      <TabPanel value={tab} index={0}>
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            maxWidth: 480,
            mx: "auto",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={3} mb={4}>
            <Avatar
              src={
                preview?.startsWith("data:")
                  ? preview
                  : `http://localhost:8000/img/users/${preview || "default.jpg"}?${Date.now()}`
              }
              sx={{ width: 100, height: 100 }}
            />
            <label htmlFor="upload-avatar">
              <input
                accept="image/*"
                id="upload-avatar"
                type="file"
                hidden
                onChange={handlePicChange}
              />
              <IconButton color="primary" component="span">
                <PhotoCamera />
              </IconButton>
            </label>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
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
        </Paper>
      </TabPanel>

      {/* STATS TAB */}
      <TabPanel value={tab} index={1}>
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            boxShadow: theme.shadows[6],
            textAlign: "center",
            maxWidth: 480,
            mx: "auto",
          }}
        >
          <Typography
            variant="h3"
            gutterBottom
            sx={{ fontWeight: 700, color: theme.palette.primary.main }}
          >
            Gaming Vitae
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {gv ? (
            <Stack spacing={2}>
              <Typography variant="h5">
                <strong>Win Percentage:</strong> {gv.winPercentage}%
              </Typography>
              <Typography variant="h5">
                <strong>KDA Ratio:</strong> {gv.kdaRatio}
              </Typography>
              <Typography variant="h5">
                <strong>Matches Played:</strong> {gv.matchesPlayed}
              </Typography>
              <Typography variant="h5">
                <strong>Rating:</strong> {gv.rating}
              </Typography>
            </Stack>
          ) : (
            <Typography color="textSecondary">
              No stats available yet.
            </Typography>
          )}
        </Paper>
      </TabPanel>

      {/* SNACKBAR */}
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
