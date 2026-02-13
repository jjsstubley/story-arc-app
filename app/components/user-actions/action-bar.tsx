"use client"

import {
  ActionBar,
  Button,
  Kbd,
  Portal,
} from "@chakra-ui/react"

export const DefaultActionBar = ({ selection }: {selection: string[]}) => {

  const hasSelection = selection.length > 0

  return (
    <ActionBar.Root open={hasSelection}>
        <Portal>
        <ActionBar.Positioner>
            <ActionBar.Content>
            <ActionBar.SelectionTrigger>
                {selection.length} selected
            </ActionBar.SelectionTrigger>
            <ActionBar.Separator />
            <Button variant="outline" size="sm">
                Delete <Kbd>⌫</Kbd>
            </Button>
            <Button variant="outline" size="sm">
                Share <Kbd>T</Kbd>
            </Button>
            </ActionBar.Content>
        </ActionBar.Positioner>
        </Portal>
    </ActionBar.Root>
  )
}