import { ActionFunction, json } from "@remix-run/node"
import { getSuggestions } from "~/utils/services/ai/"
import {SuggestionsDataInterface} from '~/interfaces/suggestions'

export const action: ActionFunction = async ({ request }) => {
  console.log('search/results ActionFunction')
  const formData = await request.formData();
  const query = formData.get("query");

  if (!query || typeof query !== "string") {
    return json({ error: "Invalid query" }, { status: 400 });
  }

  console.log('after query')

  const response = (await getSuggestions(query));

  const data = await response.json() as SuggestionsDataInterface

  console.log('data', data)

  return data
};