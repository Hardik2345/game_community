/* eslint-disable react/prop-types */
import {
  Paper,
  Grid,
  Box,
  FormControl,
  Select,
  MenuItem,
  Divider,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  TextField,
  IconButton,
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import FiberManualRecord from "@mui/icons-material/FiberManualRecord";
import { useState, useContext, useEffect, useRef } from "react";
import { styled } from "@mui/material/styles";
import context from "../context/context";
import io from "socket.io-client";
import axios from "axios";

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

export default function GameChatPage({ currentUser }) {
  const a = useContext(context);
  const [currentGame, setCurrentGame] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messageEndRef = useRef(null);

  useEffect(() => {
    a.fetchGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (currentGame) {
      // Optionally notify the server about leaving previous room (if applicable)
      // socket.emit("leaveTeamChat", { teamId: previousTeamId, userId: currentUser.id });
      fetchMessages(currentGame);
      socket.emit("joinGameChat", {
        gameId: currentGame,
        userId: currentUser.id,
      });
    }
  }, [currentGame, currentUser]);

  const fetchMessages = async (gameId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chats/game/${gameId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log(response);
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      socket.emit("send", {
        gameId: currentGame,
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
                value={currentGame}
                onChange={(e) => setCurrentGame(e.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select a game
                </MenuItem>
                {a.games.map((game) => (
                  <MenuItem key={game._id} value={game._id}>
                    {game.name}
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
              {a.games.find((game) => game._id === currentGame)?.name ||
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
}
