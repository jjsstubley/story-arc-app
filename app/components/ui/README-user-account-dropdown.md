# UserAccountDropdown Component

A utility dropdown component for user account management, built with Chakra UI v3 and following the existing design patterns in your codebase.

## Features

- ✅ **User Avatar Display**: Shows user avatar with fallback to initials
- ✅ **User Information**: Displays user name and email
- ✅ **Responsive Design**: Hides user info on mobile, shows on desktop
- ✅ **Dark Mode Support**: Fully compatible with your existing dark mode setup
- ✅ **Accessibility**: Built with Chakra UI's accessibility features
- ✅ **Sign Out Integration**: Includes Remix Form for logout functionality
- ✅ **Customizable**: Easy to extend with additional menu items

## Usage

### Basic Usage

```tsx
import { UserAccountDropdown, type User } from "~/components/ui/user-account-dropdown"

const user: User = {
  id: "user-123",
  email: "user@example.com",
  user_metadata: {
    full_name: "John Doe",
    avatar_url: "https://example.com/avatar.jpg"
  }
}

<UserAccountDropdown user={user} />
```

### With Sign Out Handler

```tsx
<UserAccountDropdown 
  user={user} 
  onSignOut={() => {
    console.log("User signed out")
    // Additional cleanup logic
  }}
/>
```

### Integration in Layout

Replace your existing menu in `app/routes/_layout/route.tsx`:

```tsx
import { UserAccountDropdown, type User } from "~/components/ui/user-account-dropdown"

export default function Layout() {
  const { session } = useLoaderData<typeof loader>()
  
  // Transform session to User interface
  const user: User | null = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    user_metadata: session.user.user_metadata
  } : null

  return (
    <Container>
      <Flex direction="column" minH="100vh" gap={4}>
        <Box as="header" pt={4} display="flex" gap={4} alignItems="flex-start">
          <Heading as="h1">STORY ARC</Heading>
          <SearchFeature genres={filterOptions.genres.genres}/>
          <Box display="flex" justifyContent="space-between" gap={4}>
            <ColorModeButton />
            {!session ? (
              <GoogleSignIn />
            ) : (
              <UserAccountDropdown user={user} />
            )}
          </Box>
        </Box>
        {/* Rest of layout */}
      </Flex>
    </Container>
  )
}
```

## Props

### UserAccountDropdownProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `user` | `User \| null` | Yes | User object with id, email, and metadata |
| `onSignOut` | `() => void` | No | Callback function when user signs out |
| `className` | `string` | No | Additional CSS classes |

### User Interface

```tsx
interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}
```

## Styling

The component uses Chakra UI's design tokens and follows your existing styling patterns:

- **Trigger**: Hover effects with gray background
- **Menu**: Clean white background with subtle border
- **Items**: Hover effects with proper spacing
- **Dark Mode**: Automatic dark mode support

## Customization

### Adding Menu Items

To add custom menu items, modify the component:

```tsx
<ChakraMenu.ItemGroup>
  <ChakraMenu.Item value="profile">
    <LuUser size={16} />
    <Text fontSize="sm">Profile</Text>
  </ChakraMenu.Item>
  
  {/* Add your custom items here */}
  <ChakraMenu.Item value="custom">
    <YourIcon size={16} />
    <Text fontSize="sm">Custom Action</Text>
  </ChakraMenu.Item>
  
  <ChakraMenu.Separator />
  
  <Form action="/auth/logout" method="post">
    <ChakraMenu.Item value="logout" as="button">
      <LuLogOut size={16} />
      <Text fontSize="sm">Sign out</Text>
    </ChakraMenu.Item>
  </Form>
</ChakraMenu.ItemGroup>
```

### Styling Overrides

The component uses inline styles for consistency, but you can override them:

```tsx
<UserAccountDropdown 
  user={user}
  className="custom-user-dropdown"
/>
```

## Dependencies

- `@chakra-ui/react` - UI components
- `react-icons/lu` - Icons
- `@remix-run/react` - Form component for logout

## Accessibility

- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Focus management
- ✅ ARIA attributes
- ✅ Semantic HTML structure 