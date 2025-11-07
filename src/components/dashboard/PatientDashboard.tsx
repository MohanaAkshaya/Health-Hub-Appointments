import { useState, useEffect } from "react";
import DashboardLayout from "./DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BookAppointmentDialog from "./BookAppointmentDialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAppointments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        doctor:doctors!appointments_doctor_id_fkey (
          *,
          user:profiles!doctors_user_id_fkey (full_name),
          department:departments!doctors_department_id_fkey (name)
        )
      `)
      .eq("patient_id", user.id)
      .order("appointment_date", { ascending: true });

    if (error) {
      const { logError } = await import('@/lib/logger');
      logError('Fetching appointments', error);
      toast({
        variant: "destructive",
        title: "Error loading appointments",
      });
    } else {
      setAppointments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancelAppointment = async (id: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      });
      fetchAppointments();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      confirmed: "default",
      rejected: "destructive",
      cancelled: "outline",
    };
    
    return (
      <Badge variant={variants[status] || "default"} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <DashboardLayout title="Patient Dashboard">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Appointments</h2>
          <BookAppointmentDialog onSuccess={fetchAppointments} />
        </div>

        {loading ? (
          <div className="text-center py-12">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No appointments found</p>
              <BookAppointmentDialog onSuccess={fetchAppointments} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        Dr. {appointment.doctor.user.full_name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {appointment.doctor.department.name}
                      </CardDescription>
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
                      {appointment.notes}
                    </p>
                  )}
                  {(appointment.status === "pending" || appointment.status === "confirmed") && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Appointment
                    </Button>
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

export default PatientDashboard;
