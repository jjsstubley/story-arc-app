// Example usage of the Sidebar component
// This demonstrates all the features available in the sidebar

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarSection,
  SidebarToggle,
  MobileSidebar,
  type SidebarItem,
  type SidebarSection as SidebarSectionType,
} from "./sidebar"
import { Box, Text, Button } from "@chakra-ui/react"
import { LuChrome, LuSearch, LuUser, LuSettings, LuFolder, LuStar, LuHeart } from "react-icons/lu"
import * as React from "react"

// Example sidebar data
const sidebarSections: SidebarSectionType[] = [
  {
    id: "main",
    title: "Main",
    items: [
      {
        id: "home",
        title: "Home",
        href: "/",
        icon: <LuChrome size={16} />,
      },
      {
        id: "search",
        title: "Search",
        href: "/search",
        icon: <LuSearch size={16} />,
      },
    ],
  },
  {
    id: "user",
    title: "User",
    collapsible: true,
    defaultCollapsed: false,
    items: [
      {
        id: "profile",
        title: "Profile",
        href: "/profile",
        icon: <LuUser size={16} />,
      },
      {
        id: "settings",
        title: "Settings",
        href: "/settings",
        icon: <LuSettings size={16} />,
        items: [
          {
            id: "account",
            title: "Account",
            href: "/settings/account",
          },
          {
            id: "preferences",
            title: "Preferences",
            href: "/settings/preferences",
          },
        ],
      },
    ],
  },
  {
    id: "content",
    title: "Content",
    collapsible: true,
    defaultCollapsed: true,
    items: [
      {
        id: "collections",
        title: "Collections",
        href: "/collections",
        icon: <LuFolder size={16} />,
      },
      {
        id: "favorites",
        title: "Favorites",
        href: "/favorites",
        icon: <LuHeart size={16} />,
      },
      {
        id: "rated",
        title: "Rated",
        href: "/rated",
        icon: <LuStar size={16} />,
      },
    ],
  },
]

// Example component showing different sidebar configurations
export function SidebarExample() {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [activeItem, setActiveItem] = React.useState("home")

  const handleItemClick = (item: SidebarItem) => {
    setActiveItem(item.id)
    if (item.href) {
      // Navigate to the href
      console.log(`Navigating to: ${item.href}`)
    }
  }

  return (
    <Box display="flex" height="100vh">
      {/* Desktop Sidebar */}
      <Box display={{ base: "none", md: "block" }}>
        <Sidebar collapsed={collapsed}>
          <SidebarHeader>
            <Text fontSize="lg" fontWeight="bold">
              {!collapsed && "My App"}
            </Text>
            <SidebarToggle
              collapsed={collapsed}
              onCollapsedChange={setCollapsed}
            />
          </SidebarHeader>
          <SidebarContent>
            {sidebarSections.map((section) => (
              <SidebarSection
                key={section.id}
                section={section}
                collapsed={collapsed}
                activeItem={activeItem}
                onItemClick={handleItemClick}
              />
            ))}
          </SidebarContent>
        </Sidebar>
      </Box>

      {/* Mobile Sidebar */}
      <Box display={{ base: "block", md: "none" }}>
        <MobileSidebar
          sections={sidebarSections}
          open={mobileOpen}
          onOpenChange={setMobileOpen}
          activeItem={activeItem}
          onItemClick={handleItemClick}
        />
      </Box>

      {/* Main Content */}
      <Box flex="1" padding="4">
        <Box display={{ base: "block", md: "none" }} marginBottom="4">
          <Button onClick={() => setMobileOpen(true)}>
            <LuChrome size={16} />
            Menu
          </Button>
        </Box>
        
        <Text fontSize="2xl" fontWeight="bold" marginBottom="4">
          Main Content
        </Text>
        <Text>
          This is the main content area. The sidebar is {collapsed ? "collapsed" : "expanded"}.
        </Text>
      </Box>
    </Box>
  )
}

// Example of a simple sidebar without collapsible sections
export function SimpleSidebarExample() {
  const [activeItem, setActiveItem] = React.useState("home")

  const simpleSections: SidebarSectionType[] = [
    {
      id: "navigation",
      title: "Navigation",
      items: [
        {
          id: "home",
          title: "Home",
          href: "/",
          icon: <LuChrome size={16} />,
        },
        {
          id: "search",
          title: "Search",
          href: "/search",
          icon: <LuSearch size={16} />,
        },
        {
          id: "profile",
          title: "Profile",
          href: "/profile",
          icon: <LuUser size={16} />,
        },
      ],
    },
  ]

  return (
    <Box display="flex" height="100vh">
      <Sidebar>
        <SidebarHeader>
          <Text fontSize="lg" fontWeight="bold">Simple App</Text>
        </SidebarHeader>
        <SidebarContent>
          {simpleSections.map((section) => (
            <SidebarSection
              key={section.id}
              section={section}
              activeItem={activeItem}
              onItemClick={(item) => setActiveItem(item.id)}
            />
          ))}
        </SidebarContent>
      </Sidebar>
      
      <Box flex="1" padding="4">
        <Text fontSize="2xl" fontWeight="bold">
          Simple Sidebar Example
        </Text>
      </Box>
    </Box>
  )
}

// Example showing how to integrate with your existing layout
export function LayoutSidebarExample() {
  const [collapsed, setCollapsed] = React.useState(false)
  const [activeItem, setActiveItem] = React.useState("home")

  // Transform your existing data to sidebar format
  const layoutSections: SidebarSectionType[] = [
    {
      id: "navigation",
      title: "Navigation",
      items: [
        {
          id: "home",
          title: "Home",
          href: "/",
          icon: <LuChrome size={16} />,
        },
        {
          id: "search",
          title: "Search",
          href: "/search",
          icon: <LuSearch size={16} />,
        },
      ],
    },
    {
      id: "collections",
      title: "Collections",
      collapsible: true,
      items: [
        {
          id: "action",
          title: "Action",
          href: "/genres/action",
        },
        {
          id: "comedy",
          title: "Comedy",
          href: "/genres/comedy",
        },
        {
          id: "drama",
          title: "Drama",
          href: "/genres/drama",
        },
      ],
    },
  ]

  return (
    <Box display="flex" height="100vh">
      <Sidebar collapsed={collapsed}>
        <SidebarHeader>
          <Text fontSize="lg" fontWeight="bold">
            {!collapsed && "STORY ARC"}
          </Text>
          <SidebarToggle
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
          />
        </SidebarHeader>
        <SidebarContent>
          {layoutSections.map((section) => (
            <SidebarSection
              key={section.id}
              section={section}
              collapsed={collapsed}
              activeItem={activeItem}
              onItemClick={(item) => setActiveItem(item.id)}
            />
          ))}
        </SidebarContent>
      </Sidebar>
      
      <Box flex="1" padding="4">
        <Text fontSize="2xl" fontWeight="bold">
          Layout Integration Example
        </Text>
      </Box>
    </Box>
  )
} 