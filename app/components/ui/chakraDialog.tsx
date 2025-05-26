import { Button } from "@chakra-ui/react"
import { DialogRoot, DialogTrigger, DialogContent,  DialogBody } from './dialog'
import { ReactNode } from "react"

export const ChakraDialog = ({children, trigger}: {children: ReactNode, trigger: ReactNode}) => {
  return (
    <DialogRoot size="cover" placement="center" motionPreset="slide-in-bottom">
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          { trigger }
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogBody>
            { children }
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  )
}