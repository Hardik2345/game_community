import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayoutBasic from "./components/Dashboard";
import SignIn from "./components/SignIn";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<DashboardLayoutBasic />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </Router>
  );
}

export default App;
