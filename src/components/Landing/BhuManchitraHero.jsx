import "./BhuManchitraHero.css";
import { useNavigate } from "react-router-dom";

export const BhuManchitraHero = () => {

  const navigate = useNavigate();

  return (
    <div className="hero-container">

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