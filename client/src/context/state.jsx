import Context from "./context";
import { useState } from "react";
import axios from "axios";

const State = (props) => {
  const [currentUser, setCurrentUser] = useState({});
  const [teams, setTeams] = useState([]);
  const [squads, setSquads] = useState([]);
  const [games, setGames] = useState([]);
  const [userGames, setUserGames] = useState([]);

  // Helper to get axios config for JWT or session
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : { withCredentials: true };
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/users/me",
        getAuthConfig()
      );
      const userData = response?.data?.data?.data;
      const newUser = {
        id: userData._id,
        name: userData.name,
        avatar: userData.avatar || "",
        email: userData.email,
        photo: userData.photo,
      };
      setCurrentUser(newUser);
      setSquads(userData.team || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  const fetchUser = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/users/me",
        getAuthConfig()
      );
      console.log("Response from fetchUser:", response);
      const userData = response?.data?.data?.data;
      console.log("Fetched user data:", userData);
      if (userData) {
        const newUser = {
          id: userData._id,
          name: userData.name,
          email: userData.email,
          photo: userData.photo,
        };
        setTeams(userData.team);
        setCurrentUser((prevUser) =>
          JSON.stringify(prevUser) !== JSON.stringify(newUser)
            ? newUser
            : prevUser
        );
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      setCurrentUser(null);
      console.error("Error fetching user", error);
    }
  };
  const fetchTeams = async () => {
    if (currentUser) {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/users/me",
          getAuthConfig()
        );
        console.log("Response from fetchTeams:", response);
        setTeams(response.data?.data?.data?.team);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    }
  };
  const fetchGames = async () => {
    if (currentUser) {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/events",
          getAuthConfig()
        );
        console.log("Response from fetchGames:", response);
        setGames(response.data?.data?.data);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    }
  };
  const fetchGamesForUser = async () => {
    if (currentUser) {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/users/me",
          getAuthConfig()
        );
        console.log("Response from fetchGamesForUser:", response);
        setUserGames(response.data?.data?.data?.event);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    }
  };
  return (
    <Context.Provider
      value={{
        fetchUserData,
        currentUser,
        teams,
        fetchTeams,
        fetchUser,
        squads,
        setSquads,
        setCurrentUser,
        games,
        fetchGames,
        fetchGamesForUser,
        userGames,
      }}
    >
      {/* eslint-disable react/prop-types */}
      {props.children}
    </Context.Provider>
  );
};

export default State;
