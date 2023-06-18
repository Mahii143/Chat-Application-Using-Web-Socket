import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import url from "../endpoint.json";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const Navigate = useNavigate();
  const getToken = async (_email, _password) => {
    const endpoint = url.endpoint + "login";
    try {
      await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: _email, password: _password }),
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
    await getToken(email, password);
  };
  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h1>Good to see you again</h1>
      <p>Welcome to Mahir chatapp!</p>
      <label htmlFor="uname" className="login-input-label">
        Email
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          id="uname"
          placeholder="email"
        />
      </label>
      <label htmlFor="pwd" className="login-input-label">
        Password
        <input
          type="password"
          name="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          id="pwd"
          placeholder="password"
        />
      </label>
      <button>sign in</button>
      <p>
        Don't have an account?{" "}
        <Link to="../signup" className="route-login">
          sign up
        </Link>{" "}
      </p>
    </form>
  );
};

export default Login;
