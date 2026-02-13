import { Text } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { CrewInterface } from "~/interfaces/tmdb/people/crew";
import { CastInterface } from "~/interfaces/tmdb/people/cast";
import { slugify } from "~/utils/helpers";

const Credits= ({credits, children} : { credits: CrewInterface[] | CastInterface[], children?: (credit: CrewInterface | CastInterface, index: number) => React.ReactNode;}) => {

    return (
        <>
            {
                credits.map((credit, index) => (
                    <Link key={index} to={`/credits/${slugify(credit.name)}_${credit.id}`}>
                        {children ? children(credit, index) : <Text _hover={{ color: 'orange.500'}} whiteSpace="nowrap">{credit.name}</Text>}
                    </Link>
                ))
            }
        </>
    );
};

export default Credits;