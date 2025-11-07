import { useState, useEffect } from "react";
import DashboardLayout from "./DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAppointments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: doctorData } = await supabase
      .from("doctors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!doctorData) return;

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey (full_name, email, phone)
      `)
      .eq("doctor_id", doctorData.id)
      .order("appointment_date", { ascending: true });

    if (error) {
      console.error("Error fetching appointments:", error);
    } else {
      setAppointments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id: string, status: "confirmed" | "rejected") => {
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Appointment ${status} successfully`,
      });
      fetchAppointments();
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className?: string }> = {
      pending: { variant: "secondary", className: "bg-warning text-warning-foreground" },
      confirmed: { variant: "default", className: "bg-success text-success-foreground" },
      rejected: { variant: "destructive" },
      cancelled: { variant: "outline" },
    };
    
    const { variant, className } = config[status] || { variant: "default" };
    
    return (
      <Badge variant={variant} className={className}>
        {status}
      </Badge>
    );
  };

  return (
    <DashboardLayout title="Doctor Dashboard">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Appointment Requests</h2>

        {loading ? (
          <div className="text-center py-12">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No appointments found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {appointment.patient.full_name}
                      </CardTitle>
                      <CardDescription>{appointment.patient.email}</CardDescription>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(appointment.appointment_date), "PPP")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{appointment.appointment_time}</span>
                    </div>
                  </div>
                  {appointment.notes && (
                    <p className="text-sm text-muted-foreground border-t pt-2">
                      <strong>Notes:</strong> {appointment.notes}
                    </p>
                  )}
                  {appointment.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 bg-success hover:bg-success/90"
                        onClick={() => handleUpdateStatus(appointment.id, "confirmed")}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleUpdateStatus(appointment.id, "rejected")}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
