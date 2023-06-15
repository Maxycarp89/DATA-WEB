import React, { useRef, useState } from "react";
import Home from "./components/Home";
import Cards from "./components/Cards";
import { BrowserRouter, Route, Routes } from "react-router-dom";
//import LayoutAuth from "./layouts/LayoutAuth";
import LayoutAdmin from "./components/dashboardAdmin/layouts/LayoutAdmin";
// Pages auth
import Login from "./components/dashboardAdmin/pages/auth/Login";
import Register from "./components/dashboardAdmin/pages/auth/Register";
import ForgetPassword from "./components/dashboardAdmin/pages/auth/ForgetPassword";
// Pages admin
import Dasboard from "./components/dashboardAdmin/pages/admin/Dashboard";
import Profile from "./components/dashboardAdmin/pages/admin/Profile";
import Error404 from "./components/dashboardAdmin/pages/Error404";
import CardButton from "./components/CardButton";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={ <Home /> } />
        <Route exact path="options" element={<Cards /> } />
        <Route exact path="services" element={<CardButton/> } />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/olvide-password" element={<ForgetPassword />} />
        <Route path="/dashboard" element={<LayoutAdmin />}>
          <Route exact path="/dashboard" element={<Dasboard />} />
          <Route path="perfil" element={<Profile />} />
        </Route>
        <Route path="*" element={<Error404 />} />
      </Routes>
    </div>
  );
}

export default App;
