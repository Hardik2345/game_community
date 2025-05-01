import { useEffect, useState } from "react";
import axios from "axios";
import { Line, Bar, Pie } from "react-chartjs-2";
import { useTheme } from "@mui/material/styles";
import { Paper, Box, Typography, Grid, Divider, Tooltip } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

export default function DashboardPage() {
  const theme = useTheme();
  const [matchData, setMatchData] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/dashboard/cached",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setMatchData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch match data:", error);
      }
    };
    fetchMatches();
  }, []);

  const chartColors = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    neutral: theme.palette.grey[700],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          padding: 10,
          color: theme.palette.text.primary,
          font: { size: 12 },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: theme.palette.text.secondary },
      },
      y: {
        grid: { color: theme.palette.divider },
        ticks: { color: theme.palette.text.secondary },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          padding: 10,
          color: theme.palette.text.primary,
          font: { size: 12 },
        },
      },
    },
  };

  const kdaLabels = matchData.map((_, i) => `Match ${i + 1}`);
  const kills = matchData.map((m) => parseInt(m.kda?.split(" / ")[0] || 0));
  const deaths = matchData.map((m) => parseInt(m.kda?.split(" / ")[1] || 0));
  const assists = matchData.map((m) => parseInt(m.kda?.split(" / ")[2] || 0));

  const kdaData = {
    labels: kdaLabels,
    datasets: [
      { label: "Kills", data: kills, backgroundColor: chartColors.success },
      { label: "Deaths", data: deaths, backgroundColor: chartColors.error },
      { label: "Assists", data: assists, backgroundColor: chartColors.warning },
    ],
  };

  const kdaRatios = matchData.map((m) => {
    const [k, d, a] = m.kda?.split(" / ").map(Number) || [0, 0, 0];
    return d ? ((k + a) / d).toFixed(2) : 0;
  });

  const performanceData = {
    labels: kdaLabels,
    datasets: [
      {
        label: "KDA Ratio",
        data: kdaRatios,
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primary + "99",
        tension: 0.3,
        pointBackgroundColor: chartColors.secondary,
        pointBorderColor: "#fff",
        pointRadius: 0, // Removed the points
        fill: false,
      },
    ],
  };

  const prizePoolData = {
    labels: ["1st", "2nd", "3rd", "Others"],
    datasets: [
      {
        data: [50000, 25000, 15000, 10000],
        backgroundColor: [
          chartColors.success,
          chartColors.primary,
          chartColors.secondary,
          chartColors.neutral,
        ],
      },
    ],
  };

  const renderChartCard = (title, chartComponent) => (
    <Paper
      sx={{
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solidrgb(32, 111, 202)",
        borderRadius: 3,
        background: "#161b22",
        boxShadow: "0 0 5px #1080ff",
        transition: "0.3s",
        "&:hover": {
          boxShadow: "0 0 10px #1080ff",
        },
      }}
      elevation={2}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          color: theme.palette.text.primary,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {title}
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0 }}>{chartComponent}</Box>
    </Paper>
  );

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontWeight: 700,
          textShadow: "0 0 10px #1080ff",
          color: theme.palette.primary.main,
        }}
      ></Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} sx={{ height: "400px" }}>
          {renderChartCard(
            "Performance Trend",
            <Line data={performanceData} options={chartOptions} />
          )}
        </Grid>
        <Grid item xs={12} md={6} sx={{ height: "400px" }}>
          {renderChartCard(
            "KDA Breakdown",
            <Bar data={kdaData} options={chartOptions} />
          )}
        </Grid>
        <Grid item xs={12} md={6} sx={{ height: "400px" }}>
          {renderChartCard(
            "Prize Distribution",
            <Pie data={prizePoolData} options={pieOptions} />
          )}
        </Grid>

        {/* Leaderboard or extra charts can be added here */}
      </Grid>
    </Box>
  );
}
