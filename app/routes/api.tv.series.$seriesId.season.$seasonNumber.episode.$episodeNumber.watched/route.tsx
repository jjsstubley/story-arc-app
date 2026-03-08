import {
  ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  getWatchedEpisode,
  addWatchedEpisode,
  removeWatchedEpisode,
} from "~/utils/services/supabase/user-watched-tv-episodes.server";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);
  const { seriesId, seasonNumber, episodeNumber } = params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!seriesId || !seasonNumber || !episodeNumber) {
    return json(
      { error: "Series ID, season number and episode number are required" },
      { status: 400 }
    );
  }

  const sid = parseInt(seriesId, 10);
  const sn = parseInt(seasonNumber, 10);
  const en = parseInt(episodeNumber, 10);
  if (Number.isNaN(sid) || Number.isNaN(sn) || Number.isNaN(en)) {
    return json({ error: "Invalid parameters" }, { status: 400 });
  }

  const row = await getWatchedEpisode(user.id, sid, sn, en, supabase);
  return json(
    {
      watched: Boolean(row),
      watched_at: row?.watched_at ?? undefined,
    },
    { headers }
  );
}

export async function action({ request, params }: ActionFunctionArgs) {
  const headers = new Headers();
  const supabase = getSupabaseServerClient(request, headers);
  const { seriesId, seasonNumber, episodeNumber } = params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!seriesId || !seasonNumber || !episodeNumber) {
    return json(
      { error: "Series ID, season number and episode number are required" },
      { status: 400 }
    );
  }

  let body: { watched?: boolean };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, { status: 400 });
  }

  const watched = body.watched;
  if (typeof watched !== "boolean") {
    return json({ error: "watched must be a boolean" }, { status: 400 });
  }

  const sid = parseInt(seriesId, 10);
  const sn = parseInt(seasonNumber, 10);
  const en = parseInt(episodeNumber, 10);
  if (Number.isNaN(sid) || Number.isNaN(sn) || Number.isNaN(en)) {
    return json({ error: "Invalid parameters" }, { status: 400 });
  }

  if (watched) {
    await addWatchedEpisode(user.id, sid, sn, en, supabase);
  } else {
    await removeWatchedEpisode(user.id, sid, sn, en, supabase);
  }

  const row = await getWatchedEpisode(user.id, sid, sn, en, supabase);
  return json(
    {
      watched: Boolean(row),
      watched_at: row?.watched_at ?? undefined,
    },
    { headers }
  );
}
