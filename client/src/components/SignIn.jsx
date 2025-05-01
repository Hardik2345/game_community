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
  Divider,
} from "@mui/material";

// Neon-cyberpunk gamer theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#00e5ff" },
    background: { default: "#0f0f0f", paper: "#1a1a1a" },
    text: { primary: "#ffffff", secondary: "#aaaaaa" },
  },
  typography: {
    fontFamily: `'Orbitron', 'Roboto', sans-serif`,
    h4: { fontWeight: 700 },
  },
});

export default function Auth() {
  const [tab, setTab] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignUp = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, passwordConfirm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          bgcolor: "background.default",
        }}
      >
        <Card
          sx={{
            maxWidth: 450,
            width: "100%",
            borderRadius: 3,
            boxShadow: 5,
            bgcolor: "background.paper",
            px: 3,
            py: 4,
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{ color: "#00e5ff" }}
            >
              SquadronX
            </Typography>
            <Typography
              variant="subtitle1"
              align="center"
              sx={{ mb: 2, color: "text.secondary" }}
            >
              Connect. Squad Up. Dominate.
            </Typography>
            <Tabs
              value={tab}
              onChange={(_, newValue) => setTab(newValue)}
              centered
              textColor="primary"
              indicatorColor="primary"
              sx={{ mb: 3 }}
            >
              <Tab label="Login" />
              <Tab label="Sign Up" />
            </Tabs>

            {tab === 0 ? (
              <>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{ style: { backgroundColor: "#222" } }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{ style: { backgroundColor: "#222" } }}
                />
                {error && <Typography color="error">{error}</Typography>}
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 3,
                    bgcolor: "#00e5ff",
                    color: "#000",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "#00bcd4" },
                  }}
                  onClick={handleLogin}
                >
                  Sign In
                </Button>
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Name"
                  variant="outlined"
                  margin="normal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  InputProps={{ style: { backgroundColor: "#222" } }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{ style: { backgroundColor: "#222" } }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{ style: { backgroundColor: "#222" } }}
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  InputProps={{ style: { backgroundColor: "#222" } }}
                />
                {error && <Typography color="error">{error}</Typography>}
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 3,
                    bgcolor: "#00e5ff",
                    color: "#000",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "#00bcd4" },
                  }}
                  onClick={handleSignUp}
                >
                  Sign Up
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}
