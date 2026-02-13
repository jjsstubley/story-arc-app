import { Box } from "@chakra-ui/react";
import Keywords from "../../common/keywords";
import { KeywordItemInterface } from "~/interfaces/tmdb/keywords";

const KeywordSection = ({keywords} : { keywords: KeywordItemInterface[] }) => {

    return (
      <Box listStyle="none" padding={0} margin={0} spaceY={4} pl={4} borderLeft="1px solid" borderColor="gray.700">
        <Box display="flex" gap={2} flexWrap="wrap">   
            <Keywords keywords={keywords || []} />
        </Box>
      </Box>
    );
};

export default KeywordSection;