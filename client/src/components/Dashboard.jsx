import * as React from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { extendTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
// import TextField from "@mui/material/TextField";
// import Tooltip from "@mui/material/Tooltip";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import IconButton from "@mui/material/IconButton";
// import SearchIcon from "@mui/icons-material/Search";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";
import ChatIcon from "@mui/icons-material/Chat";
import LogoutIcon from "@mui/icons-material/Logout";
import { AppProvider } from "@toolpad/core";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import DashboardPage from "./DashboardPage";
import RecruitPlayersPage from "./RecruitPlayersPage";
import MySquadPage from "./MySquadPage";
import LocalEventsPage from "./LocalEventsPage";
import TeamChatPage from "./TeamChatPage";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import PersonIcon from "@mui/icons-material/Person";
import GameChatPage from "./GameChatPage";
// import axios from "axios";
import context from "../context/context";
import ProfilePage from "./ProfilePage";

// const API_BASE_URL = "http://localhost:8000/api/v1";

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

const demoTheme = extendTheme({
  colorSchemes: { light: true, dark: true },
  colorSchemeSelector: "class",
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

function SidebarFooter({ session, authentication }) {
  if (!session?.user?.name) {
    return null;
  }

  return (
    <Card
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        boxShadow: "none",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 0,
        "&:hover": {
          boxShadow: 1,
          transition: "box-shadow 0.3s ease-in-out",
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 2 }}>
        <Avatar
          src={session.user.image}
          alt={session.user.name}
          sx={{
            width: 40,
            height: 40,
            border: "2px solid",
            borderColor: "primary.main",
          }}
        />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body1" fontWeight="500" sx={{ lineHeight: 1.2 }}>
            {session.user.name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {session.user.email}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={authentication.signOut}
          sx={{
            color: "text.secondary",
            "&:hover": {
              color: "error.main",
            },
          }}
        >
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Card>
  );
}

// ✅ **PropTypes Validation**
SidebarFooter.propTypes = {
  session: PropTypes.shape({
    user: PropTypes.shape({
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
    }),
  }),
  authentication: PropTypes.shape({
    signIn: PropTypes.func.isRequired,
    signOut: PropTypes.func.isRequired,
  }).isRequired,
};

// Default Props (optional, to prevent errors if session is undefined)
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

// function ToolbarActionsSearch() {
//   return (
//     <Stack direction="row" spacing={1}>
//       <TextField label="Search" variant="outlined" size="small" />
//       <Tooltip title="Search" enterDelay={1000}>
//         <IconButton type="button" aria-label="search">
//           <SearchIcon />
//         </IconButton>
//       </Tooltip>
//       <ThemeSwitcher />
//     </Stack>
//   );
// }

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

  React.useEffect(() => {
    a.fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a.currentUser?.photo]);

  React.useEffect(() => {
    if (a.currentUser) {
      setSession((prevSession) => ({
        ...prevSession,
        user: {
          ...prevSession.user,
          name: a.currentUser.name,
          email: a.currentUser.email,
          image: `http://localhost:8000/img/users/${a.currentUser.photo}`,
        },
      }));
    } else {
      setSession((prevSession) => ({
        ...prevSession,
        user: null, // ✅ Properly reset user in session when logged out
      }));
    }
  }, [a.currentUser]);

  const appAuthentication = React.useMemo(() => {
    return {
      signIn: () => {
        navigate("/signin");
      },
      signOut: () => {
        localStorage.removeItem("token"); // Remove token
        setSession(null); // Reset session
        a.setCurrentUser(null); // Clear currentUser state
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <AppProvider
      session={session}
      authentication={appAuthentication}
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      branding={{ logo: "", title: "GuildHub" }}
    >
      <DashboardLayout
        slots={{
          // toolbarActions: ToolbarActionsSearch,
          sidebarFooter: () => (
            <SidebarFooter
              session={session}
              authentication={appAuthentication}
            />
          ),
        }}
        // slotProps={{
        //   toolbarAccount: a.currentUser
        //     ? {
        //         avatar: {
        //           src: `http://localhost:8000/img/users/${session.user.image}`,
        //         },
        //         slotProps: {
        //           popover: { open: false, sx: { display: "block" } },
        //           signOutButton: { sx: { display: "block" } },
        //         },
        //       }
        //     : {
        //         slotProps: {
        //           popover: { open: false, sx: { display: "none" } },
        //           signOutButton: { sx: { display: "none" } },
        //         },
        //       },
        // }}
        disableCollapsibleSidebar={true}
      >
        <PageContainer>{renderPage()}</PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}
