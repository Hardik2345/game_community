import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import backgroundImage from "../assets/image.jpg";
import tournamentImage from "../assets/banner.jpg";
import ReactVirtualizedTable from "./ReactVirtualizedTable";

export default function LocalEventsPage() {
  return (
    <>
      <Grid container spacing={3} alignItems="flex-start">
        <Grid item xs={12} sm={6} md={4}>
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
        </Grid>

        {/* New "Organize Tournament" Card */}
        <Grid item xs={12} sm={6} md={4}>
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
    </>
  );
}
