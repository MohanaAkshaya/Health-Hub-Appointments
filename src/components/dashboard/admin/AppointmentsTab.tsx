import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Users } from "lucide-react";
import { format } from "date-fns";

const AppointmentsTab = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey (full_name, email),
        doctor:doctors!appointments_doctor_id_fkey (
          *,
          user:profiles!doctors_user_id_fkey (full_name),
          department:departments!doctors_department_id_fkey (name)
        )
      `)
      .order("appointment_date", { ascending: false });

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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">All Appointments</h2>

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
            <Card key={appointment.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{appointment.patient.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Dr. {appointment.doctor.user.full_name}</span>
                    </div>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>
                
                <div className="space-y-2 text-sm border-t pt-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(appointment.appointment_date), "PPP")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{appointment.appointment_time}</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground border-t pt-2">
                  <Badge variant="outline" className="text-xs">
                    {appointment.doctor.department.name}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsTab;
