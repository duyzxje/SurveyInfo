import React from "react";

import './App.css';

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Survey from './pages/surveyInformation';
import Success from './pages/success';
import Home from "./pages/home";
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/survey" element={<Survey />} />
            <Route path="/success/:id" element={<Success />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
