import { json, LoaderFunctionArgs, LoaderFunction, type MetaFunction } from "@remix-run/node";

import { getSupabaseServerClient } from "~/utils/supabase.server";
import { useLoaderData } from "@remix-run/react";
import PersonDetails from "./dashboards/personDetails";

import { parseCreditSlug } from "~/utils/helpers";
import { getPeopleDetailsById, getPeopleImagesById, getPeopleCombinedCreditsById } from "~/utils/services/external/tmdb/people";

export const loader: LoaderFunction = async ({ request, params } : LoaderFunctionArgs) => {
  const headers = new Headers();
  const { person } = params; 
  const supabase = getSupabaseServerClient(request, headers);
  const { data: { session } } = await supabase.auth.getSession()

  
  if (person) {
    const personObj = parseCreditSlug(person)
    if(personObj) {
      const [ personDetails, images, allCredits ] = await Promise.all([
        await getPeopleDetailsById({person_id: personObj.id}),
        await getPeopleImagesById({person_id: personObj.id}),
        await getPeopleCombinedCreditsById({person_id: personObj.id})
      ]);

      console.log('personDetails', personDetails)

      return json({ session, personDetails, images, allCredits }, { headers });
    }
    // movieDetails = await getMovieDetailsById({movie_id: parseInt(movieId)}
    return json({ session }, { headers });
  }

  return json({ session }, { headers });
};

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    { title: "Story Arc | Credit | {Movie ID}" },
    { name: "description", content: "Query-based film search engine" },
    {
      rel: "preload",
      as: "image",
      href: `https://image.tmdb.org/t/p/original/${data.personDetails.profile_path}`,
    },
  ];
};

export default function Index() {
  const { personDetails, images, allCredits } = useLoaderData<typeof loader>();
  
  return (
    <PersonDetails personDetails={personDetails} images={images} allCredits={allCredits}/>
  );
}