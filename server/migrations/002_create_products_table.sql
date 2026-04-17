CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  business_id uuid NOT NULL,
  name character varying NOT NULL,
  sku character varying,
  category character varying,
  price numeric(10, 2) NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0,
  reorder_level integer NOT NULL DEFAULT 10,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT fk_business_product FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create index for faster queries
CREATE INDEX idx_products_business_id ON public.products (business_id);
CREATE INDEX idx_products_stock_status ON public.products (stock_quantity, reorder_level);
CREATE INDEX idx_products_name ON public.products (name);
