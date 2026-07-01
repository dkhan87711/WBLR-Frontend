import "./BhuManchitraHero.css";
import { useNavigate } from "react-router-dom";
import logo from "../../Assets/logo4.png";

export const BhuManchitraHero = () => {

  const navigate = useNavigate();

  return (
    <div className="hero-container">
      <div className="header-text">

        <div className="title-badge">GeoSpatial Intelligence Platform</div>

        <h2 className="main-title-header">
          Bhu-<span>Manchitra</span>
        </h2>

        <p className="title-badge">
          Integrated Geospatial Platform for Land Governance,
          Monitoring and Decision Support System.
        </p>

      </div>

      {/* <div className="logo-container">
        <img src={logo} alt="Bhu-Manchitra Logo" className="hero-logo" />
      </div> */}

      <button
        className="btn department-btn"
        onClick={() => navigate("/department")}
      />
      <button
        className="btn institution-btn"
        onClick={() => navigate("/institution")}
      />
      <button
        className="btn citizen-btn"
        onClick={() => navigate("/citizen")}
      />
    </div>
  );

};