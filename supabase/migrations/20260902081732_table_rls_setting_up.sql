-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

CREATE TABLE public.collection_items (
  id            uuid                     DEFAULT gen_random_uuid() NOT NULL,
  collection_id uuid                     DEFAULT gen_random_uuid(),
  name          text,
  description   text,
  image_url     text,
  "order"       integer,
  memory_date   date,
  created_at    timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.collection_items
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.collection_items
  ADD CONSTRAINT collection_items_pkey PRIMARY KEY (id);

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.collection_items TO anon;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.collection_items TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.collection_items TO service_role;

CREATE POLICY "for all users" ON public.collection_items
  USING (true);

CREATE TABLE public.collections (
  id          uuid                     DEFAULT gen_random_uuid() NOT NULL,
  name        text,
  description text,
  poster_url  text,
  start_time  date,
  end_time    date,
  created_at  timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.collections
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.collections
  ADD CONSTRAINT collections_pkey PRIMARY KEY (id);

ALTER TABLE public.collection_items
  ADD CONSTRAINT collection_items_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON UPDATE CASCADE ON DELETE CASCADE;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.collections TO anon;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.collections TO authenticated;

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.collections TO service_role;

CREATE POLICY "for all users" ON public.collections
  USING (true);