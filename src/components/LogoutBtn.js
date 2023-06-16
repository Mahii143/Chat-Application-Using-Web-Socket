import React from "react";
import { useNavigate } from "react-router-dom";

const LogoutBtn = ({ setToken }) => {
  const Navigate = useNavigate();
  const logout = () => {
    localStorage.clear();
    setToken({ accessToken: null, refreshToken: null });
    Navigate("/");
  };
  return (
    <button className="logout-button" onClick={logout}>
      <span className="material-symbols-outlined">power_settings_new</span>
    </button>
  );
};

export default LogoutBtn;
