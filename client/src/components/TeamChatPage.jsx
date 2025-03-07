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
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const API_BASE_URL = "http://localhost:8000/api/v1";
const socket = io("http://localhost:8000", { transports: ["websocket"] }); // Adjust based on backend

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
  const messageEndRef = useRef(null);

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      if (!newMessage.sender || !newMessage.sender.name) {
        console.error("Received message without sender info:", newMessage);
      }
      setMessages((prev) => [
        ...prev,
        {
          ...newMessage,
          sender: newMessage.sender || {
            id: "67c154ae8c454ccf47697f59",
            name: "Hardik",
          }, // Ensure sender data exists
        },
      ]);
    };

    fetchTeams();
    socket.on("receiveMessage", handleNewMessage);

    return () => {
      socket.off("receiveMessage", handleNewMessage); // ✅ Cleanup to prevent duplicates
    };
  }, []);

  useEffect(() => {
    if (currentTeam) {
      fetchMessages(currentTeam);
      socket.emit("joinTeamChat", currentTeam);
    }
  }, [currentTeam]);

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teams`, {
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YzE1NGFlOGM0NTRjY2Y0NzY5N2Y1OSIsImlhdCI6MTc0MTI1NDU5OSwiZXhwIjoxNzQ5MDMwNTk5fQ.O_CT09ix6ebwigkhO5-9t8lMDl8y6iJP3lDKc8sndFo",
        },
      });
      setTeams(response.data?.data?.data || []);
    } catch (error) {
      console.error("Error fetching teams", error);
    }
  };

  const fetchMessages = async (teamId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chats/${teamId}`, {
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YzE1NGFlOGM0NTRjY2Y0NzY5N2Y1OSIsImlhdCI6MTc0MTI1NDU5OSwiZXhwIjoxNzQ5MDMwNTk5fQ.O_CT09ix6ebwigkhO5-9t8lMDl8y6iJP3lDKc8sndFo",
        },
      });
      setMessages((prev) =>
        Array.isArray(response.data) ? response.data : [...prev]
      );
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // const newMessage = {
    //   content: message,
    //   sender: "67c154ae8c454ccf47697f59", // Replace with actual sender ID
    //   teamId: currentTeam,
    // };

    // setMessages((prevMessages) => [...prevMessages, newMessage]);

    try {
      // await axios.post(`${API_BASE_URL}/chats`, newMessage, {
      //   headers: {
      //     Authorization:
      //       "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YzE1NGFlOGM0NTRjY2Y0NzY5N2Y1OSIsImlhdCI6MTc0MTI1NDU5OSwiZXhwIjoxNzQ5MDMwNTk5fQ.O_CT09ix6ebwigkhO5-9t8lMDl8y6iJP3lDKc8sndFo",
      //   },
      // });
      // socket.emit("sendMessage", response.data);
      const user = { id: "67c154ae8c454ccf47697f59", name: "Hardik" };
      socket.emit("sendMessage", {
        teamId: currentTeam,
        sender: user.id,
        message,
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  return (
    <Grid container spacing={1}>
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
        </Paper>
      </Grid>

      <Grid item xs={9}>
        <ChatContainer>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6">
              {teams.find((team) => team._id === currentTeam)?.name ||
                "Loading..."}
            </Typography>
          </Box>

          <MessageArea>
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.sender.name === "Hardik" ? "flex-end" : "flex-start",
                  mb: 2,
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor:
                      msg.sender.name === "Hardik" ? "#1976d2" : "#f5f5f5",
                    color: msg.sender.name === "Hardik" ? "#ffffff" : "#000000",
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
