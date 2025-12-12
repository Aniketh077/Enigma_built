import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import ToastContainer from "./components/ui/ToastContainer";
import ScrollToTop from "./components/ScrollToTop";
import { Provider } from "react-redux";
import { store } from "./store/store";
import DashboardLayout from "./components/layout/DashboardLayout";

// Auth Pages
import RoleSelectionPage from "./pages/auth/RoleSelectionPage";
import LoginPage from "./pages/auth/LoginPage";
import EnigmaRegisterPage from "./pages/auth/EnigmaRegisterPage";
import EmailVerificationPage from "./pages/auth/EmailVerificationPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Dashboard Pages
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import StartRFQPage from "./pages/StartRFQPage";
import RFQPoolPage from "./pages/RFQPoolPage";
import RFQDetailPage from "./pages/RFQDetailPage";
import MyRFQsPage from "./pages/MyRFQsPage";
import MyRFQDetailPage from "./pages/MyRFQDetailPage";
import AcceptedRFQsPage from "./pages/AcceptedRFQsPage";
import AcceptedRFQDetailPage from "./pages/AcceptedRFQDetailPage";
import InvitationsPage from "./pages/InvitationsPage";
import PricingPage from "./pages/PricingPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import ManufacturersPoolPage from "./pages/ManufacturersPoolPage";
import MyManufacturersPage from "./pages/MyManufacturersPage";
import AnalyticsPage from "./pages/AnalyticsPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/role-selection" replace />;
  }
  return children;
};

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route path="/role-selection" element={<RoleSelectionPage />} />
              <Route path="/register" element={<EnigmaRegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/verify-email"
                element={<EmailVerificationPage />}
              />
              <Route
                path="/verify-email/:token"
                element={<EmailVerificationPage />}
              />
              <Route
                path="/forgot-password"
                element={<ForgotPasswordPage />}
              />
              <Route
                path="/reset-password"
                element={<ResetPasswordPage />}
              />

              {/* Protected Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <DashboardPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ProfilePage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/start-rfq"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <StartRFQPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rfqs-pool"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <RFQPoolPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rfqs-pool/:id"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <RFQDetailPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-rfqs/:id"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <MyRFQDetailPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/start-rfq"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-bold mb-6">Start Your RFQ</h1>
                        <p className="text-gray-600">RFQ creation page coming soon...</p>
                      </div>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-rfqs"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <MyRFQsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/accepted-rfqs"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AcceptedRFQsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/accepted-rfqs/:id"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AcceptedRFQDetailPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/invitations"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <InvitationsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AnalyticsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manufacturers-pool"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ManufacturersPoolPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-manufacturers"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <MyManufacturersPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pricing"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <PricingPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <SettingsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/help"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <HelpPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/role-selection" replace />} />
              <Route path="*" element={<Navigate to="/role-selection" replace />} />
            </Routes>
            <ToastContainer />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
