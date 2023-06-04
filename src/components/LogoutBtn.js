import React from "react";

const LogoutBtn = ({setToken}) => {
  const logout = () => {
    localStorage.clear();
    setToken({accessToken: null , refreshToken: null});
  };
  return <button onClick={logout}>Logout</button>;
};

export default LogoutBtn;
