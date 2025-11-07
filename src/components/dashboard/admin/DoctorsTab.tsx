import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DoctorsTab = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    departmentId: "",
    specialization: "",
    qualification: "",
    experienceYears: "0",
  });
  const { toast } = useToast();

  const fetchData = async () => {
    const [doctorsRes, deptsRes] = await Promise.all([
      supabase.from("doctors").select(`
        *,
        user:profiles!doctors_user_id_fkey (full_name, email),
        department:departments!doctors_department_id_fkey (name)
      `).order("created_at", { ascending: false }),
      supabase.from("departments").select("*").order("name"),
    ]);

    setDoctors(doctorsRes.data || []);
    setDepartments(deptsRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!formData.email || !formData.password || !formData.fullName || !formData.departmentId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      user_metadata: { full_name: formData.fullName },
    });

    if (authError) {
      toast({ title: "Error", description: authError.message, variant: "destructive" });
      return;
    }

    // Assign doctor role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: authData.user.id, role: "doctor" });

    if (roleError) {
      toast({ title: "Error", description: roleError.message, variant: "destructive" });
      return;
    }

    // Create doctor profile
    const { error: doctorError } = await supabase
      .from("doctors")
      .insert({
        user_id: authData.user.id,
        department_id: formData.departmentId,
        specialization: formData.specialization,
        qualification: formData.qualification,
        experience_years: parseInt(formData.experienceYears),
      });

    if (doctorError) {
      toast({ title: "Error", description: doctorError.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Doctor added successfully" });
      setOpen(false);
      setFormData({
        email: "",
        password: "",
        fullName: "",
        departmentId: "",
        specialization: "",
        qualification: "",
        experienceYears: "0",
      });
      fetchData();
    }
  };

  const handleDelete = async (doctorId: string) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;

    const { error } = await supabase
      .from("doctors")
      .delete()
      .eq("id", doctorId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Doctor deleted successfully" });
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Doctors</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
              <DialogDescription>Create a new doctor account</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Dr. John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="doctor@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={formData.departmentId} onValueChange={(value) => setFormData({ ...formData, departmentId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Input
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="Cardiologist"
                />
              </div>
              <div className="space-y-2">
                <Label>Qualification</Label>
                <Input
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="MBBS, MD"
                />
              </div>
              <div className="space-y-2">
                <Label>Years of Experience</Label>
                <Input
                  type="number"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                  min="0"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Create Doctor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading doctors...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <Card key={doctor.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Dr. {doctor.user.full_name}
                    </CardTitle>
                    <CardDescription>{doctor.user.email}</CardDescription>
                  </div>
                  <Badge>{doctor.department.name}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm"><strong>Specialization:</strong> {doctor.specialization}</p>
                <p className="text-sm"><strong>Qualification:</strong> {doctor.qualification}</p>
                <p className="text-sm"><strong>Experience:</strong> {doctor.experience_years} years</p>
                <Button variant="destructive" size="sm" className="w-full mt-4" onClick={() => handleDelete(doctor.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorsTab;
