import { Dialog, Portal, Box, Text, Stack, Spinner } from '@chakra-ui/react'
import { Form, useSubmit } from '@remix-run/react'
import { useEffect } from 'react'
import { LuLogOut } from 'react-icons/lu'

interface SignOutDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  userName?: string
}

export default function SignOutDialog({ isOpen, onOpenChange, userName }: SignOutDialogProps) {
  const submit = useSubmit()

  useEffect(() => {
    if (isOpen) {
      // Automatically submit the logout form when dialog opens
      const form = document.createElement('form')
      form.method = 'post'
      form.action = '/auth/logout'
      document.body.appendChild(form)
      submit(form, { method: 'post' })
      document.body.removeChild(form)
    }
  }, [isOpen, submit])

  return (
    <Dialog.Root open={isOpen} onOpenChange={() => {}} size="sm" motionPreset="slide-in-bottom" closeOnInteractOutside={false} closeOnEscape={false}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header flexDirection="column" gap={2}>
              <Dialog.Title>Signing out</Dialog.Title>
              <Dialog.Description>
                {userName 
                  ? `Signing out ${userName}...`
                  : 'Signing out...'}
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4} alignItems="center" py={4}>
                <Spinner size="xl" color="orange.500" />
                <Text fontSize="sm" color="fg.muted" textAlign="center">
                  Please wait while we sign you out.
                </Text>
              </Stack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

