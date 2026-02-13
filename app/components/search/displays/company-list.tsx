"use client"

import { Box } from "@chakra-ui/react"
import BasePoster from "~/components/ui/base-poster"
import { ReusableTable } from "~/components/ui/table/resuable-table"
import { CompanyInterface } from "~/interfaces/tmdb/company"
import { BsBuilding } from "react-icons/bs"
// import BookmarkIcon from "~/components/user-actions/watchlist/displays/bookmark-icon"

export const Companylist = ({ items }: {items: CompanyInterface[] }) => {

  const columns = [
    { key: "poster", header: "", width: 100, render: (item: CompanyInterface) =>  <Box width={10}><BasePoster file={item.logo_path} title={item.name} aspectRatio={1 / 1} icon={BsBuilding} /></Box> },
    { key: "name", header: "Company", width: 100, render: (item: CompanyInterface) => item.name },
  ]

  return (
    <ReusableTable
      data={items}
      columns={columns}

    />
  )
}
