-- ============ PROMOTED VIDEO LIFECYCLE ============
-- Adds video_url to campaigns, links videos to campaigns,
-- adds suspension logic, and a top-up RPC.

-- 1. Extend campaigns with the external video URL
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 2. Link videos to campaigns and add active flag
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- 3. RLS: authenticated users can insert/update their own promoted videos
CREATE POLICY "Users insert own promoted videos" ON public.videos
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND campaign_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.campaigns WHERE id = campaign_id AND user_id = auth.uid())
  );

CREATE POLICY "Users update own promoted videos" ON public.videos
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.campaigns WHERE id = videos.campaign_id AND user_id = auth.uid())
  );

-- 4. Atomically increment campaign views; suspend when target reached
CREATE OR REPLACE FUNCTION public.increment_campaign_views(_campaign_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _new_views BIGINT;
  _target    BIGINT;
BEGIN
  UPDATE public.campaigns
    SET current_views = current_views + 1,
        updated_at    = now()
    WHERE id = _campaign_id
    RETURNING current_views, target_views INTO _new_views, _target;

  IF _new_views >= _target THEN
    UPDATE public.campaigns
      SET status     = 'Suspended',
          updated_at = now()
      WHERE id = _campaign_id;

    UPDATE public.videos
      SET is_active = FALSE
      WHERE campaign_id = _campaign_id;
  END IF;
END;
$$;

-- 5. Update claim_watch_reward to also drive campaign view counts
CREATE OR REPLACE FUNCTION public.claim_watch_reward(
  _content_type TEXT,
  _content_id   UUID,
  _reward       INT,
  _label        TEXT
) RETURNS BIGINT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _user        UUID := auth.uid();
  _new_balance BIGINT;
  _campaign_id UUID;
BEGIN
  IF _user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.watch_history
    WHERE user_id = _user AND content_type = _content_type AND content_id = _content_id
  ) THEN
    RETURN -1;
  END IF;

  INSERT INTO public.watch_history(user_id, content_type, content_id, reward_megazi)
    VALUES (_user, _content_type, _content_id, _reward);

  UPDATE public.wallets
    SET balance_megazi = balance_megazi + _reward
    WHERE user_id = _user
    RETURNING balance_megazi INTO _new_balance;

  INSERT INTO public.transactions(user_id, type, label, amount_megazi)
    VALUES (_user, 'Earning', _label, _reward);

  IF _content_type = 'video' THEN
    UPDATE public.videos SET views = views + 1
      WHERE id = _content_id
      RETURNING campaign_id INTO _campaign_id;

    IF _campaign_id IS NOT NULL THEN
      PERFORM public.increment_campaign_views(_campaign_id);
    END IF;
  END IF;

  RETURN _new_balance;
END;
$$;

-- 6. Top-up: add more views to a campaign (artist pays more)
CREATE OR REPLACE FUNCTION public.topup_campaign(_campaign_id UUID, _extra_views BIGINT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.campaigns WHERE id = _campaign_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.campaigns
    SET target_views = target_views + _extra_views,
        budget_frw   = budget_frw + (_extra_views * 5),
        status       = 'Active',
        updated_at   = now()
    WHERE id = _campaign_id;

  UPDATE public.videos
    SET is_active = TRUE
    WHERE campaign_id = _campaign_id;
END;
$$;
