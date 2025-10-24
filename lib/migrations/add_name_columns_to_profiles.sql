-- Migration: Ajouter les colonnes name, postname et surname à la table profiles
-- Date: 2025-01-24
-- Description: Ajoute les colonnes pour stocker le nom complet des utilisateurs

-- Ajouter la colonne 'name' (obligatoire)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS name text;

-- Ajouter la colonne 'postname' (optionnelle)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS postname text;

-- Ajouter la colonne 'surname' (optionnelle)  
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS surname text;

-- Rendre la colonne 'name' obligatoire après avoir ajouté la colonne
-- Note: Si vous avez déjà des données, vous devez d'abord les mettre à jour
-- avec des valeurs par défaut avant d'exécuter cette commande
-- UPDATE public.profiles SET name = 'À définir' WHERE name IS NULL;

-- Décommenter la ligne suivante une fois que toutes les données existantes ont un nom
-- ALTER TABLE public.profiles ALTER COLUMN name SET NOT NULL;

-- Créer un index sur la colonne name pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_profiles_name ON public.profiles(name);

-- Créer un index composite pour les recherches par nom complet
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(surname, postname, name);

-- Commentaire sur les colonnes pour la documentation
COMMENT ON COLUMN public.profiles.name IS 'Nom de famille de l''utilisateur (requis)';
COMMENT ON COLUMN public.profiles.postname IS 'Postnom de l''utilisateur (optionnel)';
COMMENT ON COLUMN public.profiles.surname IS 'Prénom de l''utilisateur (optionnel)';