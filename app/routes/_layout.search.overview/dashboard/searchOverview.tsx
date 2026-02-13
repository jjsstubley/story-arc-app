import { Box, Heading } from "@chakra-ui/react"
import CreditAvatar from "~/components/credit/credit-avatar";

import { EmblaCarousel } from "~/components/emblaCarousel";
import { KeywordsPaginationInterface } from "~/interfaces/tmdb/keywords";
import { Movielist } from "~/components/search/displays/movie-list";
import { Keywordlist } from "~/components/search/displays/keyword-list";
import TopResult from "~/components/movie/previews/top-result";
import { TmdbCollectionsPaginationInterface } from "~/interfaces/tmdb/tmdb-collections";
import { CompanyPaginationInterface } from "~/interfaces/tmdb/company";
import { Collectionlist } from "~/components/search/displays/collection-list";
import { Companylist } from "~/components/search/displays/company-list";
import { TmdbMoviePaginationInterface, TmdbMovieSummaryInterface } from "~/interfaces/tmdb/movie/summary";
import { TrendingPeopleInterface } from "~/interfaces/tmdb/trending";
import { PersonSummaryForInterface } from "~/interfaces/tmdb/people/summary";


export default function SearchOverview({ movies, keywords, people, collections, companies, query }: {movies: TmdbMoviePaginationInterface, keywords: KeywordsPaginationInterface, people: TrendingPeopleInterface, collections: TmdbCollectionsPaginationInterface, companies: CompanyPaginationInterface, query: string}) {

  return (
    <Box overflow="auto" height="calc(100vh - 100px)" >
        <Box as="section" display="grid" gap={2} gridColumn={1} flex="1" p={4} overflow="hidden">
          <Heading as="h1" pb={4}>Results for &quot;{query}&quot;</Heading>
          <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={4}>
            <Box>
              <Heading as="h3" pb={4}>Top Result</Heading>
              <Box>
                {movies.results.sort((a: TmdbMovieSummaryInterface, b: TmdbMovieSummaryInterface) => b.popularity - a.popularity)[0] && <TopResult movie={movies.results.sort((a: TmdbMovieSummaryInterface, b: TmdbMovieSummaryInterface) => b.popularity - a.popularity)[0]} />}
              </Box>
              
            </Box>
            {
              movies.results.length > 1 && (
                <Box minW="300px" as="section" flex="1" p={4} pt={0} overflow="hidden">
                  <Heading as="h3" pb={4}>Matches</Heading>
                  <Box overflow="auto" maxHeight="300px">
                    <Movielist items={movies.results.slice(1, movies.results.length) as TmdbMovieSummaryInterface[]} />
                  </Box>
                </Box>
              )
            }

          </Box>
          {
            people.results.length > 0 && (
              <Box as="section" flex="1" p={4} pt={0} overflow="hidden">
                <Heading as="h3" pb={4}>Credits</Heading>
                <EmblaCarousel flex="0 0 140px">
                  {people.results.sort((a: PersonSummaryForInterface, b: PersonSummaryForInterface) => b.popularity - a.popularity).map((item: PersonSummaryForInterface, i: number) => (
                    <CreditAvatar key={i} item={item as PersonSummaryForInterface}/>
                  ))}
                </EmblaCarousel>
              </Box>
            )
          }
          {
            collections.results.length > 0 && (
              <Box as="section" flex="1" p={4} pt={0} overflow="hidden">
                <Heading as="h3" pb={4}>Collections</Heading>
                <Box overflow="auto" maxHeight="300px">
                  <Collectionlist items={collections.results} />
                </Box>
              </Box>
            )
          }
          {
            companies.results.length > 0 && ( 
              <Box as="section" flex="1" p={4} pt={0} overflow="hidden">
                <Heading as="h3" pb={4}>Companies</Heading>
                <Box overflow="auto" maxHeight="300px">
                  <Companylist items={companies.results} />
                </Box>
              </Box>
            )
          }

          {
            keywords.results.length > 0 && (
              <Box as="section" flex="1" p={4} pt={0} overflow="hidden">
                <Heading as="h3" pb={4}>Keywords</Heading>
                <Box overflow="auto" maxHeight="300px">
                  <Keywordlist items={keywords.results} />
                </Box>
              </Box>
            )
          }

        </Box>
    </Box>
  );
}