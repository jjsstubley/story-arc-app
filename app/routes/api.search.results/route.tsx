import { json, LoaderFunction } from "@remix-run/node";
import { handleSearchRequest } from "~/utils/loaders/search-request";

export const loader: LoaderFunction = async ({ request }) => {
  const headers = new Headers();

  const {
    results,
    decodedFilters,
    searchParams,
  } = await handleSearchRequest(request);

  return json({ results, decodedFilters, searchParams }, { headers });
};