-- Table pour le journal d'audit
CREATE TABLE public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', etc.
  resource_type TEXT, -- 'user', 'centre', 'patient', 'appointment', etc.
  resource_id TEXT, -- ID de la ressource concernée
  old_values JSONB, -- Anciennes valeurs avant modification
  new_values JSONB, -- Nouvelles valeurs après modification
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour que seuls les admins puissent voir les logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('ADMIN_SYS', 'GENERAL_DOCTOR')
    )
  );

-- Créer une fonction helper pour enregistrer les événements d'audit
CREATE OR REPLACE FUNCTION log_audit_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent)
  VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values,
    current_setting('request.header.x-real-ip', true)::INET,
    current_setting('request.header.user-agent', true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exemples de déclencheurs pour enregistrer automatiquement les événements
-- Pour les centres
CREATE OR REPLACE FUNCTION log_centre_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_audit_event('CREATE', 'centre', NEW.id::TEXT, NULL, row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_audit_event('UPDATE', 'centre', NEW.id::TEXT, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_audit_event('DELETE', 'centre', OLD.id::TEXT, row_to_json(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER centre_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.centres
  FOR EACH ROW EXECUTE FUNCTION log_centre_change();

-- Pour les profils
CREATE OR REPLACE FUNCTION log_profile_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_audit_event('CREATE', 'profile', NEW.id::TEXT, NULL, row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_audit_event('UPDATE', 'profile', NEW.id::TEXT, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_audit_event('DELETE', 'profile', OLD.id::TEXT, row_to_json(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION log_profile_change();