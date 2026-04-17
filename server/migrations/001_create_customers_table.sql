-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  name character varying NOT NULL,
  phone_number character varying,
  total_outstanding numeric(10, 2) DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customers_pkey PRIMARY KEY (id),
  CONSTRAINT fk_business_customer FOREIGN KEY (business_id) REFERENCES public.businesses (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create index on business_id for faster queries
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON public.customers(business_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
