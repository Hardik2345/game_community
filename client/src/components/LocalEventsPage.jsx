/* eslint-disable react/prop-types */
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import { CardMedia } from "@mui/material";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import ReactVirtualizedTable from "./ReactVirtualizedTable";
import tournamentImage from "../assets/banner.jpg";
import CardActionArea from "@mui/material/CardActionArea";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import context from "../context/context";

export default function LocalEventsPage({ currentUser }) {
  const a = useContext(context);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [eventDetails, setEventDetails] = useState({
    name: "",
    duration: "",
    maxGroupSize: "",
    difficulty: "",
    price: "",
    description: "",
    imageCover: "",
    createdBy: currentUser.id,
  });
  // track selected game for detailed view
  const [cardSelected, setCardSelected] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    a.fetchGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    a.fetchGamesForUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });
  const handleChange = (e) =>
    setEventDetails({ ...eventDetails, [e.target.name]: e.target.value });
  const handleTabChange = (e, newValue) => {
    setTab(newValue);
    setCardSelected(false);
    setSelectedGame(null);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:8000/api/v1/events",
        { ...eventDetails, createdBy: currentUser.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbar({
        open: true,
        message: "Event created successfully!",
        severity: "success",
      });
      setOpen(false);
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Failed to create event",
        severity: "error",
      });
    }
  };

  const joinNow = async (id, member) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        "http://localhost:8000/api/v1/events/add-member",
        { gameId: id, members: member },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbar({
        open: true,
        message: "Member added successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Failed to add member to the event",
        severity: "error",
      });
    }
  };

  return (
    <>
      {/* Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 2,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Tabs value={tab} onChange={handleTabChange}>
          <Tab label="Tournaments" />
          <Tab label="Active Tournaments" />
        </Tabs>
      </Box>

      {/* Tournaments Tab */}
      {tab === 0 && (
        <>
          <Grid container spacing={3} alignItems="flex-start">
            <Grid item xs={12}>
              <Card
                sx={{
                  height: 200,
                  backgroundImage: `url(${tournamentImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  color: "black",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderRadius: "10px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <CardContent sx={{ backgroundColor: "transparent" }}>
                  <Typography
                    gutterBottom
                    variant="h4"
                    sx={{ fontSize: "30px", color: "#ff6600" }}
                  >
                    Create Tournament!
                  </Typography>
                </CardContent>
                <CardActions
                  sx={{ backgroundColor: "transparent", paddingLeft: "12px" }}
                >
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      borderRadius: "5px",
                      position: "absolute",
                      bottom: 10,
                      left: 15,
                    }}
                    onClick={handleClickOpen}
                  >
                    Get Started
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
          <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>
            Local Games
          </Typography>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {a.games.length === 0 ? (
                <Typography ml={2}>No local games available.</Typography>
              ) : (
                a.games.map((game, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Card
                      sx={{
                        borderRadius: "16px",
                        height: 300,
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="140"
                        image={game.imageCover}
                        alt="Game cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "/default-image-icon-missing-picture-page-vector-40546530.jpg";
                        }}
                      />
                      <CardContent>
                        <Typography variant="h6">{game.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {game.description}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ position: "absolute", bottom: 10 }}
                          onClick={() => joinNow(game._id, currentUser.id)}
                        >
                          Join Now
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </Grid>
        </>
      )}

      {/* Active Tournaments Tab */}
      {tab === 1 && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {!cardSelected ? (
            a.userGames && a.userGames.length > 0 ? (
              a.userGames.map((game) => (
                <Card
                  key={game._id}
                  sx={{
                    height: 200,
                    backgroundPosition: "center",
                    color: "black",
                    justifyContent: "space-between",
                    borderRadius: "10px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <CardActionArea
                    onClick={() => {
                      setCardSelected(true);
                      setSelectedGame(game);
                    }}
                    sx={{
                      height: "100%",
                      "&[data-active]": {
                        backgroundColor: "action.selected",
                        "&:hover": {
                          backgroundColor: "action.selectedHover",
                        },
                      },
                    }}
                  >
                    <CardContent sx={{ height: "100%" }}>
                      <Typography
                        variant="h5"
                        component="div"
                        sx={{ color: "white" }}
                      >
                        {game.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {game.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))
            ) : (
              <Typography ml={2}>No active tournaments joined.</Typography>
            )
          ) : (
            <>
              <Button
                onClick={() => {
                  setCardSelected(false);
                  setSelectedGame(null);
                }}
                sx={{ minWidth: 10, padding: 0, alignSelf: "flex-start" }}
              >
                <ArrowLeftIcon sx={{ width: 30, height: 30 }} />
              </Button>
              <ReactVirtualizedTable game={selectedGame} />
            </>
          )}
        </Box>
      )}

      {/* Dialog for Creating Event */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Enter Event Details</DialogTitle>
        <DialogContent>
          <TextField
            label="Event Name"
            name="name"
            fullWidth
            margin="dense"
            onChange={handleChange}
          />
          <TextField
            label="Duration"
            name="duration"
            fullWidth
            margin="dense"
            onChange={handleChange}
          />
          <TextField
            label="Max Group Size"
            name="maxGroupSize"
            fullWidth
            margin="dense"
            onChange={handleChange}
          />
          <TextField
            label="Difficulty"
            name="difficulty"
            fullWidth
            margin="dense"
            onChange={handleChange}
          />
          <TextField
            label="Price"
            name="price"
            fullWidth
            margin="dense"
            onChange={handleChange}
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={3}
            margin="dense"
            onChange={handleChange}
          />
          <TextField
            label="Image Cover URL"
            name="imageCover"
            fullWidth
            margin="dense"
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Alerts */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </>
  );
}
