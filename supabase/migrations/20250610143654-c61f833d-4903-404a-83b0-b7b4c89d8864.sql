-- Adicionar campo para controlar se o onboarding foi completado
ALTER TABLE public.restaurant_profiles
ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Criar tabela para acompanhar o progresso do onboarding
CREATE TABLE public.onboarding_progress (
    id UUID NOT NULL DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    step_name TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP
    WITH
        TIME ZONE,
        created_at TIMESTAMP
    WITH
        TIME ZONE NOT NULL DEFAULT now (),
        UNIQUE (user_id, step_name)
);

-- Habilitar RLS
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para onboarding_progress
CREATE POLICY "Users can view their own onboarding progress" ON public.onboarding_progress FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can create their own onboarding progress" ON public.onboarding_progress FOR INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update their own onboarding progress" ON public.onboarding_progress FOR
UPDATE USING (auth.uid () = user_id);

-- Adicionar campos adicionais na tabela restaurant_profiles para o onboarding
ALTER TABLE public.restaurant_profiles
ADD COLUMN responsible_name TEXT,
ADD COLUMN cnpj TEXT,
ADD COLUMN email TEXT,
ADD COLUMN delivery_type TEXT DEFAULT 'delivery',
ADD COLUMN whatsapp_number TEXT,
ADD COLUMN delivery_radius TEXT DEFAULT '10km';