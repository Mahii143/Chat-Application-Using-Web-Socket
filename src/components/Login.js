import React from "react";
import { useState } from "react";

const Login = ({ setToken }) => {
  const [username, setUsername] = useState("");

  const getToken = async (username) => {
    const endpoint = "http://localhost:3001/login";
    try {
      await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username }),
      })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Login failed!"); // Throw an error if the response is not successful
        }
        return res.json();
      })
        .then((data) => setToken({ ...data }));
    } catch (error) {
      console.log(error.message);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    await getToken(username);
    console.log("form submitted", username);
  };
  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      <input
        type="text"
        name="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button>submit</button>
    </form>
  );
};

export default Login;
