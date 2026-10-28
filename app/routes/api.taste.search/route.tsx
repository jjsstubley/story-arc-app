import { searchTasteOptions } from "~/features/taste/index.server";
import { apiRoute } from "~/shared/api/route.server";
import { ValidationError } from "~/shared/errors";

const route = apiRoute({
  // ?type=person|keyword&query=...
  GET: ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    if (type !== "person" && type !== "keyword") {
      throw new ValidationError("type must be \"person\" or \"keyword\"", "INVALID_SEARCH_TYPE");
    }
    return searchTasteOptions(type, url.searchParams.get("query") ?? "");
  },
});

export const loader = route;
