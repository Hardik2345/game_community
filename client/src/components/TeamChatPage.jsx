import { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import FiberManualRecord from "@mui/icons-material/FiberManualRecord";

const API_BASE_URL = "http://localhost:8000/api/v1";
const socket = io("http://localhost:8000", { transports: ["websocket"] });

const ChatContainer = styled(Paper)(({ theme }) => ({
  height: "calc(100vh - 100px)",
  margin: theme.spacing(1),
  display: "flex",
  flexDirection: "column",
}));

const MessageArea = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: "auto",
  padding: theme.spacing(2),
}));

const InputArea = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const TeamChatPage = () => {
  const [currentTeam, setCurrentTeam] = useState("");
  const [teams, setTeams] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const messageEndRef = useRef(null);

  // Setup socket listeners only once on mount
  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      if (!newMessage.sender || !newMessage.sender.name) {
        console.error("Received message without sender info:", newMessage);
      }
      setMessages((prev) => [...prev, newMessage]);
    };

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on("receiveMessage", handleNewMessage);
    socket.on("updateOnlineUsers", handleOnlineUsers);

    return () => {
      socket.off("receiveMessage", handleNewMessage);
      socket.off("updateOnlineUsers", handleOnlineUsers);
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const userData = response?.data?.data?.data;
        const newUser = {
          id: userData._id,
          name: userData.name,
        };
        setTeams(userData.team);

        // Update state only if the user has changed
        setCurrentUser((prevUser) =>
          JSON.stringify(prevUser) !== JSON.stringify(newUser)
            ? newUser
            : prevUser
        );
      } catch (error) {
        console.error("Error fetching user", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (currentTeam) {
      // Optionally notify the server about leaving previous room (if applicable)
      // socket.emit("leaveTeamChat", { teamId: previousTeamId, userId: currentUser.id });
      fetchMessages(currentTeam);
      socket.emit("joinTeamChat", {
        teamId: currentTeam,
        userId: currentUser.id,
      });
    }
  }, [currentTeam, currentUser]);

  const fetchMessages = async (teamId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chats/${teamId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      socket.emit("sendMessage", {
        teamId: currentTeam,
        sender: currentUser.id,
        message,
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  return (
    <Grid container spacing={0}>
      <Grid item xs={3}>
        <Paper
          sx={{ height: "calc(100vh - 100px)", margin: 1, overflow: "auto" }}
        >
          <Box sx={{ p: 2 }}>
            <FormControl fullWidth size="small">
              <Select
                value={currentTeam}
                onChange={(e) => setCurrentTeam(e.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select a team
                </MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team._id} value={team._id}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1">Online Users</Typography>
            <List>
              {onlineUsers.map((user, index) => (
                <ListItem key={index}>
                  <Avatar>{user.name.charAt(0).toUpperCase()}</Avatar>
                  <FiberManualRecord
                    sx={{
                      color: "green",
                      fontSize: 12,
                      position: "absolute",
                      bottom: 8,
                      left: 44,
                    }}
                  />
                  <ListItemText primary={user.name} sx={{ ml: 1 }} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={9}>
        <ChatContainer>
          <Box sx={{ p: 2.5, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6">
              {teams.find((team) => team._id === currentTeam)?.name ||
                "Select a team to start chatting!"}
            </Typography>
          </Box>

          <MessageArea>
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.sender.name === currentUser.name
                      ? "flex-end"
                      : "flex-start",
                  mb: 2,
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor:
                      msg.sender.name === currentUser.name
                        ? "#1976d2"
                        : "#f5f5f5",
                    color:
                      msg.sender.name === currentUser.name
                        ? "#ffffff"
                        : "#000000",
                    maxWidth: "70%",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1">{msg.content}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {msg.sender.name},{" "}
                    {new Date(msg.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </Typography>
                </Paper>
              </Box>
            ))}
            <div ref={messageEndRef} />
          </MessageArea>

          <InputArea>
            <form onSubmit={handleSendMessage}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  size="small"
                />
                <IconButton
                  type="submit"
                  color="primary"
                  disabled={!message.trim()}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </form>
          </InputArea>
        </ChatContainer>
      </Grid>
    </Grid>
  );
};

export default TeamChatPage;
