/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CardActionArea,
  CardActions,
  Grid,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import context from "../context/context";

// Adjust the URL to match your server's address
const socket = io("http://localhost:8000", { transports: ["websocket"] });

export default function RecruitPlayersPage({ currentUser }) {
  const a = useContext(context);
  const [players, setPlayers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("");

  // Fetch teams created by the current user
  useEffect(() => {
    a.fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Join recruit players room via socket.io
  useEffect(() => {
    if (currentUser && currentUser.id) {
      socket.emit("joinRecruitPlayers", { userId: currentUser.id });
    }
  }, [currentUser]);

  // Listen for updates on online users
  useEffect(() => {
    socket.on("updateOnlineUsers", async (data) => {
      const { allUsers, onlineUserIds } = data;
      // const token = localStorage.getItem("token");

      // 🔁 Only update GV for current user ONCE
      // try {
      //   await axios.post(
      //     "http://localhost:8000/api/v1/gv/update-my-gv",
      //     {},
      //     {
      //       headers: {
      //         Authorization: `Bearer ${token}`,
      //       },
      //     }
      //   );
      // } catch (err) {
      //   console.warn("Failed to update your GV:", err.message);
      // }

      // 🔁 Now fetch GV for all users
      const updatedPlayers = await Promise.all(
        allUsers.map(async (user) => {
          const isOnline = onlineUserIds.includes(user._id.toString());
          let stats = {
            winPercentage: "--",
            kdaRatio: "--",
            matchesPlayed: "--",
            rating: "--",
          };
          try {
            const token = localStorage.getItem("token");
            const axiosConfig = token
              ? { headers: { Authorization: `Bearer ${token}` } }
              : { withCredentials: true };
            const res = await axios.get(
              `http://localhost:8000/api/v1/gv/${user._id}`,
              axiosConfig
            );
            stats = res.data.data || stats;
          } catch (error) {
            console.warn(`No GV found for ${user.name}`);
            console.error("Error💥💥: ", error);
          }
          return {
            ...user,
            isOnline,
            title: user.name,
            image: `http://localhost:8000/img/users/${user.photo}`,
            description: `Win percentage: ${stats.winPercentage}%\nKDA ratio: ${stats.kdaRatio}\nMatches played: ${stats.matchesPlayed}\nRating: ${stats.rating}`,
          };
        })
      );
      setPlayers(updatedPlayers);
    });

    return () => {
      socket.off("updateOnlineUsers");
    };
  }, []);

  // When the invite button is clicked, open the dialog
  const handleInviteClick = (player) => {
    setSelectedPlayer(player);
    setDialogOpen(true);
  };

  // Close the dialog and clear the selection
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedTeam("");
    setSelectedPlayer(null);
  };

  // Send the invite by calling the backend API
  const handleSendInvite = async () => {
    if (!selectedTeam || !selectedPlayer) return;
    try {
      const token = localStorage.getItem("token");
      const axiosConfig = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { withCredentials: true };
      await axios.post(
        "http://localhost:8000/api/v1/invites",
        {
          teamId: selectedTeam,
          userId: selectedPlayer._id,
        },
        axiosConfig
      );
      setDialogOpen(false);
    } catch (error) {
      console.error("Error sending invite:", error);
    }
  };

  return (
    <>
      <Grid container spacing={0} rowGap={2}>
        {players
          .filter((player) => player._id !== currentUser?.id)
          .map((player, index) => (
            <Grid item xs={12} sm={6} md={4} key={player._id || index}>
              <Card
                sx={{
                  maxWidth: 280,
                  borderRadius: "10px",
                  position: "relative",
                }}
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
                    onClick={() => {
                      // e.stopPropagation();
                      handleInviteClick(player);
                    }}
                  >
                    Invite
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Invite Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        PaperProps={{
          sx: {
            width: "300px",
            maxWidth: "300px",
          },
        }}
      >
        <DialogTitle>Invite</DialogTitle>
        <DialogContent>
          <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
            <InputLabel id="team-select-label">Select Team</InputLabel>
            <Select
              labelId="team-select-label"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              label="Select Team"
            >
              {a.teams.map((team) => (
                <MenuItem key={team._id} value={team.name}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleSendInvite}
            variant="contained"
            color="primary"
          >
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
