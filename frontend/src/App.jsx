import { useEffect, useState } from "react";
import axios from "axios";
import CSVUploader from "./components/CSVUploader";
import ChartView from "./components/ChartView";
import LoginForm from "./components/LoginForm";
import DynamicChart from "./components/DynamicChart";
import CSVVisualizer from "./CSVVisualizer";
import PublicChart from "./components/PublicChart";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TestUI from "./pages/TestUI";
import AuthPage from "./pages/AuthPage";
import Navbar from "./components/Navbar";
import Layout from "./components/Layout"


export default function App() {
  return (
    <Router>
      {/* Always visible navbar */}
      <Navbar />

      {/* Main page content */}
      <div className="min-h-screen px-4 py-6">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<CSVVisualizer />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/test" element={<TestUI />} />
          <Route path="/chart/:id" element={<PublicChart />} />
        </Routes>
      </div>
    </Router>
  );
}
