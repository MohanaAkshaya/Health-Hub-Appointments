import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import PatientDashboard from "@/components/dashboard/PatientDashboard";
import DoctorDashboard from "@/components/dashboard/DoctorDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (userRole === "admin") {
    return <AdminDashboard />;
  }

  if (userRole === "doctor") {
    return <DoctorDashboard />;
  }

  return <PatientDashboard />;
};

export default Dashboard;
