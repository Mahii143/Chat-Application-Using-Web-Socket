import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import Login from "./components/Login";
import ChatApp from "./components/ChatApp";

function App() {
  const [token, setToken] = useState({
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
  });

  useEffect(() => {
    if (token.accessToken !== null)
      localStorage.setItem("accessToken", token.accessToken);
    if (token.refreshToken !== null)
      localStorage.setItem("refreshToken", token.refreshToken);
  }, [token]);

  if (token.accessToken === null && token.refreshToken === null)
    return (
      <div className="app">
        <div className="login-container">
          <Login setToken={setToken} />
        </div>
      </div>
    );
  else
    return (
      <div className="app">
        <Routes>
          <Route
            path="*"
            element={<ChatApp token={token} setToken={setToken} />}
          />
        </Routes>
      </div>
    );
}

export default App;
