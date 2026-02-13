"use client"

import {
  Button,
  Menu,
  Portal,
} from "@chakra-ui/react"

// import BookmarkIcon from "~/components/user-actions/watchlist/displays/bookmark-icon"
import { HiDotsHorizontal } from "react-icons/hi";
import { BsDashCircleDotted } from "react-icons/bs";
import RemovePlainText from "~/components/user-actions/watchlist/displays/remove-plain-text";
import { WatchlistItemInterface } from "~/interfaces/watchlist";

export const MenuActions = ({ item, watchlistId, isDefault, inDialog=false }: {item: WatchlistItemInterface, watchlistId: string, isDefault: boolean, inDialog: boolean }) => {

  return inDialog ? (
    <Menu.Root positioning={{ strategy: "fixed", hideWhenDetached: true }}>
      <Menu.Trigger asChild>
        <Button variant="outline" size="sm">
          <HiDotsHorizontal />
        </Button>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          <Menu.Item value="remove"><RemovePlainText watchlistId={watchlistId} movieId={item.movie.id} isDefault={isDefault}/></Menu.Item>
          <Menu.Item value="watched"><BsDashCircleDotted color="red" /> Watched</Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  ) : (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="outline" size="sm">
          <HiDotsHorizontal />
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="remove"><RemovePlainText watchlistId={watchlistId} movieId={item.movie.id} isDefault={isDefault}/></Menu.Item>
            <Menu.Item value="watched"><BsDashCircleDotted color="red" /> Watched</Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
