import React from "react";
import { useState } from "react";
import Login from "./components/Login";
import { useEffect } from "react";
import ChatApp from "./components/ChatApp";

function App() {
  const [token, setToken] = useState({
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
  });
  // useState(localStorage.getItem('accessToken'));
  useEffect(() => {
    if (token.accessToken !== null)
      localStorage.setItem("accessToken", token.accessToken);
    if (token.refreshToken !== null)
      localStorage.setItem("refreshToken", token.refreshToken);
    // return console.log(token);
  }, [token]);
  if (token.accessToken === null && token.refreshToken === null)
    return (
      <div className="app">
        <Login setToken={setToken} />
      </div>
    );
  else
    return (
      <div className="app">
        <ChatApp token={token} setToken={setToken} />
      </div>
    );
}

export default App;
