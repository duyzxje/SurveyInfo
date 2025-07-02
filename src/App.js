import React from "react";

import './App.css';

import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import AddSurvey from './pages/addSurvey';
import Success from './pages/success';
import SurveyList from './pages/surveyList';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Navigate to="/surveylist" replace />} />
            <Route path="/addsurvey" element={<AddSurvey />} />
            <Route path="/success/:id" element={<Success />} />
            <Route path="/surveylist" element={<SurveyList />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
