// Example usage of UserAccountDropdown component
// Replace the existing menu in app/routes/_layout/route.tsx

import { UserAccountDropdown, type User } from "./user-account-dropdown"
import { Box } from "@chakra-ui/react"
import { ColorModeButton } from "~/components/ui/color-mode"
import GoogleSignIn from "~/components/googleSignIn"

interface LayoutHeaderProps {
  session: { user?: { id: string; email?: string; user_metadata?: { full_name?: string; avatar_url?: string } } } | null
  onSignOut?: () => void
}

export function LayoutHeader({ session, onSignOut }: LayoutHeaderProps) {
  // Transform session data to match User interface
  const user: User | null = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    user_metadata: session.user.user_metadata
  } : null

  return (
    <Box display="flex" justifyContent="space-between" gap={4}>
      <ColorModeButton />
      {!session ? (
        <GoogleSignIn />
      ) : (
        <UserAccountDropdown 
          user={user} 
          onSignOut={onSignOut}
        />
      )}
    </Box>
  )
} 