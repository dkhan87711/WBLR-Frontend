import { Routes, Route } from "react-router-dom";

import { BhuManchitraHero } from "./components/Landing/BhuManchitraHero";
import { Department } from "./components/Department/Department";
import { Institution } from "./components/Institution/Institution";
import { Citizen } from "./components/Citizen/Citizen";
import MapPage from "./components/MapPage/MapPage";
import ApprovalPage from "./components/Approval/Approval";

// ✅ Correct SessionManager import
import SessionManager from "./components/Session/SessionManager";

function App() {
  return (
    <SessionManager>
      <Routes>
        <Route path="/" element={<BhuManchitraHero />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/approval" element={<ApprovalPage />} />

        <Route path="/department" element={<Department />} />
        <Route path="/institution" element={<Institution />} />
        <Route path="/citizen" element={<Citizen />} />
      </Routes>
    </SessionManager>
  );
}

export default App;