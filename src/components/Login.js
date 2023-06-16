import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import url from "../endpoint.json";

const Login = ({ setToken }) => {
  const [username, setUsername] = useState("");
  const Navigate = useNavigate();
  const getToken = async (username) => {
    const endpoint = url.endpoint + "login";
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
        .then((data) => {
          setToken({ ...data });
          Navigate("../");
        });
    } catch (error) {
      alert(error);
      console.log(error.message);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    await getToken(username);
    // console.log("form submitted", username);
  };
  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h1>Good to see you again</h1>
      <p>Welcome to Mahir chatapp!</p>
      <label htmlFor="uname" className="login-input-label">
        USER NAME
        <input
          type="text"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          id="uname"
          placeholder="user name"
        />
      </label>
      <button>sign in</button>
      <p>Don't have an account? <Link to='../signup' className='route-login'>sign up</Link> </p>
    </form>
  );
};

export default Login;
