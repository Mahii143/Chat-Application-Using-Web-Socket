import React from "react";

const LogoutBtn = ({ setToken }) => {
  const logout = () => {
    localStorage.clear();
    setToken({ accessToken: null, refreshToken: null });
  };
  return (
    <button className="logout-button" onClick={logout}>
      <span className="material-symbols-outlined">power_settings_new</span>
    </button>
  );
};

export default LogoutBtn;
