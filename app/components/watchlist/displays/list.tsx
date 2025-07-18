"use client"

import {
  ActionBar,
  Button,
  Checkbox,
  Kbd,
  Portal,
  Table,
} from "@chakra-ui/react"
import { useState } from "react"
import MoviePosterList from "~/components/movie/previews/poster-list"
import { WatchlistInterface } from "~/interfaces/watchlist"

export const WatchlistTable = ({ watchlist }: {watchlist: WatchlistInterface}) => {
  const [selection, setSelection] = useState<string[]>([])

  const hasSelection = selection.length > 0
  const indeterminate = hasSelection && selection.length < watchlist.watchlist_items.length

  const rows = watchlist.watchlist_items.map((item) => (
    <Table.Row
      key={item.id}
      data-selected={selection.includes(item.id) ? "" : undefined}
    >
        <Table.Cell>
            <Checkbox.Root
            size="sm"
            top="0.5"
            aria-label="Select row"
            checked={selection.includes(item.id)}
            onCheckedChange={(changes) => {
                setSelection((prev) =>
                changes.checked
                    ? [...prev, item.id]
                    : selection.filter((id) => id!== item.id),
                )
            }}
            >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            </Checkbox.Root>
        </Table.Cell>
        <Table.Cell>
            <MoviePosterList item={item.movie} />
        </Table.Cell>
        <Table.Cell>{watchlist.name}</Table.Cell>
        <Table.Cell>{item.added_at}</Table.Cell>
    </Table.Row>
  ))

  return (
    <>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="6">
              <Checkbox.Root
                size="sm"
                top="0.5"
                aria-label="Select all rows"
                checked={indeterminate ? "indeterminate" : selection.length > 0}
                onCheckedChange={(changes) => {
                  setSelection(
                    changes.checked ? watchlist.watchlist_items.map((item) => item.id) : [],
                  )
                }}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
              </Checkbox.Root>
            </Table.ColumnHeader>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Watchlist</Table.ColumnHeader>
            <Table.ColumnHeader>Date added</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>{rows}</Table.Body>
      </Table.Root>

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
    </>
  )
}

// const items = [
//   { id: 1, name: "Laptop", category: "Electronics", price: 999.99 },
//   { id: 2, name: "Coffee Maker", category: "Home Appliances", price: 49.99 },
//   { id: 3, name: "Desk Chair", category: "Furniture", price: 150.0 },
//   { id: 4, name: "Smartphone", category: "Electronics", price: 799.99 },
//   { id: 5, name: "Headphones", category: "Accessories", price: 199.99 },
// ]
