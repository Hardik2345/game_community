import { useEffect, useState } from "react";
import axios from "axios";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { useTheme } from "@mui/material/styles";
import { Paper, Box, Typography, Grid } from "@mui/material";
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
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      try {
        // Fetch wallet data
        const walletRes = await axios.get(
          "http://localhost:8000/api/v1/wallets/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setWallet(walletRes.data.data);

        // Fetch match data
        const matchesRes = await axios.get(
          "http://localhost:8000/api/v1/dashboard/cached",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMatchData(matchesRes.data.data);
      } catch (error) {
        console.error("Dashboard data load error:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const chartColors = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    neutral: theme.palette.grey[700],
    background: theme.palette.background.default,
    text: theme.palette.text.primary,
  };

  const commonPlugins = {
    tooltip: {
      backgroundColor: theme.palette.background.paper,
      titleColor: theme.palette.text.primary,
      bodyColor: theme.palette.text.secondary,
      borderColor: theme.palette.divider,
      borderWidth: 1,
    },
    legend: {
      position: "top",
      labels: {
        boxWidth: 12,
        padding: 10,
        color: theme.palette.text.primary,
        font: { size: 12 },
      },
    },
  };

  const commonAnimation = {
    duration: 1000,
    easing: "easeOutQuart",
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: commonPlugins,
    animation: commonAnimation,
    scales: {
      x: {
        title: {
          display: true,
          text: "Matches",
          color: theme.palette.text.primary,
          font: { size: 14 },
        },
        grid: { display: false },
        ticks: { color: theme.palette.text.secondary },
      },
      y: {
        title: {
          display: true,
          text: "KDA Ratio",
          color: theme.palette.text.primary,
          font: { size: 14 },
        },
        grid: { color: theme.palette.divider },
        ticks: { color: theme.palette.text.secondary },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: commonPlugins,
    animation: commonAnimation,
    scales: {
      x: {
        barPercentage: 0.5,
        categoryPercentage: 0.8,
        title: {
          display: true,
          text: "Matches",
          color: theme.palette.text.primary,
          font: { size: 14 },
        },
        grid: { display: false },
        ticks: { color: theme.palette.text.secondary },
      },
      y: {
        title: {
          display: true,
          text: "Count",
          color: theme.palette.text.primary,
          font: { size: 14 },
        },
        grid: { color: theme.palette.divider },
        ticks: { color: theme.palette.text.secondary },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: commonPlugins,
    animation: commonAnimation,
    cutout: "50%",
  };

  const kdaLabels = matchData.map((_, i) => `Match ${i + 1}`);
  const kills = matchData.map((m) => parseInt(m.kda?.split(" / ")[0] || 0));
  const deaths = matchData.map((m) => parseInt(m.kda?.split(" / ")[1] || 0));
  const assists = matchData.map((m) => parseInt(m.kda?.split(" / ")[2] || 0));

  const kdaData = {
    labels: kdaLabels,
    datasets: [
      {
        label: "Kills",
        data: kills,
        backgroundColor: chartColors.success,
        borderRadius: 5,
      },
      {
        label: "Deaths",
        data: deaths,
        backgroundColor: chartColors.error,
        borderRadius: 5,
      },
      {
        label: "Assists",
        data: assists,
        backgroundColor: chartColors.warning,
        borderRadius: 5,
      },
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
        backgroundColor: chartColors.primary + "40",
        tension: 0.3,
        pointBackgroundColor: chartColors.secondary,
        pointBorderColor: "#fff",
        pointRadius: 0,
        pointHoverRadius: 5,
        fill: true,
        borderWidth: 2,
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
        borderWidth: 2,
        borderColor: "#fff",
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
        border: "1px solid rgb(32, 111, 202)",
        borderRadius: 3,
        background: chartColors.background,
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
          color: chartColors.text,
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

  const renderWalletCard = () => (
    <Paper
      sx={{
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid rgb(32, 111, 202)",
        borderRadius: 3,
        background: chartColors.background,
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
          color: chartColors.text,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Wallet Balance
      </Typography>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 500,
            color: chartColors.success,
            textShadow: "none",
          }}
        >
          ₹{wallet?.balance ?? "--"}
        </Typography>
      </Box>
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
      <Grid container spacing={3}>
        <Grid item xs={12} md={12} sx={{ height: "200px" }}>
          {renderWalletCard()}
        </Grid>
        <Grid item xs={12} md={6} sx={{ height: "400px" }}>
          {renderChartCard(
            "Performance Trend",
            <Line data={performanceData} options={lineOptions} />
          )}
        </Grid>
        <Grid item xs={12} md={6} sx={{ height: "400px" }}>
          {renderChartCard(
            "KDA Breakdown",
            <Bar data={kdaData} options={barOptions} />
          )}
        </Grid>
        <Grid item xs={12} md={12} sx={{ height: "400px" }}>
          {renderChartCard(
            "Prize Distribution",
            <Doughnut data={prizePoolData} options={doughnutOptions} />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
