import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import SubjectAnalysis from "../pages/SubjectAnalysis";
import AnalysisResult from "../pages/AnalysisResult";
import QuickPredict from "../pages/QuickPredict";
import Documents from "../pages/Documents";
// import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import AppLayout from "../components/layout/AppLayout";
import Home from "../pages/Home";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/home", element: <Home /> },
          { path: "documents", element: <Documents /> },
          { path: "analysis/subject", element: <SubjectAnalysis /> },
          { path: "analysis/result/:analysisId", element: <AnalysisResult /> },
          { path: "predict/quick", element: <QuickPredict /> },
        ],
      },
    ],
  },

  // fallback
  { path: "*", element: <Navigate to="/login" /> },
]);

