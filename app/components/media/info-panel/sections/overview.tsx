import { Box } from "@chakra-ui/react";

const OverviewSection = ({overview} : { overview: string }) => {

    return (
      <Box listStyle="none" padding={0} margin={0} spaceY={4} pl={4} borderLeft="1px solid" borderColor="gray.700">
        {overview}
      </Box>
    );
};

export default OverviewSection;