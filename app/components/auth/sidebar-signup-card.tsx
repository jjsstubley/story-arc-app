import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react'
import { LuSparkles } from 'react-icons/lu'
import AuthDialog from './auth-dialog'

export default function SidebarSignupCard() {
  return (
    <Box
      flexShrink={0}
      mt={2}
      bg="purple.900/30"
      _hover={{ bg: "purple.900/50" }}
      rounded="lg"
      p={4}
      border="1px solid"
      borderColor="purple.500/20"
      _dark={{ borderColor: "purple.400/20" }}
      shadow="md"
      transition="all 0.2s"
    >
      <Stack gap={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <LuSparkles color="purple" size={20} />
          <Heading as="h3" size="sm" color="white">
            Join filmarc
          </Heading>
        </Box>
        <Text fontSize="xs" color="fg.muted" lineHeight="1.5">
          Create an account to save your favorite movies, build custom collections, and get personalized recommendations.
        </Text>
        <AuthDialog mode="signup" trigger={
          <Button
            size="sm"
            variant="solid"
            colorPalette="purple"
            width="100%"
            _hover={{
              transform: "translateY(-1px)",
              boxShadow: "md"
            }}
            transition="all 0.2s"
          >
            Get Started
          </Button>
        } />
      </Stack>
    </Box>
  )
}

