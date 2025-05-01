import Context from "./context";
import { useState } from "react";
import axios from "axios";

const State = (props) => {
  const [currentUser, setCurrentUser] = useState({});
  const [teams, setTeams] = useState([]);
  const [squads, setSquads] = useState([]);
  const [games, setGames] = useState([]);
  const [userGames, setUserGames] = useState([]);
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8000/api/v1/users/me",
        { headers: { Authorization: `Bearer ${token}` } }
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
      const token = localStorage.getItem("token");
      if (!token) {
        setCurrentUser(null);
        throw new Error("No token present");
      }
      const response = await axios.get(
        `http://localhost:8000/api/v1/users/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const userData = response?.data?.data?.data;
      const newUser = {
        id: userData._id,
        name: userData.name,
        email: userData.email,
        photo: userData.photo,
      };
      setTeams(userData.team);

      // Update state only if the user has changed
      setCurrentUser((prevUser) =>
        JSON.stringify(prevUser) !== JSON.stringify(newUser)
          ? newUser
          : prevUser
      );
    } catch (error) {
      console.error("Error fetching user", error);
    }
  };
  const fetchTeams = async () => {
    if (currentUser) {
      try {
        const token = localStorage.getItem("token");
        // Adjust endpoint as per your API route for fetching user teams
        const response = await axios.get(
          "http://localhost:8000/api/v1/users/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Assuming the returned data has a "teams" array
        setTeams(response.data?.data?.data?.team);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    }
  };
  const fetchGames = async () => {
    if (currentUser) {
      try {
        const token = localStorage.getItem("token");
        // Adjust endpoint as per your API route for fetching user teams
        const response = await axios.get(
          "http://localhost:8000/api/v1/events",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Assuming the returned data has a "teams" array
        setGames(response.data?.data?.data);
        // setGames((prevGames) => [...prevGames, response.data?.data?.data]);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    }
  };
  const fetchGamesForUser = async () => {
    if (currentUser) {
      try {
        const token = localStorage.getItem("token");
        // Adjust endpoint as per your API route for fetching user teams
        const response = await axios.get(
          "http://localhost:8000/api/v1/users/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Assuming the returned data has a "teams" array
        setUserGames(response.data?.data?.data?.event);
        // setGames((prevGames) => [...prevGames, response.data?.data?.data]);
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
