CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.users (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name text NOT NULL,
    last_name text,
    email text UNIQUE NOT NULL,
    phone text UNIQUE,
    password text NOT NULL,
    city text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_updated_at ON public.users;
CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.password_reset_otps (
    email text PRIMARY KEY REFERENCES public.users(email) ON DELETE CASCADE,
    otp_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS update_password_reset_otps_updated_at ON public.password_reset_otps;
CREATE TRIGGER update_password_reset_otps_updated_at
    BEFORE UPDATE ON public.password_reset_otps
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
