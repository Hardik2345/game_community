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
import tournamentImage from "../assets/banner.jpg";
import CardActionArea from "@mui/material/CardActionArea";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import context from "../context/context";
// import { display } from "@mui/system";

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
  const [cardSelected, setCardSelected] = useState(0);

  useEffect(() => {
    a.fetchGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });
  const handleChange = (e) => {
    setEventDetails({ ...eventDetails, [e.target.name]: e.target.value });
  };
  const handleTabChange = (event, newValue) => setTab(newValue);

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    try {
      const updatedEventDetails = {
        ...eventDetails,
        createdBy: currentUser.id,
      };
      await axios.post(
        "http://localhost:8000/api/v1/events",
        updatedEventDetails,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSnackbar({
        open: true,
        message: "Event created successfully!",
        severity: "success",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error creating event:", error);
      setSnackbar({
        open: true,
        message: "Failed to create event",
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

      {/* Tab Panels */}
      {tab === 0 && (
        <>
          <Grid container spacing={3} alignItems="flex-start">
            <Grid item xs={12} sm={12} md={12}>
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
                    variant="h1"
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
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Local Games
            </Typography>
            <Grid container spacing={2}>
              {a.games.length === 0 ? (
                <Typography ml={2}>No local games available.</Typography>
              ) : (
                a.games.map((game, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Card sx={{ borderRadius: "16px" }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={game.imageCover}
                        alt={game.name}
                      />
                      <CardContent>
                        <Typography variant="h6">{game.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {game.description}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button variant="outlined" size="small">
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
            <Card
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
                onClick={() => setCardSelected(true)} // This sets the state to show the back button
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
                    This is card title.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This is card content
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ) : (
            <Button
              onClick={() => setCardSelected(false)}
              sx={{
                minWidth: 10,
                width: "auto",
                padding: 0,
                alignSelf: "flex-start",
              }}
            >
              <ArrowLeftIcon sx={{ width: 30, height: 30 }} />
            </Button>
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
