import { useNavigate } from "react-router-dom";
import Home from "../components/Home";

export default function Landing() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    if (path === "login") navigate("/login");
    else if (path === "register") navigate("/register");
    else if (path === "forgot") navigate("/forgot-password");
  };

  return <Home onNavigate={handleNavigate} />;
}