import { Button, Box } from '@chakra-ui/react'
import AuthDialog from './auth-dialog'

export default function AuthButtons() {
  return (
    <Box display="flex" gap={2}>
      <AuthDialog mode="signin" trigger={
        <Button variant="outline" size="sm">
          Login
        </Button>
      } />
      <AuthDialog mode="signup" trigger={
        <Button variant="solid" size="sm">
          Create Account
        </Button>
      } />
    </Box>
  )
}

