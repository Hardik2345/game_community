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
import { useState, useContext, useEffect, useRef, useMemo } from "react"; // 👇 NEW: Import useMemo
import { styled } from "@mui/material/styles";
import context from "../context/context";
import io from "socket.io-client";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1";
const socket = io("http://localhost:8000", { transports: ["websocket"] });

// ... Styled components (ChatContainer, MessageArea, InputArea) are unchanged ...
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
  
  // 👇 NEW: State and Ref for typing indicator
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimerRef = useRef(null);

  useEffect(() => {
    if (currentUser) a.fetchGamesForUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    };

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    // 👇 NEW: Handlers for typing events
    const handleUserTypingStarted = ({ user }) => {
      if (user._id !== currentUser.id) {
        setTypingUsers((prev) => ({ ...prev, [user._id]: user }));
      }
    };
    
    const handleUserTypingStopped = ({ user }) => {
      setTypingUsers((prev) => {
        const newTyping = { ...prev };
        delete newTyping[user._id];
        return newTyping;
      });
    };

    socket.on("receiveMessage", handleNewMessage);
    socket.on("updateOnlineUsers", handleOnlineUsers);
    
    // 👇 NEW: Subscribe to typing events
    socket.on("user-typing-started", handleUserTypingStarted);
    socket.on("user-typing-stopped", handleUserTypingStopped);

    return () => {
      socket.off("receiveMessage", handleNewMessage);
      socket.off("updateOnlineUsers", handleOnlineUsers);
      
      // 👇 NEW: Unsubscribe from typing events on cleanup
      socket.off("user-typing-started", handleUserTypingStarted);
      socket.off("user-typing-stopped", handleUserTypingStopped);
    };
  }, [currentUser.id]); // Add currentUser.id to dependency array

  useEffect(() => {
    if (currentGame) {
      fetchMessages(currentGame);
      socket.emit("joinGameChat", {
        gameId: currentGame,
        userId: currentUser.id,
      });
    }
  }, [currentGame, currentUser]); // currentUser already here, no change needed

  const fetchMessages = async (gameId) => {
    // ... no changes to this function ...
    const getAuthConfig = () => {
      const token = localStorage.getItem("token");
      return token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { withCredentials: true };
    };
    try {
      const response = await axios.get(`${API_BASE_URL}/chats/game/${gameId}`, getAuthConfig());
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentGame) return;

    // 👇 NEW: Stop typing when message is sent
    clearTimeout(typingTimerRef.current);
    socket.emit("stop-typing", { roomId: currentGame, user: currentUser });

    socket.emit("send", {
      gameId: currentGame,
      sender: currentUser.id,
      message,
    });
    setMessage("");
  };

  // 👇 NEW: Handler for input change to emit typing events
  const handleInputChange = (e) => {
    setMessage(e.target.value);

    // Emit start-typing and set a timer to emit stop-typing
    socket.emit("start-typing", { roomId: currentGame, user: currentUser });

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("stop-typing", { roomId: currentGame, user: currentUser });
    }, 3000); // 3 seconds
  };
  
  // 👇 NEW: useMemo to calculate the typing indicator text efficiently
  const typingIndicatorText = useMemo(() => {
    const names = Object.values(typingUsers).map(u => u.name);
    if (names.length === 0) return "";
    if (names.length === 1) return `${names[0]} is typing...`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
    return "Several people are typing...";
  }, [typingUsers]);

  return (
    <Grid container spacing={0}>
      <Grid item xs={3}>
        {/* ... User List Panel (no changes) ... */}
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
                {a.userGames.map((game) => (
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
                  <Avatar
                    src={`http://localhost:8000/img/users/${user.photo}`}
                  ></Avatar>
                  <FiberManualRecord
                    sx={{
                      color: "green",
                      fontSize: 12,
                      position: "absolute",
                      bottom: 8,
                      left: 44,
                    }}
                  />
                  <ListItemText
                    primary={user.name.split(" ")[0]}
                    sx={{ ml: 1 }}
                  />
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
            {/* ... Messages mapping (no changes) ... */}
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.sender?.name === currentUser.name
                      ? "flex-end"
                      : "flex-start",
                  mb: 2,
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor:
                      msg.sender?.name === currentUser.name
                        ? "#1976d2"
                        : "#f5f5f5",
                    color:
                      msg.sender?.name === currentUser.name
                        ? "#ffffff"
                        : "#000000",
                    maxWidth: "70%",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1">{msg.content}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {msg.sender?.name || 'Unknown'},{" "}
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
          
          {/* 👇 NEW: Typing Indicator UI */}
          <Box sx={{ height: '24px', px: 2, fontStyle: 'italic', color: 'text.secondary' }}>
            <Typography variant="caption">{typingIndicatorText}</Typography>
          </Box>

          <InputArea>
            <form onSubmit={handleSendMessage}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type a message..."
                  value={message}
                  onChange={handleInputChange} // MODIFIED: Use the new handler
                  size="small"
                  disabled={!currentGame} // MODIFIED: Disable input if no room is selected
                />
                <IconButton
                  type="submit"
                  color="primary"
                  disabled={!message.trim() || !currentGame}
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