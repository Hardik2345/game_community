import { useState, useEffect } from "react";
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

// Steam icon component
const SteamIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 8 }}>
    <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658a3.387 3.387 0 0 1 1.912-.59c.063 0 .125.004.188.006l2.861-4.142V8.91a4.528 4.528 0 0 1 4.524-4.524c2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159a3.392 3.392 0 0 1-3.39 3.386 3.412 3.412 0 0 1-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25a2.551 2.551 0 0 0 3.337-3.324 2.547 2.547 0 0 0-1.255-1.319 2.528 2.528 0 0 0-1.919-.07l1.516.627a1.878 1.878 0 0 1-.433 3.437 1.873 1.873 0 0 1-1.087-.001z"/>
    <path d="M17.715 8.914a3.02 3.02 0 0 0-3.016-3.016 3.02 3.02 0 0 0-3.015 3.016 3.02 3.02 0 0 0 3.015 3.015 3.02 3.02 0 0 0 3.016-3.015zm-5.28-.002a2.265 2.265 0 1 1 4.531 0 2.265 2.265 0 0 1-4.531 0z"/>
  </svg>
);

// Google icon component
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 8 }}>
    <path d="M12.545 10.54v2.697h4.297c-.174 1.375-1.297 3.987-4.297 3.987-2.586 0-4.697-2.138-4.697-4.774s2.111-4.774 4.697-4.774c1.473 0 2.472.662 3.033 1.235l2.062-1.985C16.697 3.662 14.697 2 12.545 2c-5.522 0-10 4.477-10 10s4.478 10 10 10c5.737 0 10-4.523 10-10 0-.662-.07-1.314-.185-1.954h-9.815z"/>
  </svg>
);

export default function Auth() {
  const [tab, setTab] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [riotUsername, setRiotUsername] = useState("");
  const [riotTag, setRiotTag] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check for Steam or Google authentication callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      // Authentication successful, redirect to home
      navigate('/');
    } else if (params.get('error') === 'steam_auth_failed') {
      setError('Steam authentication failed. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('error') === 'google_auth_failed') {
      setError('Google authentication failed. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
        credentials: "include",
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          passwordConfirm,
          riotUsername: riotUsername || name,
          riotTag: riotTag || "0000"
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSteamLogin = () => {
    window.location.href = "http://localhost:8000/api/v1/users/auth/steam";
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/api/v1/users/auth/google";
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
                {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
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
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 2 }}>
                  <Divider sx={{ flex: 1, borderColor: '#444' }} />
                  <Typography sx={{ mx: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
                    OR
                  </Typography>
                  <Divider sx={{ flex: 1, borderColor: '#444' }} />
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: "#171a21",
                    color: "#fff",
                    fontWeight: "bold",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    "&:hover": { bgcolor: "#2a475e" },
                    mb: 2,
                  }}
                  onClick={handleSteamLogin}
                >
                  <SteamIcon />
                  Sign in with Steam
                </Button>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: "#4285f4",
                    color: "#fff",
                    fontWeight: "bold",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    "&:hover": { bgcolor: "#3578e5" },
                  }}
                  onClick={handleGoogleLogin}
                >
                  <GoogleIcon />
                  Sign in with Google
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
                  label="Riot Username (Optional)"
                  variant="outlined"
                  margin="normal"
                  value={riotUsername}
                  onChange={(e) => setRiotUsername(e.target.value)}
                  InputProps={{ style: { backgroundColor: "#222" } }}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Riot Tag (Optional)"
                  variant="outlined"
                  margin="normal"
                  value={riotTag}
                  onChange={(e) => setRiotTag(e.target.value)}
                  InputProps={{ style: { backgroundColor: "#222" } }}
                  size="small"
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
                {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
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

                <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 2 }}>
                  <Divider sx={{ flex: 1, borderColor: '#444' }} />
                  <Typography sx={{ mx: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
                    OR
                  </Typography>
                  <Divider sx={{ flex: 1, borderColor: '#444' }} />
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: "#171a21",
                    color: "#fff",
                    fontWeight: "bold",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    "&:hover": { bgcolor: "#2a475e" },
                    mb: 2,
                  }}
                  onClick={handleSteamLogin}
                >
                  <SteamIcon />
                  Sign up with Steam
                </Button>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: "#4285f4",
                    color: "#fff",
                    fontWeight: "bold",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    "&:hover": { bgcolor: "#3578e5" },
                  }}
                  onClick={handleGoogleLogin}
                >
                  <GoogleIcon />
                  Sign up with Google
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}