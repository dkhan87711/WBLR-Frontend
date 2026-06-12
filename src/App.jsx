import { Routes, Route } from "react-router-dom";

import { BhuManchitraHero } from "./components/Landing/BhuManchitraHero";
import { Department } from "./components/Department/Department";
import { Institution } from "./components/Institution/Institution";
import { Citizen } from "./components/Citizen/Citizen";

function App() {
  return (
    <Routes>
      <Route path="/" element={<BhuManchitraHero />} />
      <Route path="/department" element={<Department />} />
      <Route path="/institution" element={<Institution />} />
      <Route path="/citizen" element={<Citizen />} />
    </Routes>
  );
}

export default App;