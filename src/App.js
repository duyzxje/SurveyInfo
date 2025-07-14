import React from "react";

import './App.css';

import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import AddSurvey from './pages/addSurvey';
import Success from './pages/success';
import SurveyList from './pages/surveyList';
import Login from './pages/login';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Navigate to="/addsurvey" replace />} />
              <Route path="/addsurvey" element={<AddSurvey />} />
              <Route path="/success/:id" element={<Success />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/surveylist"
                element={
                  <ProtectedRoute>
                    <SurveyList />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
