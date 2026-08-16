import "leaflet/dist/leaflet.css";
import Login from "./pages/Login";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import Vehicles from "./pages/manager/Vehicles";
import Drivers from "./pages/manager/Drivers";
import MaintenanceLog from "./pages/manager/MaintenanceLog";
import TireReplacementVerification from "./pages/manager/TireReplacementVerification";
import FuelLog from "./pages/manager/FuelLog";
import AccidentLog from "./pages/manager/AccidentLog";
import TransportRequests from "./pages/manager/TransportRequests";
import JourneyLog from "./pages/manager/JourneyLog";
import { VehicleRequest } from "./pages/staff";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Role from "./enums/role";
import { RequestDashboard, MaintenanceRequest } from "./pages/requester";
import TireReplacementForm from "./pages/requester/TireReplacementForm";
import TireLog from "./pages/manager/TireLog";

import InsuranceList from "./pages/manager/InsuranceList";
// Import the Users component
import Users from "./pages/Admin/users";
import Department from "./pages/Admin/department";
import ControllerDashboard from "./pages/controller/ControllerDashboard";
import ControllerDashboardd from "./pages/controller/ControllerDashboardd";
// import VehicleMap from "./components/VehicleMap";

import "leaflet/dist/leaflet.css";
import FleetTracking from "./pages/manager/FleetTracking";
import AIMaintenanceSuggestion from "./pages/manager/AIMaintenanceSuggestion";
import Reports from "./pages/manager/Reports";
import FixedVehicleAssignment from "./pages/manager/FixedVehicleAssignment";
import BoloList from "./pages/manager/Bolo";

/**
 * Main application component for the Fleet Management System frontend.
 *
 * Sets up the React Router structure and role-based protected routes for all major pages.
 * Uses ProtectedRoute to restrict access based on authentication and user role.
 */
