import { useEffect, useState } from "react";
import io from "socket.io-client";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import axios from "axios";

// Adjust the URL to match your server's address
const socket = io("http://localhost:8000", { transports: ["websocket"] });

export default function RecruitPlayersPage() {
  // players will be an array of objects from the database
  const [players, setPlayers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8000/api/v1/users/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const userData = response?.data?.data?.data;
        const newUser = {
          id: userData._id,
          name: userData.name,
        };
        setCurrentUser(newUser);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    // Only emit once currentUser is available
    if (currentUser && currentUser.id) {
      socket.emit("joinRecruitPlayers", { userId: currentUser.id });
    }
  }, [currentUser]);

  useEffect(() => {
    // Listen for updates on online users
    socket.on("updateOnlineUsers", (data) => {
      const { allUsers, onlineUserIds } = data;
      // Map over all users to add an isOnline flag
      const updatedPlayers = allUsers.map((user) => ({
        ...user,
        isOnline: onlineUserIds.includes(user._id.toString()),
        // For demo purposes, you might also add image and description info here
        title: user.name,
        description: `Player description for ${user.name}`,
        image:
          "https://img.freepik.com/free-vector/polygonal-face-with-headphones_23-2147507024.jpg",
      }));
      setPlayers(updatedPlayers);
    });

    // Cleanup on unmount
    return () => {
      socket.off("updateOnlineUsers");
    };
  }, []);

  return (
    <Grid container spacing={0}>
      {players
        .filter((player) => player._id !== currentUser?.id)
        .map((player, index) => (
          <Grid item xs={12} sm={6} md={4} key={player._id || index}>
            <Card
              sx={{ maxWidth: 280, borderRadius: "10px", position: "relative" }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  borderRadius: "12px",
                  padding: "4px 8px",
                  zIndex: 1,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: player.isOnline ? "#4CAF50" : "#f44336",
                    marginRight: "6px",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: "#fff", fontWeight: 500 }}
                >
                  {player.isOnline ? "Online" : "Offline"}
                </Typography>
              </Box>
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="140"
                  image={player.image}
                  alt={player.name}
                />
                <CardContent sx={{ paddingBottom: "8px" }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {player.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", whiteSpace: "pre-line" }}
                  >
                    {player.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions
                sx={{
                  paddingTop: "4px",
                  paddingBottom: "10px",
                  paddingLeft: "14px",
                }}
              >
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  sx={{ borderRadius: "5px" }}
                >
                  Invite
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
    </Grid>
  );
}
