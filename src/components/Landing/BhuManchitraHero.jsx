
import "./BhuManchitraHero.css";
import { useNavigate } from "react-router-dom";

import departmentLogo from "../../assets/images/department.png";
import institutionLogo from "../../assets/images/institution.png";
import citizenLogo from "../../assets/images/citizen.png";

import logo1 from "../../assets/images/ulmp.png";
import logo2 from "../../assets/images/ulmp-approval.png";
import logo3 from "../../assets/images/datahub.png";
import logo4 from "../../assets/images/3d.png";
import logo5 from "../../assets/images/urban.png";
import logo6 from "../../assets/images/property.png";
import logo7 from "../../assets/images/aseet.png";
import logo8 from "../../assets/images/road.png";

import appConfig from "../../assets/config/url.json";

export const BhuManchitraHero = () => {
  const navigate = useNavigate();

  const appLogos = [
    { src: logo1, size: 90, title: appConfig[0].title },
    { src: logo3, size: 75, title: appConfig[2].title },
    { src: logo5, size: 90, title: appConfig[4].title },
  ];

  const appLogos2 = [
    { src: logo2, size: 80, title: appConfig[1].title },
    { src: logo4, size: 85, title: appConfig[3].title },
    { src: logo6, size: 90, title: appConfig[5].title },
  ];

  const loginCards = [
    {
      title: "Department Login",
      description: "Access administrative GIS and governance tools",
      logo: departmentLogo,
      route: "/department",
    },
    {
      title: "Institution Login",
      description: "Access institutional dashboards and services",
      logo: institutionLogo,
      route: "/institution",
    },
    {
      title: "Citizen Login",
      description: "Access public land services and information",
      logo: citizenLogo,
      route: "/citizen",
    },
  ];

  return (
    <div className="hero-container">
      {/* Header */}
      <div className="header-text">
        <div className="title-badge">GeoSpatial Intelligence Platform</div>
        <h2 className="main-title-header">
          ULMP : Unified Land Management Platform<span></span>
        </h2>
      </div>

      {/* ================= APP LOGOS STRIP ================= */}
      <div className="app-logos-container">
        {appLogos.map((logo, index) => (
          <div className="app-logo-item" key={index}>

            {/* Permanent Title */}
            <span className="app-logo-title">
              {logo.title}
            </span>

            {/* CSS Connector */}
            <div className="app-logo-connector">
              <span className="connector-line"></span>
              <span className="connector-arrow"></span>
            </div>

            {/* Logo */}
            <div className="app-logo-circle">
              <img
                src={logo.src}
                alt={logo.title}
                style={{
                  width: `${logo.size}px`,
                  height: `${logo.size}px`,
                  objectFit: "contain",
                }}
              />
            </div>

          </div>
        ))}
      </div>

      <div className="app-logos-container2">
        {appLogos2.map((logo, index) => (
          <div className="app-logo-item" key={index}>

            {/* Permanent Title */}
            <span className="app-logo-title">
              {logo.title}
            </span>

            {/* CSS Connector */}
            <div className="app-logo-connector">
              <span className="connector-line"></span>
              <span className="connector-arrow"></span>
            </div>

            {/* Logo */}
            <div className="app-logo-circle">
              <img
                src={logo.src}
                alt={logo.title}
                style={{
                  width: `${logo.size}px`,
                  height: `${logo.size}px`,
                  objectFit: "contain",
                }}
              />
            </div>

          </div>
        ))}
      </div>

      {/* Login Cards */}
      <div className="login-cards-container">
        {loginCards.map((card) => (
          <div className="login-card-home" key={card.title}>
            {/* Logo */}
            <div className="card-logo-wrapper">
              <img
                src={card.logo}
                alt={card.title}
                className="card-logo"
              />
            </div>

            {/* Content */}
            <div className="card-content">
              <h3>{card.title}</h3>

              <p>{card.description}</p>

              <button
                className="login-btn-home"
                onClick={() => navigate(card.route)}
              >
                Login →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BhuManchitraHero;