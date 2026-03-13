-- dogs + dog_env RLS write policies
-- Purpose: AUTH-001 onboarding survey save requires authenticated user write access.
-- Added: 2026-02-28

ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dog_env ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'dogs' AND policyname = 'Users insert own dogs'
  ) THEN
    CREATE POLICY "Users insert own dogs"
      ON public.dogs FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'dogs' AND policyname = 'Users update own dogs'
  ) THEN
    CREATE POLICY "Users update own dogs"
      ON public.dogs FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'dogs' AND policyname = 'Users delete own dogs'
  ) THEN
    CREATE POLICY "Users delete own dogs"
      ON public.dogs FOR DELETE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'dog_env' AND policyname = 'Users read own dog env'
  ) THEN
    CREATE POLICY "Users read own dog env"
      ON public.dog_env FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.dogs d
          WHERE d.id = dog_env.dog_id
            AND d.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'dog_env' AND policyname = 'Users insert own dog env'
  ) THEN
    CREATE POLICY "Users insert own dog env"
      ON public.dog_env FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.dogs d
          WHERE d.id = dog_env.dog_id
            AND d.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'dog_env' AND policyname = 'Users update own dog env'
  ) THEN
    CREATE POLICY "Users update own dog env"
      ON public.dog_env FOR UPDATE
      USING (
        EXISTS (
          SELECT 1
          FROM public.dogs d
          WHERE d.id = dog_env.dog_id
            AND d.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.dogs d
          WHERE d.id = dog_env.dog_id
            AND d.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'dog_env' AND policyname = 'Users delete own dog env'
  ) THEN
    CREATE POLICY "Users delete own dog env"
      ON public.dog_env FOR DELETE
      USING (
        EXISTS (
          SELECT 1
          FROM public.dogs d
          WHERE d.id = dog_env.dog_id
            AND d.user_id = auth.uid()
        )
      );
  END IF;
END $$;

