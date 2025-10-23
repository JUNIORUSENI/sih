-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.allergies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  substance text NOT NULL,
  severity USER-DEFINED,
  notes text,
  CONSTRAINT allergies_pkey PRIMARY KEY (id),
  CONSTRAINT allergies_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  doctor_id uuid,
  centre_id uuid NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  reason text,
  status USER-DEFINED DEFAULT 'SCHEDULED'::appointment_status,
  notes_admin text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.profiles(id),
  CONSTRAINT appointments_centre_id_fkey FOREIGN KEY (centre_id) REFERENCES public.centres(id)
);
CREATE TABLE public.centres (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  address text NOT NULL,
  phone text,
  email text,
  CONSTRAINT centres_pkey PRIMARY KEY (id)
);
CREATE TABLE public.consultations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  doctor_id uuid,
  centre_id uuid NOT NULL,
  appointment_id uuid UNIQUE,
  date timestamp with time zone DEFAULT now(),
  status USER-DEFINED DEFAULT 'PENDING'::consultation_status,
  reason_for_visit text,
  clinical_exam_notes text,
  diagnosis text,
  follow_up_date date,
  CONSTRAINT consultations_pkey PRIMARY KEY (id),
  CONSTRAINT consultations_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT consultations_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.profiles(id),
  CONSTRAINT consultations_centre_id_fkey FOREIGN KEY (centre_id) REFERENCES public.centres(id),
  CONSTRAINT consultations_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id)
);
CREATE TABLE public.emergencies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  doctor_in_charge_id uuid,
  centre_id uuid NOT NULL,
  admission_time timestamp with time zone DEFAULT now(),
  discharge_time timestamp with time zone,
  reason text NOT NULL,
  triage_level USER-DEFINED,
  first_aid_notes text,
  medical_notes text,
  orientation USER-DEFINED,
  CONSTRAINT emergencies_pkey PRIMARY KEY (id),
  CONSTRAINT emergencies_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT emergencies_doctor_in_charge_id_fkey FOREIGN KEY (doctor_in_charge_id) REFERENCES public.profiles(id),
  CONSTRAINT emergencies_centre_id_fkey FOREIGN KEY (centre_id) REFERENCES public.centres(id)
);
CREATE TABLE public.hospitalisation_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  hospitalisation_id uuid NOT NULL,
  author_id uuid NOT NULL,
  timestamp timestamp with time zone DEFAULT now(),
  log_type USER-DEFINED NOT NULL,
  notes text NOT NULL,
  CONSTRAINT hospitalisation_logs_pkey PRIMARY KEY (id),
  CONSTRAINT hospitalisation_logs_hospitalisation_id_fkey FOREIGN KEY (hospitalisation_id) REFERENCES public.hospitalisations(id),
  CONSTRAINT hospitalisation_logs_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.hospitalisations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  referring_doctor_id uuid,
  centre_id uuid NOT NULL,
  service text,
  room text,
  bed text,
  admission_date timestamp with time zone DEFAULT now(),
  discharge_date timestamp with time zone,
  admission_reason text NOT NULL,
  discharge_summary text,
  CONSTRAINT hospitalisations_pkey PRIMARY KEY (id),
  CONSTRAINT hospitalisations_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT hospitalisations_referring_doctor_id_fkey FOREIGN KEY (referring_doctor_id) REFERENCES public.profiles(id),
  CONSTRAINT hospitalisations_centre_id_fkey FOREIGN KEY (centre_id) REFERENCES public.centres(id)
);
CREATE TABLE public.medical_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  condition_name text NOT NULL,
  diagnosis_date date,
  is_active boolean DEFAULT true,
  notes text,
  CONSTRAINT medical_history_pkey PRIMARY KEY (id),
  CONSTRAINT medical_history_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.patients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  medical_record_number text UNIQUE,
  first_name text NOT NULL,
  postname text,
  surname text,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender USER-DEFINED,
  phone text,
  email text,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  is_subscriber boolean DEFAULT false,
  blood_group USER-DEFINED,
  default_centre_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT patients_pkey PRIMARY KEY (id),
  CONSTRAINT patients_default_centre_id_fkey FOREIGN KEY (default_centre_id) REFERENCES public.centres(id)
);
CREATE TABLE public.prescriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL,
  medication_name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  duration text NOT NULL,
  notes text,
  CONSTRAINT prescriptions_pkey PRIMARY KEY (id),
  CONSTRAINT prescriptions_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id)
);
CREATE TABLE public.profile_centres (
  profile_id uuid NOT NULL,
  centre_id uuid NOT NULL,
  CONSTRAINT profile_centres_pkey PRIMARY KEY (profile_id, centre_id),
  CONSTRAINT profile_centres_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT profile_centres_centre_id_fkey FOREIGN KEY (centre_id) REFERENCES public.centres(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  role USER-DEFINED NOT NULL,
  specialty text,
  phone_work text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.vaccination_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  vaccine_name text NOT NULL,
  date_administered date NOT NULL,
  CONSTRAINT vaccination_records_pkey PRIMARY KEY (id),
  CONSTRAINT vaccination_records_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.vital_sign_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  recorded_by_id uuid NOT NULL,
  timestamp timestamp with time zone DEFAULT now(),
  heart_rate integer,
  bp_systolic integer,
  bp_diastolic integer,
  temperature_celsius numeric,
  oxygen_saturation integer,
  respiratory_rate integer,
  consultation_id uuid,
  hospitalisation_id uuid,
  emergency_id uuid,
  CONSTRAINT vital_sign_logs_pkey PRIMARY KEY (id),
  CONSTRAINT vital_sign_logs_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT vital_sign_logs_recorded_by_id_fkey FOREIGN KEY (recorded_by_id) REFERENCES public.profiles(id),
  CONSTRAINT vital_sign_logs_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id),
  CONSTRAINT vital_sign_logs_hospitalisation_id_fkey FOREIGN KEY (hospitalisation_id) REFERENCES public.hospitalisations(id),
  CONSTRAINT vital_sign_logs_emergency_id_fkey FOREIGN KEY (emergency_id) REFERENCES public.emergencies(id)
);