function App() {
  // Check if the user is authenticated and get their role from localStorage
  const isAuthenticated = !!localStorage.getItem("accessToken");
  const userRole = localStorage.getItem("role");
  return (
    <Router basename="/fms" >
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />

        {/* Manager routes (logistics roles) */}
        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute
              element={<ManagerDashboard />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.LOGISTICS_OFFICER, Role.LOGISTICS_HEAD]}
              userRole={userRole}
            />
          }
        />
        <Route
          path="/manager/vehicles"
          element={
            <ProtectedRoute
              element={<Vehicles />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.LOGISTICS_OFFICER, Role.LOGISTICS_HEAD]}
              userRole={userRole}
            />
          }
        />
        <Route
          path="/manager/drivers"
          element={
            <ProtectedRoute
              element={<Drivers />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.LOGISTICS_OFFICER, Role.LOGISTICS_HEAD]}
              userRole={userRole}
            />
          }
        />
        <Route
          path="/manager/vehicle-requests"
          element={
            <ProtectedRoute
              element={<TransportRequests />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.LOGISTICS_OFFICER, Role.LOGISTICS_HEAD]}
              userRole={userRole}
            />
          }
        />
        <Route
          path="/manager/journey-logs"
          element={
            <ProtectedRoute
              element={<JourneyLog />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.LOGISTICS_OFFICER, Role.LOGISTICS_HEAD]}
              userRole={userRole}
            />
          }
        />
        {/* <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute
              element={<StaffDashboard />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.DEPARTMENT_HEAD, Role.DIRECTOR, Role.EMPLOYEE]}
              userRole={userRole}
            />
          }
        /> */}
        <Route
          path="/manager/MaintenanceLog"
          element={
            <ProtectedRoute
              element={<MaintenanceLog />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.LOGISTICS_OFFICER, Role.LOGISTICS_HEAD]}
              userRole={userRole}
            />
          }
        />
        <Route
          path="/manager/tire-replacement"
          element={
            <ProtectedRoute
              element={<TireReplacementVerification />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.LOGISTICS_OFFICER, Role.LOGISTICS_HEAD]}
              userRole={userRole}
            />
          }
        />
        <Route
          path="/manager/tire-replacement/log"
          element={
            <ProtectedRoute
              element={<TireLog />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.LOGISTICS_OFFICER, Role.LOGISTICS_HEAD]}
              userRole={userRole}
            />
          }
        />
        <Route
          path="/manager/FuelLog"
          element={
            <ProtectedRoute
              element={<FuelLog />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.LOGISTICS_OFFICER, Role.LOGISTICS_HEAD]}
              userRole={userRole}
            />
          }
        />
        <Route
          path="/manager/AccidentLog"
          element={
            <ProtectedRoute
              element={<AccidentLog />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.LOGISTICS_OFFICER, Role.LOGISTICS_HEAD]}
              userRole={userRole}
            />
          }
        />
        <Route
          path="/manager/InsuranceList"
          element={
            <ProtectedRoute
              element={<InsuranceList />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.LOGISTICS_OFFICER, Role.LOGISTICS_HEAD]}
              userRole={userRole}
            />
          }
        />
        <Route
          path="/staff/vehicle-request"
          element={
            <ProtectedRoute
              element={<VehicleRequest />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,
                Role.DEPARTMENT_HEAD,
                Role.DIRECTOR,
                Role.EMPLOYEE,
                Role.MAINTENANCE_REQUESTER,
                Role.JOURNEY_CONTROLLER,
                Role.LOGISTICS_OFFICER,
                Role.LOGISTICS_HEAD,
              ]}
              userRole={userRole}
            />
          }
        />
        <Route
          path="/manager/bolo"
          element={
            <ProtectedRoute
              element={<BoloList />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,
                Role.LOGISTICS_OFFICER,
                Role.LOGISTICS_HEAD,
              ]}
              userRole={userRole}
            />
          }
        />
        {/* <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              element={<Users />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.ADMIN]}
              userRole={userRole}
            />
          }
        /> */}
        {/* Add the route for Users page */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute
              element={<Users />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.LOGISTICS_OFFICER,Role.LOGISTICS_HEAD]}
              userRole={userRole}
            />
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute
              element={<Department />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.LOGISTICS_OFFICER,Role.LOGISTICS_HEAD]}
              userRole={userRole}
            />
          }
        />

        <Route
          path="/request/dashboard"
          element={
            <ProtectedRoute
              element={<RequestDashboard />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.MAINTENANCE_REQUESTER]}
              userRole={userRole}
            />
          }
        />
        <Route
          path="/request/maintenance-request" // why disclosed
          element={
            <ProtectedRoute
              element={<MaintenanceRequest />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.MAINTENANCE_REQUESTER]}
              userRole={userRole}
            />
          }
        />
        <Route
          path="/request/tire-replacement" // why disclosed
          element={
            <ProtectedRoute
              element={<TireReplacementForm />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.MAINTENANCE_REQUESTER]}
              userRole={userRole}
            />
          }
        />
        <Route
          path="/controller/dashboard"
          element={
            <ProtectedRoute
              element={<ControllerDashboard />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,
                Role.JOURNEY_CONTROLLER,
                Role.LOGISTICS_OFFICER,
                Role.LOGISTICS_HEAD,
              ]}
              userRole={userRole}
            />
          }
        />

        <Route
          path="/controller/inspection"
          element={
            <ProtectedRoute
              element={<ControllerDashboardd />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.JOURNEY_CONTROLLER]}
              userRole={userRole}
            />
          }
        />
        <Route
          path="/vehicles/locations"
          element={
            <ProtectedRoute
              element={<FleetTracking />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,
                Role.JOURNEY_CONTROLLER,
                Role.LOGISTICS_OFFICER,
                Role.LOGISTICS_HEAD,
                Role.ADMIN,
                Role.DEPARTMENT_HEAD,
                Role.EMPLOYEE,
              ]}
              userRole={userRole}
            />
          }
        />
        <Route
          path="/manager/ai-maintenance"
          element={
            <ProtectedRoute
              element={<AIMaintenanceSuggestion />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.LOGISTICS_OFFICER, Role.LOGISTICS_HEAD]}
              userRole={userRole}
            />
          }
        />

        <Route
          path="/manager/reports"
          element={
            <ProtectedRoute
              element={<Reports />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.LOGISTICS_OFFICER, Role.LOGISTICS_HEAD]}
              userRole={userRole}
            />
          }
        />
        <Route
          path="/manager/fixed-vehicle-assignment"
          element={
            <ProtectedRoute
              element={<FixedVehicleAssignment />}
              isAuthenticated={isAuthenticated}
              allowedRoles={[Role.ADMIN,Role.LOGISTICS_OFFICER, Role.LOGISTICS_HEAD]}
              userRole={userRole}
            />
          }
        />
        {/* Catch-all route for unknown resources under  - redirect to login page */}
        <Route path="/*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
