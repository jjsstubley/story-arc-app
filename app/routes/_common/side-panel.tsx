import { Box,  Heading, Input } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { MdOutlineSubdirectoryArrowRight } from "react-icons/md";

const SidePanel = () => {
  
  return (
    <Box as="nav" w={{ base: "100%", md: "25%" }} minWidth="300px" minHeight="90vh" p={8} bgColor="bg.muted" rounded="lg">
      {/* <Text>Sidebar</Text> */}
      <Heading as="h3" > Filter By  </Heading>
      <Input
        // ref={inputRef}
        name="search"
        variant="outline"
        colorPalette="orange"
        flex={1}
        size="xs"
        // value={inputValue}
        // onChange={handleMainInputChange}
        // onKeyDown={handleKeyDown}
        placeholder="keywords"
      />
      <Heading as="h3" > Search By  </Heading>
      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        <Link to="/genres"><Box display="flex" gap={2} alignItems="center" color="gray.700"><MdOutlineSubdirectoryArrowRight /><Heading as="h3" fontSize="sm" letterSpacing="0.225em">Genre</Heading></Box></Link>
        <Link to="/cast"><Box display="flex" gap={2} alignItems="center" color="gray.700"><MdOutlineSubdirectoryArrowRight /><Heading as="h3" fontSize="sm" letterSpacing="0.225em">Cast</Heading></Box></Link>
      </Box>
    </Box>
  );
};

export default SidePanel;