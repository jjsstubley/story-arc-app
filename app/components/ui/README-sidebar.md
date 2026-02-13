# Sidebar Component

A comprehensive utility sidebar component that provides all the functionality of shadcn/ui's sidebar but built with Chakra UI v3. This component includes collapsible sections, navigation items, responsive behavior, and mobile support.

## Features

- ✅ **Collapsible Sections**: Sections can be collapsed/expanded
- ✅ **Nested Navigation**: Support for sub-items and nested menus
- ✅ **Responsive Design**: Desktop sidebar + mobile drawer
- ✅ **Dark Mode Support**: Automatic dark mode compatibility
- ✅ **Accessibility**: Built with Chakra UI's a11y features
- ✅ **TypeScript Safe**: Full TypeScript support with proper interfaces
- ✅ **Customizable**: Easy to extend and customize
- ✅ **Icon Support**: Built-in icon support for navigation items

## Components

### Core Components

- `Sidebar` - Main sidebar container
- `SidebarHeader` - Header section with title and controls
- `SidebarContent` - Scrollable content area
- `SidebarSection` - Collapsible section with items
- `SidebarItem` - Individual navigation item
- `SidebarToggle` - Toggle button for collapse/expand
- `MobileSidebar` - Mobile drawer version
- `SidebarGroup` - Grouping utility component
- `SidebarLabel` - Label component for sections

## Usage

### Basic Sidebar

```tsx
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarSection,
  type SidebarItem,
  type SidebarSection as SidebarSectionType,
} from "~/components/ui/sidebar"
import { LuChrome, LuSearch, LuUser } from "react-icons/lu"

const sections: SidebarSectionType[] = [
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
]

export function MySidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <Text fontSize="lg" fontWeight="bold">My App</Text>
      </SidebarHeader>
      <SidebarContent>
        {sections.map((section) => (
          <SidebarSection
            key={section.id}
            section={section}
            onItemClick={(item) => {
              console.log(`Clicked: ${item.title}`)
            }}
          />
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
```

### Collapsible Sidebar

```tsx
export function CollapsibleSidebar() {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
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
        {sections.map((section) => (
          <SidebarSection
            key={section.id}
            section={section}
            collapsed={collapsed}
          />
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
```

### Mobile Sidebar

```tsx
export function MobileSidebarExample() {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <Box>
      {/* Mobile Toggle */}
      <Button onClick={() => setMobileOpen(true)}>
        <LuChrome size={16} />
        Menu
      </Button>

      {/* Mobile Sidebar */}
      <MobileSidebar
        sections={sections}
        open={mobileOpen}
        onOpenChange={setMobileOpen}
      />
    </Box>
  )
}
```

### Nested Navigation

```tsx
const sectionsWithNesting: SidebarSectionType[] = [
  {
    id: "settings",
    title: "Settings",
    collapsible: true,
    items: [
      {
        id: "account",
        title: "Account",
        href: "/settings/account",
        icon: <LuUser size={16} />,
        items: [
          {
            id: "profile",
            title: "Profile",
            href: "/settings/account/profile",
          },
          {
            id: "security",
            title: "Security",
            href: "/settings/account/security",
          },
        ],
      },
    ],
  },
]
```

## Props

### SidebarProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `className` | `string` | No | Additional CSS classes |
| `collapsed` | `boolean` | No | Whether sidebar is collapsed |
| `onCollapsedChange` | `(collapsed: boolean) => void` | No | Collapse state change handler |
| `children` | `React.ReactNode` | No | Sidebar content |

### SidebarSectionProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `section` | `SidebarSection` | Yes | Section configuration |
| `collapsed` | `boolean` | No | Whether sidebar is collapsed |
| `activeItem` | `string` | No | Currently active item ID |
| `onItemClick` | `(item: SidebarItem) => void` | No | Item click handler |

### SidebarItem

```tsx
interface SidebarItem {
  id: string
  title: string
  href?: string
  icon?: React.ReactElement
  items?: SidebarItem[]
  disabled?: boolean
  external?: boolean
}
```

### SidebarSection

```tsx
interface SidebarSection {
  id: string
  title: string
  items: SidebarItem[]
  collapsible?: boolean
  defaultCollapsed?: boolean
}
```

## Integration with Your Layout

Replace your existing side panel with the new sidebar:

```tsx
// app/routes/_layout/route.tsx
import { Sidebar, SidebarHeader, SidebarContent, SidebarSection } from "~/components/ui/sidebar"

export default function Layout() {
  const { session, filterOptions } = useLoaderData<typeof loader>()
  
  // Transform your existing data
  const sidebarSections = [
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
      id: "genres",
      title: "Genres",
      collapsible: true,
      items: filterOptions.genres.genres.map(genre => ({
        id: genre.id.toString(),
        title: genre.name,
        href: `/genres/${genre.name}`,
      })),
    },
  ]

  return (
    <Container>
      <Flex direction="column" minH="100vh" gap={4}>
        <Box as="header" pt={4}>
          <Heading>STORY ARC</Heading>
        </Box>
        
        <Flex flex="1" gap={2}>
          <Sidebar>
            <SidebarHeader>
              <Text fontSize="lg" fontWeight="bold">Navigation</Text>
            </SidebarHeader>
            <SidebarContent>
              {sidebarSections.map((section) => (
                <SidebarSection
                  key={section.id}
                  section={section}
                />
              ))}
            </SidebarContent>
          </Sidebar>
          
          <Box flex="1">
            <Outlet />
          </Box>
        </Flex>
      </Flex>
    </Container>
  )
}
```

## Styling

The component uses Chakra UI's design tokens and follows your existing patterns:

- **Desktop**: Fixed width sidebar with collapse functionality
- **Mobile**: Drawer-based sidebar with backdrop
- **Dark Mode**: Automatic dark mode support
- **Hover States**: Proper hover effects for interactive elements
- **Active States**: Visual feedback for active navigation items

## Customization

### Custom Styling

```tsx
<Sidebar
  className="custom-sidebar"
  borderRight="2px solid"
  borderColor="blue.500"
>
  {/* Content */}
</Sidebar>
```

### Custom Icons

```tsx
import { LuHome, LuSearch, LuUser } from "react-icons/lu"

const items = [
  {
    id: "home",
    title: "Home",
    icon: <LuHome size={16} />,
  },
]
```

### Custom Click Handlers

```tsx
<SidebarSection
  section={section}
  onItemClick={(item) => {
    if (item.href) {
      navigate(item.href)
    }
    // Custom logic
    analytics.track('sidebar_navigation', { item: item.id })
  }}
/>
```

## Accessibility

- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Focus management
- ✅ ARIA attributes
- ✅ Semantic HTML structure
- ✅ High contrast support

## Dependencies

- `@chakra-ui/react` - UI components
- `react-icons/lu` - Icons
- `@remix-run/react` - Navigation (optional)

## Migration from shadcn/ui

This component provides feature parity with shadcn/ui's sidebar:

| shadcn/ui Feature | Chakra UI Equivalent |
|-------------------|---------------------|
| `Sidebar` | `Sidebar` |
| `SidebarHeader` | `SidebarHeader` |
| `SidebarContent` | `SidebarContent` |
| `SidebarSection` | `SidebarSection` |
| `SidebarItem` | `SidebarItem` |
| `SidebarToggle` | `SidebarToggle` |
| Mobile Drawer | `MobileSidebar` |

The main differences:
- Uses Chakra UI's styling system instead of Tailwind
- Better TypeScript integration
- More flexible customization options
- Built-in dark mode support 