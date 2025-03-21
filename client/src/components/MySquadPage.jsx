import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Avatar,
  AvatarGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";

export default function MySquadPage() {
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Store all squads the user is a member of (created or joined)
  const [squads, setSquads] = useState([]);

  // State for Create Squad Dialog
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newSquadName, setNewSquadName] = useState("");
  const [newSquadTagline, setNewSquadTagline] = useState("");
  const [newSquadDescription, setNewSquadDescription] = useState("");

  // State for Squad Detail Dialog and current user
  const [selectedSquad, setSelectedSquad] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user and squads on component mount
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
          avatar: userData.avatar || "", // Use user avatar if available
        };
        setCurrentUser(newUser);
        // Assuming the user's teams are stored in userData.team array
        setSquads(userData.team || []);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateSquad = async () => {
    try {
      const token = localStorage.getItem("token");
      // Fetch the latest user data to ensure we have the most up-to-date ID
      const userRes = await axios.get("http://localhost:8000/api/v1/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = userRes?.data?.data?.data;
      const newSquad = {
        name: newSquadName,
        tagline: newSquadTagline,
        description: newSquadDescription,
        members: [userData._id],
        createdBy: userData._id, // Added createdBy field
      };

      await axios.post("http://localhost:8000/api/v1/teams", newSquad, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: "Team created successfully!",
        severity: "success",
      });

      // Append the newly created squad to state
      setSquads((prevSquads) => [...prevSquads, newSquad]);
      setNewSquadName("");
      setNewSquadTagline("");
      setNewSquadDescription("");
      setOpenCreateDialog(false);
    } catch (error) {
      console.error("Error creating squad:", error);
      setSnackbar({
        open: true,
        message: "Failed to create Team",
        severity: "error",
      });
    }
  };

  const handleSquadClick = (squad) => {
    setSelectedSquad(squad);
  };

  const handleCloseSquadDetail = () => {
    setSelectedSquad(null);
  };

  // Helper function to determine what to display for a member
  const getDisplayMember = (member) => {
    if (typeof member === "object" && member.name) {
      return member;
    } else if (
      currentUser &&
      (member === currentUser.id || member === currentUser._id)
    ) {
      return currentUser;
    }
    return { name: "Member", avatar: "" };
  };

  // Updated card style with border radius set to 10
  const cardStyle = {
    borderRadius: 10,
    boxShadow: 3,
    p: 2,
    bgcolor: "background.paper",
    cursor: "pointer",
    transition: "transform 0.2s",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "250px", // Set a minimum height for all cards
  };

  // Derived squads based on createdBy field once currentUser is loaded
  const createdSquads = currentUser
    ? squads.filter((squad) => squad.createdBy === currentUser.id)
    : [];
  const joinedSquads = currentUser
    ? squads.filter((squad) => squad.createdBy !== currentUser.id)
    : [];

  return (
    <Container
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Created Squads" />
          <Tab label="Joined Squads" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Your Created Squads</Typography>
            <Button
              variant="contained"
              onClick={() => setOpenCreateDialog(true)}
            >
              Create Squad
            </Button>
          </Box>
          {createdSquads.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              You have not created any squads yet.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {createdSquads.map((squad, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={cardStyle} onClick={() => handleSquadClick(squad)}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {squad.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {squad.tagline}
                      </Typography>
                    </CardContent>
                    {squad.members && squad.members.length > 0 && (
                      <AvatarGroup max={4}>
                        {squad.members.map((member, idx) => {
                          const displayMember = getDisplayMember(member);
                          return (
                            <Avatar
                              key={idx}
                              src={displayMember.avatar || undefined}
                              alt={displayMember.name}
                            >
                              {!displayMember.avatar &&
                                displayMember.name &&
                                displayMember.name[0]}
                            </Avatar>
                          );
                        })}
                      </AvatarGroup>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" mb={2}>
            Squads You Are Part Of
          </Typography>
          {joinedSquads.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              You have not joined any squads yet.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {joinedSquads.map((squad, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={cardStyle} onClick={() => handleSquadClick(squad)}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {squad.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {squad.tagline}
                      </Typography>
                    </CardContent>
                    {squad.members && squad.members.length > 0 && (
                      <AvatarGroup max={4}>
                        {squad.members.map((member, idx) => {
                          const displayMember = getDisplayMember(member);
                          return (
                            <Avatar
                              key={idx}
                              src={displayMember.avatar || undefined}
                              alt={displayMember.name}
                            >
                              {!displayMember.avatar &&
                                displayMember.name &&
                                displayMember.name[0]}
                            </Avatar>
                          );
                        })}
                      </AvatarGroup>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Create Squad Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Squad</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Squad Name"
            fullWidth
            variant="outlined"
            value={newSquadName}
            onChange={(e) => setNewSquadName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Squad Tagline"
            fullWidth
            variant="outlined"
            value={newSquadTagline}
            onChange={(e) => setNewSquadTagline(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Squad Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newSquadDescription}
            onChange={(e) => setNewSquadDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSquad}
            disabled={!newSquadName || !newSquadTagline || !newSquadDescription}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Squad Details Dialog */}
      {selectedSquad && (
        <Dialog
          open={Boolean(selectedSquad)}
          onClose={handleCloseSquadDetail}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>{selectedSquad.name}</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {selectedSquad.tagline}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {selectedSquad.description}
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              Members:
            </Typography>
            <List>
              {selectedSquad.members.map((member, idx) => {
                const displayMember = getDisplayMember(member);
                return (
                  <ListItem key={idx}>
                    <ListItemAvatar>
                      <Avatar
                        src={displayMember.avatar || undefined}
                        alt={displayMember.name}
                      >
                        {!displayMember.avatar &&
                          displayMember.name &&
                          displayMember.name[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={displayMember.name} />
                  </ListItem>
                );
              })}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSquadDetail}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
}
