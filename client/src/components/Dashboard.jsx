import * as React from "react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createTheme,
  ThemeProvider,
  responsiveFontSizes,
} from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";
import ChatIcon from "@mui/icons-material/Chat";
import LogoutIcon from "@mui/icons-material/Logout";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import PersonIcon from "@mui/icons-material/Person";
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Import icon for theme toggle
import { AppProvider } from "@toolpad/core";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import DashboardPage from "./DashboardPage";
import RecruitPlayersPage from "./RecruitPlayersPage";
import MySquadPage from "./MySquadPage";
import LocalEventsPage from "./LocalEventsPage";
import TeamChatPage from "./TeamChatPage";
import GameChatPage from "./GameChatPage";
import ProfilePage from "./ProfilePage";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import context from "../context/context";

const NAVIGATION = [
  {
    segment: "dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
    fullPath: "/dashboard",
  },
  {
    segment: "recruit",
    title: "Recruit Players",
    icon: <PeopleIcon />,
    fullPath: "/recruit",
  },
  {
    segment: "events",
    title: "Local Events",
    icon: <EmojiEventsIcon />,
    fullPath: "/events",
  },
  {
    segment: "chat",
    title: "Chat",
    icon: <ChatIcon />,
    children: [
      {
        segment: "team-chat",
        title: "Team Chat",
        icon: <GroupsIcon />,
        fullPath: "/chat/team-chat",
      },
      {
        segment: "game-chat",
        title: "Game Chat",
        icon: <SportsEsportsIcon />,
        fullPath: "/chat/game-chat",
      },
    ],
  },
  {
    segment: "squad",
    title: "My Squad",
    icon: <GroupsIcon />,
    fullPath: "/squad",
  },
  {
    segment: "profile",
    title: "Profile Settings",
    icon: <PersonIcon />,
    fullPath: "/profile",
  },
];

function SidebarFooter({ session, authentication }) {
  if (!session?.user?.name) return null;

  return (
    <Card
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 0,
        boxShadow: "0 0 10px #1080ff",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 2 }}>
        <Avatar
          src={session.user.image}
          alt={session.user.name}
          sx={{
            width: 44,
            height: 44,
            border: "2px solid",
            borderColor: "primary.main",
            boxShadow: "0 0 8px #1080ff",
          }}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body1" fontWeight="600" noWrap>
            {session.user.name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ fontStyle: "italic" }}
          >
            {session.user.email}
          </Typography>
        </Box>
        <IconButton onClick={authentication.signOut} color="secondary">
          <LogoutIcon />
        </IconButton>
      </Stack>
    </Card>
  );
}

SidebarFooter.propTypes = {
  session: PropTypes.shape({
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      image: PropTypes.string,
    }),
  }),
  authentication: PropTypes.shape({
    signIn: PropTypes.func.isRequired,
    signOut: PropTypes.func.isRequired,
  }).isRequired,
};

SidebarFooter.defaultProps = {
  session: null,
};

function useRouter() {
  const [pathname, setPathname] = React.useState(window.location.pathname);
  React.useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  return {
    pathname,
    navigate: (path) => {
      window.history.pushState({}, "", path);
      setPathname(path);
    },
  };
}

export default function DashboardLayoutBasic() {
  const a = useContext(context);
  const navigate = useNavigate();

  const [session, setSession] = React.useState({
    user: {
      name: "",
      email: "",
      image: "",
    },
  });

  const [darkMode, setDarkMode] = useState(true); // State to toggle light/dark mode

  React.useEffect(() => {
    a.fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a.currentUser?.photo]);

  React.useEffect(() => {
    if (a.currentUser) {
      setSession({
        user: {
          name: a.currentUser.name,
          email: a.currentUser.email,
          image: `http://localhost:8000/img/users/${a.currentUser.photo}`,
        },
      });
    } else {
      setSession(null);
    }
  }, [a.currentUser]);

  const appAuthentication = React.useMemo(
    () => ({
      signIn: () => navigate("/signin"),
      signOut: () => {
        localStorage.removeItem("token");
        setSession(null);
        a.setCurrentUser(null);
      },
    }),
    [navigate, a]
  );

  const router = useRouter();

  const renderPage = () => {
    switch (router.pathname) {
      case "/dashboard":
        return <DashboardPage />;
      case "/recruit":
        return <RecruitPlayersPage currentUser={a.currentUser} />;
      case "/events":
        return <LocalEventsPage currentUser={a.currentUser} />;
      case "/squad":
        return <MySquadPage currentUser={a.currentUser} />;
      case "/chat/team-chat":
        return <TeamChatPage currentUser={a.currentUser} />;
      case "/chat/game-chat":
        return <GameChatPage currentUser={a.currentUser} />;
      case "/profile":
        return <ProfilePage currentUser={a.currentUser} />;
      default:
        router.navigate("/dashboard");
        return <DashboardPage />;
    }
  };

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  let theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light", // Switch between dark and light mode
      background: {
        default: darkMode ? "#0d1117" : "#f5f5f5",
        paper: darkMode ? "#161b22" : "#ffffff",
      },
      primary: {
        main: "#1080ff",
      },
      secondary: {
        main: "#ff00ff",
      },
      text: {
        primary: darkMode ? "#e6edf3" : "#000000",
        secondary: darkMode ? "#8b949e" : "#555555",
      },
    },
  });

  const demoTheme = createTheme({
    cssVariables: {
      colorSchemeSelector: "data-toolpad-color-scheme",
    },
    colorSchemes: { light: true, dark: true },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 600,
        lg: 1200,
        xl: 1536,
      },
    },
  });

  theme = responsiveFontSizes(theme);

  return (
    <ThemeProvider theme={theme}>
      <AppProvider
        session={session}
        authentication={appAuthentication}
        navigation={NAVIGATION}
        router={router}
        theme={demoTheme}
        branding={{
          logo: "", // Make sure this file exists in your public/assets
          title: "SquadronX",
          titleStyle: {
            // Corrected to titleStyle
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            textAlign: "center",
          },
        }}
      >
        <DashboardLayout
          slots={{
            sidebarFooter: () => (
              <SidebarFooter
                session={session}
                authentication={appAuthentication}
              />
            ),
          }}
          disableCollapsibleSidebar
        >
          <PageContainer>
            <IconButton
              onClick={toggleDarkMode} // Toggle dark mode
              color="primary"
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 10,
              }}
            >
              <Brightness4Icon />
            </IconButton>
            {renderPage()}
          </PageContainer>
        </DashboardLayout>
      </AppProvider>
    </ThemeProvider>
  );
}
