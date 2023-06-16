import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import url from "../endpoint.json";
import { Link } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const Navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpointSignup = url.endpoint + "user";
    try {
      await fetch(endpointSignup, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          name: username,
          password: password,
        }),
      })
        .then((resp) => {
          if (!resp.ok) alert(resp);
          alert("Account created successfully");
          Navigate("../signin");
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h1>Join the fun</h1>
      <p>Welcome to Mahir chatapp!</p>
      <label htmlFor="email" className="login-input-label">
        User Name
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          id="email"
          placeholder="email id"
        />
      </label>
      <label htmlFor="uname" className="login-input-label">
        User Name
        <input
          type="text"
          name="username"
          value={username}
          onChange={(e) => setUserName(e.target.value)}
          id="uname"
          placeholder="user name"
        />
      </label>
      <label htmlFor="pwd" className="login-input-label">
        Password
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          id="pwd"
          placeholder="password (example: 3faSs@d2j1/#)"
        />
      </label>
      <button>sign up</button>
      <p>
        Already have an account?{" "}
        <Link to="../signin" className="route-signup">
          sign in
        </Link>{" "}
      </p>
    </form>
  );
};

export default Signup;
