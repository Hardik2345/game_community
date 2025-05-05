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
// import ReactVirtualizedTable from "./ReactVirtualizedTable";
import tournamentImage from "../assets/banner.jpg";
import CardActionArea from "@mui/material/CardActionArea";
// import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import context from "../context/context";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReactVirtualizedTable from "./ReactVirtualizedTable";

export default function LocalEventsPage({ currentUser }) {
  const a = useContext(context);
  const [openCreate, setOpenCreate] = useState(false);
  const [openPay, setOpenPay] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
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
  const [imageFile, setImageFile] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);

  useEffect(() => {
    a.fetchGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    a.fetchGamesForUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateOpen = () => setOpenCreate(true);
  const handleCreateClose = () => setOpenCreate(false);
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });
  const handleChange = (e) =>
    setEventDetails({ ...eventDetails, [e.target.name]: e.target.value });
  const handleTabChange = (e, newValue) => {
    setTab(newValue);
    setSelectedGame(null);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    Object.entries(eventDetails).forEach(([key, value]) =>
      formData.append(key, value)
    );
    if (imageFile) formData.append("imageCover", imageFile);
    try {
      await axios.post("http://localhost:8000/api/v1/events", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSnackbar({
        open: true,
        message: "Event created successfully!",
        severity: "success",
      });
      setOpenCreate(false);
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Failed to create event",
        severity: "error",
      });
    }
  };

  const handleJoinClick = (game) => {
    setSelectedGame(game);
    setOpenPay(true);
  };
  const handlePayClose = () => {
    setOpenPay(false);
    setSelectedGame(null);
  };
  const handleProceedToPayment = async () => {
    try {
      await axios.patch(
        `http://localhost:8000/api/v1/events/add-member`,
        { gameId: selectedGame._id, members: currentUser.id }, // or eventId, based on your backend
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Call your express route
      const { data } = await axios.get(
        `http://localhost:8000/api/v1/events/checkout-session/${selectedGame._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Redirect the browser to Stripe Checkout
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error("Stripe checkout init failed", err);
      setSnackbar({
        open: true,
        message: "Unable to start payment. Please try again.",
        severity: "error",
      });
    }
  };

  const dialogPaperSx = { p: 3, borderRadius: 3 };
  const contentSx = {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 360,
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
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderRadius: "10px",
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
                    onClick={handleCreateOpen}
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
          <Grid container spacing={2}>
            {a.games.length === 0 ? (
              <Typography ml={2}>No local games available.</Typography>
            ) : (
              a.games.map((game, i) => (
                <Grid item xs={12} sm={4} key={i}>
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
                      image={`http://localhost:8000/img/events/${game.imageCover}`}
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
                        sx={{
                          position: "absolute",
                          bottom: 12,
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                        onClick={() => handleJoinClick(game)}
                      >
                        Join Now
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </>
      )}

      {/* Active Tournaments Tab */}
      {tab === 1 &&
        (selectedTournament ? (
          <>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => setSelectedTournament(null)}
              >
                Back
              </Button>
            </Box>

            <ReactVirtualizedTable
              data={selectedTournament.players || []}
              onRowClick={(rowData) => console.log("Row clicked:", rowData)}
            />
          </>
        ) : a.userGames && a.userGames.length > 0 ? (
          a.userGames.map((game) => (
            <Card
              key={game._id}
              onClick={() => setSelectedTournament(game)}
              sx={{
                height: 200,
                borderRadius: "10px",
                position: "relative",
                mb: "10px",
              }}
            >
              <CardActionArea sx={{ height: "100%" }}>
                <CardContent sx={{ height: "100%" }}>
                  <Typography variant="h5">{game.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {game.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))
        ) : (
          <Typography ml={2}>No active tournaments joined.</Typography>
        ))}

      {/* Create Event Dialog */}
      <Dialog
        open={openCreate}
        onClose={handleCreateClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle sx={{ textAlign: "center" }}>
          Enter Event Details
        </DialogTitle>
        <DialogContent sx={contentSx}>
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
          <Button variant="outlined" component="label" sx={{ mt: 1 }}>
            Upload Image
            <input
              accept="image/*"
              type="file"
              hidden
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </Button>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={handleCreateClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog
        open={openPay}
        onClose={handlePayClose}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle sx={{ textAlign: "center" }}>Confirm Payment</DialogTitle>
        <DialogContent sx={{ ...contentSx, alignItems: "center" }}>
          <Typography sx={{ fontSize: "1.2rem", fontWeight: 500 }}>
            Price:
          </Typography>
          <Typography sx={{ fontSize: "1.5rem", mb: 1 }}>
            {selectedGame?.price} USD
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={handleProceedToPayment}
          >
            Proceed to Payment
          </Button>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pt: 0 }}>
          <Button onClick={handlePayClose}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
