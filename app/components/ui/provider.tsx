"use client"

import { ChakraProvider, createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

const customConfig = defineConfig({
  globalCss: {
  '&::-webkit-scrollbar': {
      width: '8px',
      },
      '&::-webkit-scrollbar-thumb': {
      background: 'rgba(100, 100, 100, 0.5)',
      borderRadius: '8px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
      background: 'rgba(100, 100, 100, 1)',
      },
  // react-resizable-panels sets an inline overflow: hidden on the group and panels. Below md the
  // page scrolls the window, so let sticky headers inside the content panel stick to it.
  '.main-panel-group, .main-content-panel': {
    mdDown: {
      overflow: 'visible !important',
      // overflow: hidden was also what stopped this flex item growing to its widest child
      minWidth: 0,
    },
  },
  },
})

const system = createSystem(defaultConfig, customConfig)

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
