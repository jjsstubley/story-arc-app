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
