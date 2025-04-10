import { useState } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
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
import { display } from "@mui/system";

export default function LocalEventsPage() {
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
  });

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
      await axios.post("http://localhost:8000/api/v1/events", eventDetails, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} sm={12} md={12}>
            <Card
              sx={{
                flexGrow: 5,
                height: 200,
                backgroundImage: `url(${tournamentImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                color: "black",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: "20px",
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
      )}

      {tab === 1 && (
        <Box p={2}>
          <Typography variant="h6">
            Active tournaments will be listed here...
          </Typography>
          {/* You can map through events here */}
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
