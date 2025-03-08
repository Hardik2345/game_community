import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";

// Define a dark theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    background: {
      default: "#121212", // Set full background color
      paper: "#1e1e1e",
    },
    text: {
      primary: "#ffffff",
    },
  },
});

export default function SignIn() {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      {/* Apply global dark mode styles */}
      <CssBaseline />

      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.default", // Apply full dark background
          color: "text.primary",
        }}
      >
        <Card
          sx={{
            maxWidth: 400,
            width: "100%",
            p: 2,
            bgcolor: "background.paper",
          }}
        >
          <CardContent>
            <Tabs
              value={tab}
              onChange={(_, newValue) => setTab(newValue)}
              centered
            >
              <Tab label="Login" />
              <Tab label="Sign Up" onClick={() => navigate("/signup")} />
            </Tabs>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputLabelProps={{ style: { color: "#ffffff" } }}
                InputProps={{
                  style: { color: "#ffffff", backgroundColor: "#333" },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputLabelProps={{ style: { color: "#ffffff" } }}
                InputProps={{
                  style: { color: "#ffffff", backgroundColor: "#333" },
                }}
              />
              {error && <Typography color="error">{error}</Typography>}
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleLogin}
              >
                Sign In
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}
