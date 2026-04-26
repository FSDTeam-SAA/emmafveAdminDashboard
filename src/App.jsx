import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { LanguageProvider } from "./context/LanguageContext";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Pages
import AdminLoginPage from "./pages/AdminLoginPage";
import DashboardPage from "./pages/DashboardPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";
import PartnersPage from "./pages/PartnersPage";
import MissionsPage from "./pages/MissionsPage";
import CollectionPointsPage from "./pages/CollectionPointsPage";
import PointsPage from "./pages/PointsPage";
import PhysicalItemsPage from "./pages/PhysicalItemsPage";
import DonationsPage from "./pages/DonationsPage";
import CrowdfundingPage from "./pages/CrowdfundingPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import ValidationDonationsPage from "./pages/ValidationDonationsPage";
import ShopifyProductsPage from "./pages/ShopifyProductsPage";
import ContactsPage from "./pages/ContactsPage";

// Helper: is admin logged in?
const isAdmin = () => {
  try {
    const token = localStorage.getItem("adminAccessToken");
    const user = JSON.parse(localStorage.getItem("adminUser"));
    return !!(token && user && user.role === "admin");
  } catch {
    return false;
  }
};

const App = () => {
  return (
    <LanguageProvider>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Routes>
        {/* Root → dashboard if logged in, else login */}
        <Route
          path="/"
          element={<Navigate to={isAdmin() ? "/dashboard" : "/login"} replace />}
        />

        {/* Public Login */}
        <Route
          path="/login"
          element={
            isAdmin() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AdminLoginPage />
            )
          }
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="partners" element={<PartnersPage />} />
          <Route path="missions" element={<MissionsPage />} />
          <Route path="collection-points" element={<CollectionPointsPage />} />
          <Route path="points" element={<PointsPage />} />
          <Route path="items" element={<PhysicalItemsPage />} />
          <Route path="donations" element={<DonationsPage />} />
          <Route path="validation-donations" element={<ValidationDonationsPage />} />
          <Route path="shopify-products" element={<ShopifyProductsPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="crowdfunding" element={<CrowdfundingPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all */}
        <Route
          path="*"
          element={<Navigate to={isAdmin() ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </LanguageProvider>
  );
};

export default App;
