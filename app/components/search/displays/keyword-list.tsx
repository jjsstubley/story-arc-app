"use client"

import {
  Badge,
  Box,
} from "@chakra-ui/react"

import { Link } from "@remix-run/react"
import { KeywordItemInterface } from "~/interfaces/tmdb/keywords"
import { slugify } from "~/utils/helpers"
// import BookmarkIcon from "~/components/user-actions/watchlist/displays/bookmark-icon"

export const Keywordlist = ({ items }: {items: KeywordItemInterface[] }) => {

  return (
    <Box display="flex" gap={2} flexWrap="wrap">   
        {
            items.map((item, index) => (
                <Link to={`/tags/${slugify(item.name)}?id=${item.id}`} key={index}>
                    <Badge size="md" colorPalette="red"> {item.name} </Badge>
                </Link>
            ))
        }
    </Box>
  )
}