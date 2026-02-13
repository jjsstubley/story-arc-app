"use client"

import {
  Box,
  Flex,
  Text,
  Icon,
  Button,
  Portal,
  Drawer as ChakraDrawer,
} from "@chakra-ui/react"
import { LuChevronDown, LuChevronRight, LuMenu, LuX } from "react-icons/lu"
import * as React from "react"

// Types
export interface SidebarItem {
  id: string
  title: string
  href?: string
  icon?: React.ReactElement
  items?: SidebarItem[]
  disabled?: boolean
  external?: boolean
}

export interface SidebarSection {
  id: string
  title: string
  items: SidebarItem[]
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export interface SidebarProps {
  className?: string
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

// Components
export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  function Sidebar(
    { className, collapsed = false, children, ...props },
    ref
  ) {
    return (
      <Box
        ref={ref}
        className={className}
        display="flex"
        flexDirection="column"
        height="100vh"
        width={collapsed ? "60px" : "280px"}
        borderRight="1px solid"
        borderColor="gray.200"
        bg="white"
        _dark={{
          borderColor: "gray.700",
          bg: "gray.900",
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }
)

export const SidebarHeader = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  function SidebarHeader({ children }, ref) {
    return (
      <Box
        ref={ref}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        padding="4"
        borderBottom="1px solid"
        borderColor="gray.200"
        _dark={{
          borderColor: "gray.700",
        }}
      >
        {children}
      </Box>
    )
  }
)

export const SidebarContent = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  function SidebarContent({ children }, ref) {
    return (
      <Box
        ref={ref}
        flex="1"
        overflow="auto"
        padding="4"
      >
        {children}
      </Box>
    )
  }
)

export const SidebarSection = React.forwardRef<
  HTMLDivElement,
  {
    section: SidebarSection
    collapsed?: boolean
    activeItem?: string
    onItemClick?: (item: SidebarItem) => void
  }
>(function SidebarSection({ section, collapsed = false, activeItem, onItemClick }, ref) {
  const [isCollapsed, setIsCollapsed] = React.useState(section.defaultCollapsed || false)

  const handleToggle = () => {
    if (section.collapsible) {
      setIsCollapsed(!isCollapsed)
    }
  }

  const handleItemClick = (item: SidebarItem) => {
    if (onItemClick) {
      onItemClick(item)
    }
  }

  return (
    <Box ref={ref} marginBottom="6">
      <Flex
        alignItems="center"
        justifyContent="space-between"
        padding="2"
        cursor={section.collapsible ? "pointer" : "default"}
        onClick={section.collapsible ? handleToggle : undefined}
        fontSize="sm"
        fontWeight="medium"
        color="gray.600"
        _dark={{
          color: "gray.400",
        }}
      >
        {!collapsed && <Text>{section.title}</Text>}
        {section.collapsible && !collapsed && (
          <Icon
            as={isCollapsed ? LuChevronRight : LuChevronDown}
            size="sm"
            transition="transform 0.2s"
            transform={isCollapsed ? "rotate(0deg)" : "rotate(180deg)"}
          />
        )}
      </Flex>

      {(!isCollapsed || !section.collapsible) && (
        <Box>
          {section.items.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              collapsed={collapsed}
              active={activeItem === item.id}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </Box>
      )}
    </Box>
  )
})

export const SidebarItem = React.forwardRef<
  HTMLDivElement,
  {
    item: SidebarItem
    collapsed?: boolean
    active?: boolean
    onClick?: () => void
  }
>(function SidebarItem({ item, collapsed = false, active = false, onClick }, ref) {
  const [isSubmenuOpen, setIsSubmenuOpen] = React.useState(false)

  const handleClick = () => {
    if (item.items && item.items.length > 0) {
      setIsSubmenuOpen(!isSubmenuOpen)
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <Box ref={ref}>
      <Flex
        alignItems="center"
        gap="3"
        padding="2"
        borderRadius="md"
        fontSize="sm"
        cursor={item.disabled ? "not-allowed" : "pointer"}
        opacity={item.disabled ? 0.5 : 1}
        onClick={item.disabled ? undefined : handleClick}
        color={active ? "blue.700" : "gray.700"}
        bg={active ? "blue.50" : "transparent"}
        _hover={{
          bg: active ? "blue.100" : "gray.100",
          color: active ? "blue.800" : "gray.900",
        }}
        _dark={{
          color: active ? "blue.300" : "gray.300",
          bg: active ? "blue.900" : "transparent",
          _hover: {
            bg: active ? "blue.800" : "gray.800",
            color: active ? "blue.200" : "white",
          },
        }}
      >
        {item.icon && <Box flexShrink={0}>{item.icon}</Box>}
        {!collapsed && (
          <>
            <Text flex="1" textAlign="left">
              {item.title}
            </Text>
            {item.items && item.items.length > 0 && (
              <Icon
                as={isSubmenuOpen ? LuChevronDown : LuChevronRight}
                size="sm"
                transition="transform 0.2s"
                transform={isSubmenuOpen ? "rotate(180deg)" : "rotate(0deg)"}
              />
            )}
          </>
        )}
      </Flex>

      {item.items && item.items.length > 0 && !collapsed && isSubmenuOpen && (
        <Box paddingLeft="6">
          {item.items.map((subItem) => (
            <SidebarItem
              key={subItem.id}
              item={subItem}
              active={active}
              onClick={onClick}
            />
          ))}
        </Box>
      )}
    </Box>
  )
})

// Mobile Sidebar
export const MobileSidebar = React.forwardRef<
  HTMLDivElement,
  {
    sections: SidebarSection[]
    open: boolean
    onOpenChange: (open: boolean) => void
    activeItem?: string
    onItemClick?: (item: SidebarItem) => void
  }
>(function MobileSidebar({ sections, open, onOpenChange, activeItem, onItemClick }) {
  return (
    <ChakraDrawer.Root open={open} onOpenChange={(details) => onOpenChange(details.open)}>
      <Portal>
        <ChakraDrawer.Backdrop />
        <ChakraDrawer.Positioner>
          <ChakraDrawer.Content
            width="280px"
            bg="white"
            _dark={{
              bg: "gray.900",
            }}
          >
            <ChakraDrawer.Header>
              <Flex alignItems="center" justifyContent="space-between">
                <Text fontSize="lg" fontWeight="semibold">
                  Navigation
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                >
                  <LuX size={16} />
                </Button>
              </Flex>
            </ChakraDrawer.Header>
            <ChakraDrawer.Body>
              <Box flex="1" overflow="auto" padding="4">
                {sections.map((section) => (
                  <SidebarSection
                    key={section.id}
                    section={section}
                    activeItem={activeItem}
                    onItemClick={onItemClick}
                  />
                ))}
              </Box>
            </ChakraDrawer.Body>
          </ChakraDrawer.Content>
        </ChakraDrawer.Positioner>
      </Portal>
    </ChakraDrawer.Root>
  )
})

// Toggle Button
export const SidebarToggle = React.forwardRef<
  HTMLButtonElement,
  {
    collapsed?: boolean
    onCollapsedChange?: (collapsed: boolean) => void
    mobileOpen?: boolean
    onMobileOpenChange?: (open: boolean) => void
  }
>(function SidebarToggle(
  { collapsed = false, onCollapsedChange, mobileOpen, onMobileOpenChange },
  ref
) {
  const handleToggle = () => {
    if (onCollapsedChange) {
      onCollapsedChange(!collapsed)
    }
  }

  const handleMobileToggle = () => {
    if (onMobileOpenChange) {
      onMobileOpenChange(!mobileOpen)
    }
  }

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      onClick={onMobileOpenChange ? handleMobileToggle : handleToggle}
    >
      <Icon as={onMobileOpenChange ? LuMenu : (collapsed ? LuChevronRight : LuChevronDown)} />
    </Button>
  )
})

// Utility Components
export const SidebarGroup = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  function SidebarGroup({ children }, ref) {
    return (
      <Box ref={ref} marginBottom="6">
        {children}
      </Box>
    )
  }
)

export const SidebarLabel = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  function SidebarLabel({ children }, ref) {
    return (
      <Text
        ref={ref}
        fontSize="xs"
        fontWeight="semibold"
        color="gray.500"
        textTransform="uppercase"
        letterSpacing="wider"
        marginBottom="2"
      >
        {children}
      </Text>
    )
  }
) 