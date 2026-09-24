-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

GRANT DELETE, INSERT, SELECT, UPDATE ON public.collection_items TO anon;

GRANT DELETE, INSERT, SELECT, UPDATE ON public.collections TO anon;