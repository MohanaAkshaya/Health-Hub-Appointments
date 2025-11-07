-- Fix profiles table RLS policy to restrict access
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Doctors can view patient profiles for their appointments
CREATE POLICY "Doctors can view patient profiles for appointments"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM appointments a
    JOIN doctors d ON d.id = a.doctor_id
    WHERE d.user_id = auth.uid()
    AND a.patient_id = profiles.id
  )
);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Add input validation constraints
ALTER TABLE departments
ADD CONSTRAINT name_length CHECK (length(name) <= 100 AND length(name) > 0);

ALTER TABLE departments
ADD CONSTRAINT description_length CHECK (description IS NULL OR length(description) <= 500);

ALTER TABLE appointments
ADD CONSTRAINT notes_length CHECK (notes IS NULL OR length(notes) <= 1000);

ALTER TABLE doctors
ADD CONSTRAINT specialization_length CHECK (length(specialization) <= 100 AND length(specialization) > 0);

ALTER TABLE doctors
ADD CONSTRAINT qualification_length CHECK (length(qualification) <= 200 AND length(qualification) > 0);

ALTER TABLE doctors
ADD CONSTRAINT experience_valid CHECK (experience_years >= 0 AND experience_years <= 70);

ALTER TABLE profiles
ADD CONSTRAINT full_name_length CHECK (length(full_name) <= 100 AND length(full_name) > 0);

ALTER TABLE profiles
ADD CONSTRAINT email_length CHECK (length(email) <= 255 AND length(email) > 0);

ALTER TABLE profiles
ADD CONSTRAINT phone_length CHECK (phone IS NULL OR length(phone) <= 20);
