"use client"

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
import { LuUser, LuSettings, LuLogOut, LuChevronsUpDown } from "react-icons/lu"
import * as React from "react"
import { Form } from "@remix-run/react"
import { Avatar } from "./avatar"
import { useColorMode, ColorModeIcon } from "./color-mode"

export interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

export interface UserAccountDropdownProps {
  user: User | null
  onSignOut?: () => void
  className?: string
}

export const UserAccountDropdown = React.forwardRef<
  HTMLDivElement,
  UserAccountDropdownProps
>(function UserAccountDropdown({ user, onSignOut, className }, ref) {
  if (!user) {
    return null
  }

  const { colorMode, toggleColorMode } = useColorMode()
  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User"
  const userEmail = user.email || ""
  const userAvatar = user.user_metadata?.avatar_url

  return (
    <ChakraMenu.Root positioning={{ placement: "bottom-start" }}>
      <ChakraMenu.Trigger asChild>
        <Box
          ref={ref}
          borderTop="1px solid"
          borderColor="gray.200"
          className={className}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap="2"
          padding="2"
          borderRadius="md"
          cursor="pointer"
          _hover={{ bg: "gray.100" }}
          _dark={{ _hover: { bg: "gray.800" }, borderColor: "gray.800" }}
        >
          <Box display="flex" alignItems="center" gap="2">
            <Avatar
              size="sm"
              name={userName}
              src={userAvatar}
              fallback={<LuUser />}
            />
            <Box display={{ base: "none", md: "block" }}>
              <Text fontSize="sm" fontWeight="medium">
                {userName}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {userEmail}
              </Text>
            </Box>
          </Box>
          <LuChevronsUpDown size={16} />
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

              <Form action="/auth/logout" method="post">
                <ChakraMenu.Item
                  value="logout"
                  as="button"
                  display="flex"
                  alignItems="center"
                  gap="3"
                  padding="3"
                  cursor="pointer"
                  _hover={{ bg: "gray.50" }}
                  _dark={{ _hover: { bg: "gray.800" } }}
                  onClick={onSignOut}
                >
                  <LuLogOut size={16} />
                  <Text fontSize="sm">Sign out</Text>
                </ChakraMenu.Item>
              </Form>
            </ChakraMenu.ItemGroup>
          </ChakraMenu.Content>
        </ChakraMenu.Positioner>
      </Portal>
    </ChakraMenu.Root>
  )
}) 