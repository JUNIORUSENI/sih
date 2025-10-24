# Guide de Migration SQL - Système de Gestion Hospitalière

Ce guide vous accompagne étape par étape pour mettre à jour votre base de données Supabase.

## ⚠️ Important

**Avant de commencer**, assurez-vous d'avoir :
1. Accès à votre console Supabase
2. Les droits d'administration sur la base de données
3. Une sauvegarde récente de votre base de données

## 📋 Étape 1 : Vérifier l'état actuel

Exécutez cette requête pour vérifier si les colonnes existent déjà :

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('name', 'postname', 'surname')
ORDER BY column_name;
```

**Résultat attendu :**
- Si aucune ligne n'est retournée : Passez à l'étape 2
- Si les 3 colonnes apparaissent : La migration a déjà été effectuée

## 📋 Étape 2 : Ajouter les colonnes

Copiez et exécutez le script suivant dans l'éditeur SQL de Supabase :

```sql
-- Ajouter la colonne 'name' (nom de famille)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS name text;

-- Ajouter la colonne 'postname' (postnom)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS postname text;

-- Ajouter la colonne 'surname' (prénom)  
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS surname text;
```

**Vérification :** Exécutez à nouveau la requête de l'étape 1. Vous devriez voir les 3 colonnes.

## 📋 Étape 3 : Mettre à jour les données existantes

Si vous avez déjà des utilisateurs dans la base de données, vous devez leur attribuer un nom :

### Option A : Nom par défaut

```sql
-- Attribuer un nom par défaut aux profils existants
UPDATE public.profiles 
SET name = 'À définir' 
WHERE name IS NULL;
```

### Option B : Extraction depuis l'email

```sql
-- Extraire le nom depuis l'email (avant le @)
UPDATE public.profiles 
SET name = SPLIT_PART(
  (SELECT email FROM auth.users WHERE id = profiles.id), 
  '@', 
  1
)
WHERE name IS NULL;
```

**Vérification :** 

```sql
SELECT id, name, postname, surname
FROM public.profiles
LIMIT 10;
```

Tous les utilisateurs devraient maintenant avoir un nom.

## 📋 Étape 4 : Rendre la colonne 'name' obligatoire

Une fois que tous les profils ont un nom, rendez la colonne obligatoire :

```sql
-- Rendre la colonne 'name' obligatoire
ALTER TABLE public.profiles 
ALTER COLUMN name SET NOT NULL;
```

## 📋 Étape 5 : Créer les index pour la performance

```sql
-- Index sur la colonne name pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_profiles_name 
ON public.profiles(name);

-- Index composite pour les recherches par nom complet
CREATE INDEX IF NOT EXISTS idx_profiles_full_name 
ON public.profiles(surname, postname, name);
```

## 📋 Étape 6 : Ajouter les commentaires de documentation

```sql
-- Documentation des colonnes
COMMENT ON COLUMN public.profiles.name IS 'Nom de famille de l''utilisateur (requis)';
COMMENT ON COLUMN public.profiles.postname IS 'Postnom de l''utilisateur (optionnel)';
COMMENT ON COLUMN public.profiles.surname IS 'Prénom de l''utilisateur (optionnel)';
```

## 📋 Étape 7 : Vérification finale

Exécutez ces requêtes pour vérifier que tout est correct :

### Vérifier la structure

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;
```

### Vérifier les index

```sql
SELECT 
  indexname, 
  indexdef
FROM pg_indexes
WHERE tablename = 'profiles'
  AND schemaname = 'public'
ORDER BY indexname;
```

### Vérifier les données

```sql
SELECT 
  COUNT(*) as total_profiles,
  COUNT(name) as profiles_with_name,
  COUNT(postname) as profiles_with_postname,
  COUNT(surname) as profiles_with_surname
FROM public.profiles;
```

## ✅ Migration terminée !

Vous pouvez maintenant :
1. Redémarrer votre application Next.js : `npm run dev`
2. Créer de nouveaux membres du personnel avec nom, postnom et prénom
3. Les noms s'afficheront correctement dans toute l'application

## 🔧 Rollback (en cas de problème)

Si vous devez annuler la migration :

```sql
-- Supprimer les colonnes ajoutées
ALTER TABLE public.profiles DROP COLUMN IF EXISTS surname;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS postname;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS name;

-- Supprimer les index
DROP INDEX IF EXISTS idx_profiles_name;
DROP INDEX IF EXISTS idx_profiles_full_name;
```

## 📞 Support

En cas de problème :
- Vérifiez les logs de Supabase dans la console
- Assurez-vous que votre rôle a les permissions nécessaires
- Consultez la documentation Supabase : https://supabase.com/docs

---

**Script complet disponible dans :** [`add_name_columns_to_profiles.sql`](add_name_columns_to_profiles.sql)