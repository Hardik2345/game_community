import { useState, useEffect, useContext } from "react";
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
import context from "../context/context";

export default function MySquadPage() {
  const a = useContext(context);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Store all pending invites for the user
  const [invites, setInvites] = useState([]);

  // State for Create Squad Dialog
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newSquadName, setNewSquadName] = useState("");
  const [newSquadTagline, setNewSquadTagline] = useState("");
  const [newSquadDescription, setNewSquadDescription] = useState("");

  // State for Squad Detail Dialog and current user
  const [selectedSquad, setSelectedSquad] = useState(null);

  // Fetch current user, squads, and invites on component mount
  useEffect(() => {
    a.fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to fetch invites
  const fetchInvites = async () => {
    if (a.currentUser) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8000/api/v1/invites",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Invites response:", response);
        // Only pending invites are returned from the backend
        setInvites(response.data.data || []);
      } catch (error) {
        console.error("Error fetching invites:", error);
      }
    }
  };

  // Initial fetch of invites when a.currentUser is available
  useEffect(() => {
    fetchInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a.currentUser]);

  // Refresh invites function for the refresh button
  const refreshInvites = async () => {
    await fetchInvites();
    setSnackbar({
      open: true,
      message: "Invites refreshed",
      severity: "success",
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateSquad = async () => {
    try {
      const token = localStorage.getItem("token");
      const userRes = await axios.get("http://localhost:8000/api/v1/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = userRes?.data?.data?.data;
      const newSquad = {
        name: newSquadName,
        tagline: newSquadTagline,
        description: newSquadDescription,
        members: [userData._id],
        createdBy: userData._id,
      };

      await axios.post("http://localhost:8000/api/v1/teams", newSquad, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: "Team created successfully!",
        severity: "success",
      });
      a.setSquads((prevSquads) => [...prevSquads, newSquad]);
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
      a.currentUser &&
      (member === a.currentUser.id || member === a.currentUser._id)
    ) {
      return a.currentUser;
    }
    return { name: "Member", avatar: "" };
  };

  // Handle invite accept action: update invite status and add current user to the team
  const handleAcceptInvite = async (invite) => {
    try {
      const token = localStorage.getItem("token");
      // 1. Accept the invite (update its status to accepted)
      await axios.patch(
        `http://localhost:8000/api/v1/invites/${invite._id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove the invite from state
      setInvites((prevInvites) =>
        prevInvites.filter((i) => i._id !== invite._id)
      );

      // 2. Fetch all teams and locate the team matching the invite's squadName
      const teamsRes = await axios.get("http://localhost:8000/api/v1/teams", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let teams = [];
      if (Array.isArray(teamsRes.data.data)) {
        teams = teamsRes.data.data;
      } else if (teamsRes.data.data && Array.isArray(teamsRes.data.data.data)) {
        teams = teamsRes.data.data.data;
      }
      console.log("Teams fetched:", teams);

      // 3. Find the team matching the invite's squadName
      const teamToJoin = teams.find((team) => team.name === invite.squadName);
      console.log("Team to join:", teamToJoin);
      if (teamToJoin) {
        // 4. Create an updated team object with the current user added to members (if not already included)
        const updatedTeam = {
          ...teamToJoin,
          members: teamToJoin.members.includes(a.currentUser.id)
            ? teamToJoin.members
            : [...teamToJoin.members, a.currentUser],
        };

        // 5. Call the specialized PATCH endpoint to add the current user to the team.
        await axios.patch(
          "http://localhost:8000/api/v1/teams/add-member",
          { teamId: teamToJoin._id, memberId: a.currentUser.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // 6. Immediately update the local squads state so the joined team appears in the "Joined Squads" tab.
        a.setSquads((prevSquads) => {
          const teamExists = prevSquads.find(
            (team) => team._id === teamToJoin._id
          );
          if (teamExists) {
            return prevSquads.map((team) =>
              team._id === teamToJoin._id ? updatedTeam : team
            );
          }
          return [...prevSquads, updatedTeam];
        });
        setSnackbar({
          open: true,
          message: "Invite accepted and joined team!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Team not found for this invite.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error accepting invite:", error);
      setSnackbar({
        open: true,
        message: "Failed to accept invite",
        severity: "error",
      });
    }
  };

  // Handle invite decline action: update invite status to declined
  const handleDeclineInvite = async (inviteId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:8000/api/v1/invites/${inviteId}/decline`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInvites((prevInvites) =>
        prevInvites.filter((invite) => invite._id !== inviteId)
      );
      setSnackbar({
        open: true,
        message: "Invite declined",
        severity: "success",
      });
    } catch (error) {
      console.error("Error declining invite:", error);
      setSnackbar({
        open: true,
        message: "Failed to decline invite",
        severity: "error",
      });
    }
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
    minHeight: "250px",
  };

  // Derived squads based on createdBy field once a.currentUser is loaded
  const createdSquads = a.currentUser
    ? a.squads.filter((squad) => squad.createdBy === a.currentUser.id)
    : [];
  const joinedSquads = a.currentUser
    ? a.squads.filter((squad) => squad.createdBy !== a.currentUser.id)
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
          <Tab label="Invites" />
        </Tabs>
      </Box>

      {/* Created Squads Tab */}
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

      {/* Joined Squads Tab */}
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

      {/* Invites Tab */}
      {tabValue === 2 && (
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Pending Invites</Typography>
            {/* Minimalist Refresh Button */}
            <Button variant="outlined" size="small" onClick={refreshInvites}>
              Refresh Invites
            </Button>
          </Box>
          {invites.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              You have no pending invites.
            </Typography>
          ) : (
            invites.map((invite) => (
              <Card
                key={invite._id}
                sx={{
                  p: 2,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar src={invite.sender?.avatar || undefined}>
                    {invite.sender && !invite.sender.avatar
                      ? invite.sender.name[0]
                      : ""}
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6">{invite.squadName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      From: {invite.sender?.name || "Unknown"}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Button
                    onClick={() => handleAcceptInvite(invite)}
                    sx={{ mr: 1 }}
                  >
                    ✓
                  </Button>
                  <Button onClick={() => handleDeclineInvite(invite._id)}>
                    ✗
                  </Button>
                </Box>
              </Card>
            ))
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
