import { Box } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import CreditProfile from "~/components/credit/credit-profile";
import { slugify } from "~/utils/helpers";
import { CastInterface } from "~/interfaces/tmdb/people/cast";

const CreditsSection = ({cast} : { cast: CastInterface[] }) => {

    return (
      <Box listStyle="none" padding={0} margin={0} spaceY={4} pl={4} borderLeft="1px solid" borderColor="gray.700">
        <Box display="flex" gap={2} flexWrap="wrap">
          {
            cast.slice(0, 10).map((item, index) => (
              <Link key={index} to={`/credits/${slugify(item.name)}_${item.id}`}>
                <Box minWidth="100px" maxWidth="100px">
                  <CreditProfile item={item} role={item.character}/>
                </Box>
              </Link>
            ))
          }
        </Box>
      </Box>
    );
};

export default CreditsSection;