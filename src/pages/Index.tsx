import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Activity, Calendar, Users, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">HealthCare Portal</span>
          </div>
          <Button onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Your Health, Our Priority
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Book appointments with top doctors, manage your healthcare journey, and receive quality medical care from anywhere.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
                <Calendar className="h-5 w-5" />
                Book Appointment
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 pt-12">
            <div className="bg-card p-6 rounded-xl shadow-lg border">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">For Patients</h3>
              <p className="text-sm text-muted-foreground">
                Book appointments, view doctor availability, and manage your healthcare records easily.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-lg border">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">For Doctors</h3>
              <p className="text-sm text-muted-foreground">
                Manage appointment requests, view patient information, and streamline your practice.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-lg border">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">For Administrators</h3>
              <p className="text-sm text-muted-foreground">
                Complete control over doctors, departments, and appointment oversight.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 border-t mt-20">
        <p className="text-center text-muted-foreground text-sm">
          © 2025 HealthCare Portal. Quality healthcare for everyone.
        </p>
      </footer>
    </div>
  );
};

export default Index;
