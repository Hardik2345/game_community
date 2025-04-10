import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayoutBasic from "./components/Dashboard";
import SignIn from "./components/SignIn";
import State from "./context/state";

function App() {
  return (
    <>
      <State>
        <Router>
          <Routes>
            <Route path="/*" element={<DashboardLayoutBasic />} />
            <Route path="/signin" element={<SignIn />} />
          </Routes>
        </Router>
      </State>
    </>
  );
}

export default App;
