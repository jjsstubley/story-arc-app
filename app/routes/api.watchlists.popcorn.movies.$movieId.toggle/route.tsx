// app/routes/api/temp-watchlist.tsx
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { addToPopcornWatchlist, removeFromPopcornWatchlist } from "~/utils/services/cookies/popcorn-watchlist";


export async function action({ request, params }: ActionFunctionArgs) {
  console.log('api/watchlist/popcorn/movies/$movieId/toggle')
  const { movieId } = params;
  const method = request.method.toUpperCase();


  if (!movieId) {
    return json({ error: "Missing or invalid movieId" }, { status: 400 });
  }
  
  
  const movieIdInt = parseInt(movieId || "");
  let result;

  console.log('this is triggering', movieIdInt)
  
  if (method === "POST") {
    result = await addToPopcornWatchlist(request, movieIdInt);
  } else if (method === "DELETE") {
    result = await removeFromPopcornWatchlist(request, movieIdInt);
  } else {
    return json({ error: "Invalid action" }, { status: 400 });
  }


  return json({ }, {headers: result.headers});
}