-- -----------------------------------------------------------------
-- 1. FONCTION HELPER (INCHANGÉE)
-- -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid()
$$;


-- -----------------------------------------------------------------
-- 2. POLITIQUES POUR LES TABLES ADMIN (Centres, Profils)
-- -----------------------------------------------------------------

-- === Table: centres ===
ALTER TABLE public.centres ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Personnel (tous) peut lire les centres" ON public.centres;
CREATE POLICY "Personnel (tous) peut lire les centres"
  ON public.centres FOR SELECT
  USING ( auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Admins peuvent créer des centres" ON public.centres;
CREATE POLICY "Admins peuvent créer des centres"
  ON public.centres FOR INSERT
  WITH CHECK ( get_my_role() IN ('ADMIN_SYS', 'GENERAL_DOCTOR') );

-- CORRECTION: Séparation de UPDATE et DELETE
DROP POLICY IF EXISTS "Admins peuvent modifier/supprimer les centres" ON public.centres; -- Nettoyage de l'ancienne règle
DROP POLICY IF EXISTS "Admins peuvent modifier les centres" ON public.centres;
CREATE POLICY "Admins peuvent modifier les centres"
  ON public.centres FOR UPDATE
  USING ( get_my_role() IN ('ADMIN_SYS', 'GENERAL_DOCTOR') );

DROP POLICY IF EXISTS "Admins peuvent supprimer les centres" ON public.centres;
CREATE POLICY "Admins peuvent supprimer les centres"
  ON public.centres FOR DELETE
  USING ( get_my_role() IN ('ADMIN_SYS', 'GENERAL_DOCTOR') );


-- === Table: profiles ===
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Utilisateurs peuvent voir leur propre profil, Admins voient tout" ON public.profiles;
CREATE POLICY "Utilisateurs peuvent voir leur propre profil, Admins voient tout"
  ON public.profiles FOR SELECT
  USING ( (id = auth.uid()) OR (get_my_role() IN ('ADMIN_SYS', 'GENERAL_DOCTOR')) );

DROP POLICY IF EXISTS "Admins peuvent créer des profils" ON public.profiles;
CREATE POLICY "Admins peuvent créer des profils"
  ON public.profiles FOR INSERT
  WITH CHECK ( get_my_role() IN ('ADMIN_SYS', 'GENERAL_DOCTOR') );

DROP POLICY IF EXISTS "Utilisateurs peuvent modifier leur profil, Admins modifient tout" ON public.profiles;
CREATE POLICY "Utilisateurs peuvent modifier leur profil, Admins modifient tout"
  ON public.profiles FOR UPDATE
  USING ( (id = auth.uid()) OR (get_my_role() IN ('ADMIN_SYS', 'GENERAL_DOCTOR')) )
  WITH CHECK ( (id = auth.uid()) OR (get_my_role() IN ('ADMIN_SYS', 'GENERAL_DOCTOR')) );

DROP POLICY IF EXISTS "Admins peuvent supprimer des profils" ON public.profiles;
CREATE POLICY "Admins peuvent supprimer des profils"
  ON public.profiles FOR DELETE
  USING ( get_my_role() IN ('ADMIN_SYS', 'GENERAL_DOCTOR') );


-- === Table: profile_centres (liaison) ===
ALTER TABLE public.profile_centres ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Personnel (tous) peut lire les liaisons profil-centre" ON public.profile_centres;
CREATE POLICY "Personnel (tous) peut lire les liaisons profil-centre"
  ON public.profile_centres FOR SELECT
  USING ( auth.role() = 'authenticated' );

-- CORRECTION: Séparation de INSERT et DELETE
DROP POLICY IF EXISTS "Admins peuvent créer/supprimer les liaisons profil-centre" ON public.profile_centres; -- Nettoyage
DROP POLICY IF EXISTS "Admins peuvent créer les liaisons profil-centre" ON public.profile_centres;
CREATE POLICY "Admins peuvent créer les liaisons profil-centre"
  ON public.profile_centres FOR INSERT
  WITH CHECK ( get_my_role() IN ('ADMIN_SYS', 'GENERAL_DOCTOR') );

DROP POLICY IF EXISTS "Admins peuvent supprimer les liaisons profil-centre" ON public.profile_centres;
CREATE POLICY "Admins peuvent supprimer les liaisons profil-centre"
  ON public.profile_centres FOR DELETE
  USING ( get_my_role() IN ('ADMIN_SYS', 'GENERAL_DOCTOR') );


-- -----------------------------------------------------------------
-- 3. POLITIQUES POUR LES TABLES ADMINISTRATIVES (Patient, RDV)
-- -----------------------------------------------------------------
-- AMÉLIORATION: Utilisation de "FOR ALL" car les règles C/R/U/D sont identiques

-- === Table: patients ===
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Secrétaires et Médical peuvent lire les patients" ON public.patients;
DROP POLICY IF EXISTS "Secrétaires et Médical peuvent gérer (CUD) les patients" ON public.patients;
DROP POLICY IF EXISTS "Secrétaires et Médical ont accès complet aux patients" ON public.patients;
CREATE POLICY "Secrétaires et Médical ont accès complet aux patients"
  ON public.patients FOR ALL -- ALL = SELECT, INSERT, UPDATE, DELETE
  USING ( get_my_role() IN ('SECRETARY', 'DOCTOR', 'NURSE', 'GENERAL_DOCTOR') )
  WITH CHECK ( get_my_role() IN ('SECRETARY', 'DOCTOR', 'NURSE', 'GENERAL_DOCTOR') );

-- === Table: appointments (Rendez-vous) ===
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Secrétaires et Médical peuvent lire les RDV" ON public.appointments;
DROP POLICY IF EXISTS "Secrétaires et Médical peuvent gérer (CUD) les RDV" ON public.appointments;
DROP POLICY IF EXISTS "Secrétaires et Médical ont accès complet aux RDV" ON public.appointments;
CREATE POLICY "Secrétaires et Médical ont accès complet aux RDV"
  ON public.appointments FOR ALL
  USING ( get_my_role() IN ('SECRETARY', 'DOCTOR', 'NURSE', 'GENERAL_DOCTOR') )
  WITH CHECK ( get_my_role() IN ('SECRETARY', 'DOCTOR', 'NURSE', 'GENERAL_DOCTOR') );


-- -----------------------------------------------------------------
-- 4. POLITIQUES POUR LES TABLES MÉDICALES STRICTES
-- -----------------------------------------------------------------
-- AMÉLIORATION: Utilisation de "FOR ALL" pour toutes ces tables

-- === Table: allergies ===
ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Médical (uniquement) peut lire les allergies" ON public.allergies;
DROP POLICY IF EXISTS "Médical (uniquement) peut gérer (CUD) les allergies" ON public.allergies;
DROP POLICY IF EXISTS "Médical (uniquement) a accès complet aux allergies" ON public.allergies;
CREATE POLICY "Médical (uniquement) a accès complet aux allergies"
  ON public.allergies FOR ALL
  USING ( get_my_role() IN ('DOCTOR', 'NURSE', 'GENERAL_DOCTOR') )
  WITH CHECK ( get_my_role() IN ('DOCTOR', 'NURSE', 'GENERAL_DOCTOR') );

-- === Table: medical_history ===
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Médical (uniquement) peut lire l'historique" ON public.medical_history;
DROP POLICY IF EXISTS "Médical (uniquement) peut gérer (CUD) l'historique" ON public.medical_history;
DROP POLICY IF EXISTS "Médical (uniquement) a accès complet à l'historique" ON public.medical_history;
CREATE POLICY "Médical (uniquement) a accès complet à l'historique"
  ON public.medical_history FOR ALL
  USING ( get_my_role() IN ('DOCTOR', 'NURSE', 'GENERAL_DOCTOR') )
  WITH CHECK ( get_my_role() IN ('DOCTOR', 'NURSE', 'GENERAL_DOCTOR') );

-- === Table: vaccination_records ===
ALTER TABLE public.vaccination_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Médical (uniquement) peut lire les vaccins" ON public.vaccination_records;
DROP POLICY IF EXISTS "Médical (uniquement) peut gérer (CUD) les vaccins" ON public.vaccination_records;
DROP POLICY IF EXISTS "Médical (uniquement) a accès complet aux vaccins" ON public.vaccination_records;
CREATE POLICY "Médical (uniquement) a accès complet aux vaccins"
  ON public.vaccination_records FOR ALL
  USING ( get_my_role() IN ('DOCTOR', 'NURSE', 'GENERAL_DOCTOR') )
  WITH CHECK ( get_my_role() IN ('DOCTOR', 'NURSE', 'GENERAL_DOCTOR') );

-- === Table: consultations ===
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Médical (uniquement) peut lire les consultations" ON public.consultations;
DROP POLICY IF EXISTS "Médical (uniquement) peut gérer (CUD) les consultations" ON public.consultations;
DROP POLICY IF EXISTS "Médical (uniquement) a accès complet aux consultations" ON public.consultations;
CREATE POLICY "Médical (uniquement) a accès complet aux consultations"
  ON public.consultations FOR ALL
  USING ( get_my_role() IN ('DOCTOR', 'NURSE', 'GENERAL_DOCTOR') )
  WITH CHECK ( get_my_role() IN ('DOCTOR', 'NURSE', 'GENERAL_DOCTOR') );

-- === Table: prescriptions ===
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Médical (uniquement) peut lire les prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Médical (uniquement) peut gérer (CUD) les prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Médical (uniquement) a accès complet aux prescriptions" ON public.prescriptions;
CREATE POLICY "Médical (uniquement) a accès complet aux prescriptions"
  ON public.prescriptions FOR ALL
  USING ( get_my_role() IN ('DOCTOR', 'NURSE', 'GENERAL_DOCTOR') )
  WITH CHECK ( get_my_role() IN ('DOCTOR', 'NURSE', 'GENERAL_DOCTOR') );

-- === Table: hospitalisations ===
ALTER TABLE public.hospitalisations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Médical (uniquement) peut lire les hospitalisations" ON public.hospitalisations;
DROP POLICY IF EXISTS "Médical (uniquement) peut gérer (CUD) les hospitalisations" ON public.hospitalisations;
DROP POLICY IF EXISTS "Médical (uniquement) a accès complet aux hospitalisations" ON public.hospitalisations;
CREATE POLICY "Médical (uniquement) a accès complet aux hospitalisations"
  ON public.hospitalisations FOR ALL
  USING ( get_my_role() IN ('DOCTOR', 'NURSE', 'GENERAL_DOCTOR') )
  WITH CHECK ( get_my_role() IN ('DOCTOR', 'NURSE', 'GENERAL_DOCTOR') );

-- === Table: hospitalisation_logs ===
ALTER TABLE public.hospitalisation_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Médical (uniquement) peut lire les logs d'hospitalisation" ON public.hospitalisation_logs;
DROP POLICY IF EXISTS "Médical (uniquement) peut gérer (CUD) les logs d'hospitalisation" ON public.hospitalisation_logs;
DROP POLICY IF EXISTS "Médical (uniquement) a accès complet aux logs d'hospitalisation" ON public.hospitalisation_logs;
CREATE POLICY "Médical (uniquement) a accès complet aux logs d'hospitalisation"
  ON public.hospitalisation_logs FOR ALL
  USING ( get_my_role() IN ('DOCTOR', 'NURSE', 'GENERAL_DOCTOR') )
  WITH CHECK ( get_my_role() IN ('DOCTOR', 'NURSE', 'GENERAL_DOCTOR') );

-- === Table: emergencies ===
ALTER TABLE public.emergencies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Médical (uniquement) peut lire les urgences" ON public.emergencies;
DROP POLICY IF EXISTS "Médical (uniquement) peut gérer (CUD) les urgences" ON public.emergencies;
DROP POLICY IF EXISTS "Médical (uniquement) a accès complet aux urgences" ON public.emergencies;
CREATE POLICY "Médical (uniquement) a accès complet aux urgences"
  ON public.emergencies FOR ALL
  USING ( get_my_role() IN ('DOCTOR', 'NURSE', 'GENERAL_DOCTOR') )
  WITH CHECK ( get_my_role() IN ('DOCTOR', 'NURSE', 'GENERAL_DOCTOR') );

-- === Table: vital_sign_logs ===
ALTER TABLE public.vital_sign_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Médical (uniquement) peut lire les signes vitaux" ON public.vital_sign_logs;
DROP POLICY IF EXISTS "Médical (uniquement) peut gérer (CUD) les signes vitaux" ON public.vital_sign_logs;
DROP POLICY IF EXISTS "Médical (uniquement) a accès complet aux signes vitaux" ON public.vital_sign_logs;
CREATE POLICY "Médical (uniquement) a accès complet aux signes vitaux"
  ON public.vital_sign_logs FOR ALL
  USING ( get_my_role() IN ('DOCTOR', 'NURSE', 'GENERAL_DOCTOR') )
  WITH CHECK ( get_my_role() IN ('DOCTOR', 'NURSE', 'GENERAL_DOCTOR') );