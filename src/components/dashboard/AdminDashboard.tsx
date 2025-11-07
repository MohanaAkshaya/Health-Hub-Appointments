import { useState } from "react";
import DashboardLayout from "./DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building, Calendar } from "lucide-react";
import DepartmentsTab from "./admin/DepartmentsTab";
import DoctorsTab from "./admin/DoctorsTab";
import AppointmentsTab from "./admin/AppointmentsTab";

const AdminDashboard = () => {
  return (
    <DashboardLayout title="Admin Dashboard">
      <Tabs defaultValue="departments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="departments" className="gap-2">
            <Building className="h-4 w-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="doctors" className="gap-2">
            <Users className="h-4 w-4" />
            Doctors
          </TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2">
            <Calendar className="h-4 w-4" />
            Appointments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="departments">
          <DepartmentsTab />
        </TabsContent>

        <TabsContent value="doctors">
          <DoctorsTab />
        </TabsContent>

        <TabsContent value="appointments">
          <AppointmentsTab />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AdminDashboard;
