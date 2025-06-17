import React from "react";

import './App.css';

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Survey from './pages/surveyInformation';
import Success from './pages/success';
import Home from "./pages/home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Survey" element={<Survey />} />
        <Route path="/success/:id" element={<Success />} />
      </Routes>
    </Router>
  );
}

export default App;
