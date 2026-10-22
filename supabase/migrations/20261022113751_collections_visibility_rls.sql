-- Collections were readable whenever is_system_generated was true, but AI
-- suggestion lists are system-generated *and* owned by a user, so every
-- user's AI lists were public (and shown on everyone's home page). Their
-- items were also readable by anyone through a USING (true) policy, and
-- users could insert or update rows as system-generated, i.e. publish a
-- "curated" collection.
--
-- Visibility now comes from is_public: public collections (the curated
-- ones, which have no owner) are readable by everyone, everything else only
-- by its owner. Users can't make a collection public; curated collections
-- are created with the service role. Existing data already matches this:
-- curated rows are is_public = true, AI rows are is_public = false.

-- collections ---------------------------------------------------------------

DROP POLICY IF EXISTS "Allow public read of system generated" ON public.collections;
DROP POLICY IF EXISTS "Users can read system-generated collections" ON public.collections;
DROP POLICY IF EXISTS "Users can read their own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can view their own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can create their own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can insert their own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can update their own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can delete their own collections" ON public.collections;

CREATE POLICY "Anyone can read public collections" ON public.collections
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can read their own collections" ON public.collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own private collections" ON public.collections
  FOR INSERT WITH CHECK (auth.uid() = user_id AND is_public = false);

CREATE POLICY "Users can update their own private collections" ON public.collections
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND is_public = false);

CREATE POLICY "Users can delete their own collections" ON public.collections
  FOR DELETE USING (auth.uid() = user_id);

-- collection_items ------------------------------------------------------------

DROP POLICY IF EXISTS "Allow public read of items" ON public.collection_items;
DROP POLICY IF EXISTS "Users can read items from system-generated collections" ON public.collection_items;
DROP POLICY IF EXISTS "Users can read items from their own collections" ON public.collection_items;
DROP POLICY IF EXISTS "Users can view items from their own collections" ON public.collection_items;
DROP POLICY IF EXISTS "Users can insert items into their own collections" ON public.collection_items;
DROP POLICY IF EXISTS "Users can update items in their own collections" ON public.collection_items;
DROP POLICY IF EXISTS "Users can delete items from their own collections" ON public.collection_items;

CREATE POLICY "Items are readable when their collection is" ON public.collection_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.collections c
    WHERE c.id = collection_items.list_id
      AND (c.is_public = true OR c.user_id = auth.uid())
  ));

CREATE POLICY "Users can add items to their own collections" ON public.collection_items
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.collections c
    WHERE c.id = collection_items.list_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Users can update items in their own collections" ON public.collection_items
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.collections c
    WHERE c.id = collection_items.list_id AND c.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.collections c
    WHERE c.id = collection_items.list_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Users can remove items from their own collections" ON public.collection_items
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.collections c
    WHERE c.id = collection_items.list_id AND c.user_id = auth.uid()
  ));
