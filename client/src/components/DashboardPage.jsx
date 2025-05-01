import { useEffect, useState } from "react";
import axios from "axios";
import { Line, Bar, Pie } from "react-chartjs-2";
import { useTheme } from "@mui/material/styles";
import {
  Paper,
  Box,
  Typography,
  Grid,
  // Table,
  // TableBody,
  // TableCell,
  // TableContainer,
  // TableHead,
  // TableRow,
} from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
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
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const theme = useTheme();
  const [matchData, setMatchData] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/matches/valorant-matches"
        );
        setMatchData(response.data);
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
    neutral: theme.palette.grey[500],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 10,
          padding: 8,
          color: theme.palette.text.primary,
          font: {
            size: 11,
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: theme.palette.text.secondary,
          font: { size: 11 },
        },
      },
      y: {
        grid: { color: theme.palette.divider },
        ticks: {
          color: theme.palette.text.secondary,
          font: { size: 11 },
        },
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
          boxWidth: 10,
          padding: 8,
          color: theme.palette.text.primary,
          font: {
            size: 11,
          },
        },
      },
      title: {
        display: false,
      },
    },
  };

  // Prepare KDA chart data
  const kdaLabels = matchData.map((match, i) => `Match ${i + 1}`);
  const kills = matchData.map((match) =>
    parseInt(match.kda?.split(" / ")[0] || 0)
  );
  const deaths = matchData.map((match) =>
    parseInt(match.kda?.split(" / ")[1] || 0)
  );
  const assists = matchData.map((match) =>
    parseInt(match.kda?.split(" / ")[2] || 0)
  );

  const kdaData = {
    labels: kdaLabels,
    datasets: [
      { label: "Kills", data: kills, backgroundColor: chartColors.success },
      { label: "Deaths", data: deaths, backgroundColor: chartColors.error },
      { label: "Assists", data: assists, backgroundColor: chartColors.warning },
    ],
  };

  // Prepare KDA Ratio chart
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
        backgroundColor: chartColors.primary,
        tension: 0.3,
        fill: false,
      },
    ],
  };

  // const leaderboardData = []; // Leave your static leaderboard or build one later

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

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={6} sx={{ height: "400px" }}>
          <Paper
            sx={{
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
            }}
            elevation={1}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Performance Trend
            </Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <Line data={performanceData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={6} sx={{ height: "400px" }}>
          <Paper
            sx={{
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
            }}
            elevation={1}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              KDA Breakdown
            </Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <Bar data={kdaData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={6} sx={{ height: "400px" }}>
          <Paper
            sx={{
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
            }}
            elevation={1}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Prize Distribution
            </Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <Pie data={prizePoolData} options={pieOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Optional: your leaderboard chart/table below */}
      </Grid>
    </Box>
  );
}
