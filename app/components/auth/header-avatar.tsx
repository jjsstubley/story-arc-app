import {
  Menu as ChakraMenu,
  Box,
  Flex,
  Text,
  Portal,
  Switch as ChakraSwitch,
  ClientOnly,
  Skeleton,
} from "@chakra-ui/react"
import { LuUser, LuSettings, LuLogOut } from "react-icons/lu"
import * as React from "react"
import { Avatar } from "~/components/ui/avatar"
import { useColorMode, ColorModeIcon } from "~/components/ui/color-mode"
import { Session } from '@supabase/supabase-js'
import SignOutDialog from './signout-dialog'

interface HeaderAvatarProps {
  session: Session
}

export default function HeaderAvatar({ session }: HeaderAvatarProps) {
  const [signOutDialogOpen, setSignOutDialogOpen] = React.useState(false)
  const user = session.user
  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User"
  const userEmail = user.email || ""
  const userAvatar = user.user_metadata?.avatar_url
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <>
      <ChakraMenu.Root positioning={{ placement: "bottom-end" }}>
      <ChakraMenu.Trigger asChild>
        <Box
          display="flex"
          alignItems="center"
          cursor="pointer"
          _hover={{ opacity: 0.8 }}
          transition="opacity 0.2s"
        >
          <Avatar
            size="sm"
            name={userName}
            src={userAvatar}
            fallback={<LuUser />}
          />
        </Box>
      </ChakraMenu.Trigger>

      <Portal>
        <ChakraMenu.Positioner>
          <ChakraMenu.Content
            flex="1"
            minW="345px"
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            boxShadow="lg"
            _dark={{
              bg: "gray.900",
              borderColor: "gray.700",
            }}
          >
            <Box p="4" borderBottom="1px solid" borderColor="gray.200" _dark={{ borderColor: "gray.700" }}>
              <Flex alignItems="center" gap="3">
                <Avatar
                  size="md"
                  name={userName}
                  src={userAvatar}
                  fallback={<LuUser />}
                />
                <Box>
                  <Text fontSize="sm" fontWeight="medium">
                    {userName}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {userEmail}
                  </Text>
                </Box>
              </Flex>
            </Box>

            <ChakraMenu.ItemGroup>
              <ChakraMenu.Item
                value="profile"
                display="flex"
                alignItems="center"
                gap="3"
                padding="3"
                cursor="pointer"
                _hover={{ bg: "gray.50" }}
                _dark={{ _hover: { bg: "gray.800" } }}
              >
                <LuUser size={16} />
                <Text fontSize="sm">Profile</Text>
              </ChakraMenu.Item>

              <ChakraMenu.Item
                value="settings"
                display="flex"
                alignItems="center"
                gap="3"
                padding="3"
                cursor="pointer"
                _hover={{ bg: "gray.50" }}
                _dark={{ _hover: { bg: "gray.800" } }}
              >
                <LuSettings size={16} />
                <Text fontSize="sm">Settings</Text>
              </ChakraMenu.Item>

              <ClientOnly fallback={<Skeleton height="40px" />}>
                <ChakraMenu.Item
                  value="color-mode"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap="3"
                  padding="3"
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                  _dark={{ _hover: { bg: "gray.800" } }}
                  onClick={(e) => {
                    e.preventDefault()
                    toggleColorMode()
                  }}
                >
                  <Flex alignItems="center" gap="3">
                    <ColorModeIcon />
                    <Text fontSize="sm">Dark mode</Text>
                  </Flex>
                  <Box onClick={(e) => e.stopPropagation()}>
                    <ChakraSwitch.Root
                      checked={colorMode === "dark"}
                      onCheckedChange={toggleColorMode}
                      size="sm"
                    >
                      <ChakraSwitch.HiddenInput />
                      <ChakraSwitch.Control>
                        <ChakraSwitch.Thumb />
                      </ChakraSwitch.Control>
                    </ChakraSwitch.Root>
                  </Box>
                </ChakraMenu.Item>
              </ClientOnly>

              <ChakraMenu.Separator />

              <ChakraMenu.Item
                value="logout"
                display="flex"
                alignItems="center"
                gap="3"
                padding="3"
                cursor="pointer"
                _hover={{ bg: "gray.50" }}
                _dark={{ _hover: { bg: "gray.800" } }}
                onClick={(e) => {
                  e.preventDefault()
                  setSignOutDialogOpen(true)
                }}
              >
                <LuLogOut size={16} />
                <Text fontSize="sm">Sign out</Text>
              </ChakraMenu.Item>
            </ChakraMenu.ItemGroup>
          </ChakraMenu.Content>
        </ChakraMenu.Positioner>
      </Portal>
    </ChakraMenu.Root>

    <SignOutDialog 
      isOpen={signOutDialogOpen} 
      onOpenChange={setSignOutDialogOpen}
      userName={userName}
    />
    </>
  )
}

