/* eslint-disable react/prop-types */
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
import tournamentImage from "../assets/banner.jpg";
import ReactVirtualizedTable from "./ReactVirtualizedTable";

export default function LocalEventsPage({ currentUser }) {
  const [open, setOpen] = useState(false);
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

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const handleChange = (e) => {
    setEventDetails({ ...eventDetails, [e.target.name]: e.target.value });
  };

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
      <Grid container spacing={3} alignItems="flex-start">
        {/* <Grid item xs={12} sm={12} md={12}>
          <Card
            sx={{
              maxWidth: 300,
              height: 200,
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              color: "black",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ backgroundColor: "transparent" }}>
              <Typography
                gutterBottom
                variant="h1"
                sx={{ fontSize: "35px", color: "#cfff00" }}
              >
                World Gaming Day!
              </Typography>
            </CardContent>
            <CardActions
              sx={{ backgroundColor: "transparent", paddingLeft: "12px" }}
            >
              <Button
                size="small"
                variant="contained"
                sx={{ borderRadius: "5px" }}
              >
                Learn More
              </Button>
            </CardActions>
          </Card>
        </Grid> */}

        <Grid item xs={12} sm={12} md={12}>
          <Card
            sx={{
              maxWidth: 300,
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
                sx={{ borderRadius: "5px" }}
                onClick={handleClickOpen}
              >
                Get Started
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Typography
        variant="h4"
        sx={{ paddingTop: "30px", paddingBottom: "10px" }}
      >
        Leaderboard
      </Typography>
      <ReactVirtualizedTable />

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
