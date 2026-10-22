import { Accordion, Box, Heading, Stack, Text } from "@chakra-ui/react";
import { Session } from "@supabase/supabase-js";
import { UserAccountDropdown } from "~/components/ui/user-account-dropdown";
import SidebarSignupCard from "~/components/auth/sidebar-signup-card";
import { getNavSections, type FilterOptionsProps } from "./nav-sections";

const ArcSidePanel = ({filters, session} : {filters: FilterOptionsProps, session: Session | null}) => {
  const sections = getNavSections(filters, session);
  return (
    <Box as="nav" w="25%" minWidth="300px" height="calc(100vh - 100px)" overflow="hidden" display={{ base: "none", md: "flex" }} flexDirection="column">
      <Box flex="1"  overflow="hidden" display="flex" flexDirection="column">
        <Accordion.Root defaultValue={["search"]} spaceY={2} height="100%" >
            {sections.map((section) => (
                <Accordion.Item key={section.value} value={section.value}  bgColor="bg.muted" rounded="lg"  w="full">
                    <Accordion.ItemTrigger p={0} >
                      <Box bg={section.color.default} _hover={{ bg: section.color.hover, cursor: "pointer" }} rounded="lg" w="full" shadow="md">
                        <Stack gap="1" p={4}>
                            <Box display="flex" gap={4} alignItems="center">
                            {section.icon}
                            <Heading as="h3" color="white" size="lg"> {section.label} </Heading>
                            </Box>
                            <Text fontSize="xs" color="fg.muted">{section.description}</Text>
                        </Stack>
                      </Box>
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                        <Accordion.ItemBody>
                            <Box 
                              maxHeight="calc(100vh - 471px)" // Account for header and account section
                              overflowY="auto"
                              px={4}
                              // pr={2} // Padding for scrollbar
                            >
                              <Box mt={2}>
                                {section.content}
                              </Box>
                            </Box>
                        </Accordion.ItemBody>
                    </Accordion.ItemContent>
                </Accordion.Item>
            ))}
        </Accordion.Root>
      </Box>
      {/* Account section - fixed at bottom */}
      {session ? (
        <Box 
          flexShrink={0}
          mt={2}
          borderColor="gray.200" 
          _dark={{ borderColor: "gray.700" }}
          bg="bg.muted"
          rounded="lg"
        >
          <UserAccountDropdown 
            user={session.user} 
            onSignOut={() => {}} 
            className="user-account-dropdown" 
          />
        </Box>
      ) : (
        <SidebarSignupCard />
      )}
    </Box>
  );
};

export default ArcSidePanel;