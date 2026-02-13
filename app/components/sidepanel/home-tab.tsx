import { Link } from "@remix-run/react";
import { Text, Accordion, SimpleGrid, Heading, Avatar, Stack, Box } from "@chakra-ui/react"
import { FaRegCircle } from "react-icons/fa";
import { LuDrama, LuUser } from "react-icons/lu";
import { BsCollection } from "react-icons/bs";
import { GenreInterface } from "~/interfaces/tmdb/genre";
import { slugify } from "~/utils/helpers";
import { PersonSummaryForInterface } from "~/interfaces/tmdb/people/summary";

export default function HomeTab({collections, genres, people}: {collections: { id: string, name: string }[], genres: GenreInterface[], people: PersonSummaryForInterface[]}) {
    const sections = [
        {
            title: "Collections",
            value: "collections",
            description: "Curated, AI-generated and User collections",
            icon: <BsCollection color="whiteAlpha.600" />,
            content: <CollectionList collections={collections} />
        },
        {
            title: "Genres",
            value: "genres",
            description: "Search by genre",
            icon: <LuDrama color="whiteAlpha.600" />,
            content: <GenreList genres={genres} />
        },
        {
            title: "Stars",
            value: "stars",
            description: "Trending and popular stars",
            icon: <LuUser color="whiteAlpha.600" />,
            content: <PeopleList people={people} />
        }
    ]               
  return (
    <Box>
        <Accordion.Root collapsible multiple defaultValue={["collections"]}>
            {sections.map((section) => (
                <Accordion.Item key={section.value} value={section.value}>
                    <Accordion.ItemTrigger>
                        <Stack gap="1">
                            <Box display="flex" gap={4} alignItems="center">
                            {section.icon}
                            <Heading as="h3" color="whiteAlpha.600" size="sm"> {section.title} </Heading>
                            </Box>
                            <Text fontSize="xs" color="fg.muted">{section.description}</Text>
                        </Stack>
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                        <Accordion.ItemBody>
                            {section.content}
                        </Accordion.ItemBody>
                    </Accordion.ItemContent>
                </Accordion.Item>
            ))}
        </Accordion.Root>
        {/* <Heading as="h3" > Discover </Heading> */}

    </Box>
  );
}

function PeopleList({people}: {people: PersonSummaryForInterface[]}) {
  return (
    <SimpleGrid columns={1} gap={4} padding={0} margin={0} pl={4} borderLeft="1px solid" borderColor="gray.700">
      {people.slice(0, 10).map(person => (
        <Link to={`/credits/${slugify(person.name)}_${person.id}`} key={person.id}>
          <Box display="flex" gap={4} alignItems="center" fontSize="xs" rounded="md" p={2} py={1} _hover={
            { bg: 'gray.800', color: "orange.400", cursor: "pointer" }
          }>
            <Avatar.Root colorPalette="blue">
              <Avatar.Fallback name={person.name} />
              <Avatar.Image src={`https://image.tmdb.org/t/p/w300/${person.profile_path}`} />
            </Avatar.Root>
            <Heading as="h3" fontSize="xs">{person.name}</Heading>
          </Box>
        </Link>
      ))}
    </SimpleGrid>
  );
}

function GenreList({genres}: {genres: GenreInterface[]}) {
  const genreList = ['Action', 'Animation', 'Horror', 'Comedy', 'Drama', 'Documentary', 'Sci-Fi'];
  return (
    <Box listStyle="none" padding={0} margin={0} spaceY={4} pl={4} borderLeft="1px solid" borderColor="gray.700">
    {
        genres?.filter((i) => genreList.includes(i.name) ).map(genre => (
        <Link to={`/genres/${genre.name}`} key={genre.id}>
            <Box display="flex" gap={4} alignItems="center" fontSize="xs" rounded="md" p={2} py={1} _hover={
            { bg: 'gray.800', color: "orange.400", cursor: "pointer" }
            }>
            <FaRegCircle  /><Heading as="h3" fontSize="xs">{genre.name}</Heading>
            </Box>
        </Link>
        ))
    }
    </Box>
  );
}

function CollectionList({collections}: {collections: { id: string, name: string }[]}) {
  return (
    <Box listStyle="none" padding={0} margin={0} spaceY={8} pl={4} borderLeft="1px solid" borderColor="gray.700">
    {
        collections?.map(collection => (
            <Link to={`/collections/${collection.id}`} key={collection.id}>
                <Box display="flex" gap={4} alignItems="center" fontSize="xs" p={2} py={1} rounded="md" _hover={
                { bg: 'gray.800', color: "orange.400", cursor: "pointer" }
                }>
                    <FaRegCircle  /><Heading as="h3" fontSize="xs">{collection.name}</Heading>
                </Box>
            </Link>
        ))
    }
    </Box>
  );
}