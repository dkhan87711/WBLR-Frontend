import "./BhuManchitraHero.css";
import { useNavigate } from "react-router-dom";

export const BhuManchitraHero = () => {

  const navigate = useNavigate();

  return (
    <div className="hero-container">

      <div className="header-text">
        <div className="title-badge">GeoSpatial Intelligence Platform</div>

        <h2 className="main-title-header">
          Bhu <span>Manchitra</span>
        </h2>

        <h5 className="sub-title-header">
          Land Records, Survey & Analytics Platform
        </h5>

        <div className="underline-header"></div>

        <p className="description-header">
          Integrated Geospatial Platform for Land Governance,
          Monitoring and Decision Support System.
        </p>
      </div>

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