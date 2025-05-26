import {  Box, Container, Flex, Heading } from "@chakra-ui/react"

import GoogleSignIn from "~/components/googleSignIn";
import { ColorModeButton } from "~/components/ui/color-mode";
import SearchFeature from "~/components/search/searchFeature";


export default function DashboardLoggedOut() {

    return (
        <Container py={8}>
          <Flex direction="column" minH="100vh" gap={4}>
            <Box display="flex" justifyContent="space-between">
              <Heading as="h1">&#123;&#123; storyARC &#125;&#125; </Heading>
              <ColorModeButton />
            </Box>
            <GoogleSignIn />
            <SearchFeature />
          </Flex>
        </Container>
      )
}