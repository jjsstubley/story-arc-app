import { EmptyState, VStack } from "@chakra-ui/react";
import { MdAddTask } from "react-icons/md";


export default function EmptyWatchlist({title, description}: {title: string, description: string}) {
  return (
    <EmptyState.Root>
        <EmptyState.Content>
        <EmptyState.Indicator>
            <MdAddTask />
        </EmptyState.Indicator>
        <VStack textAlign="center">
            <EmptyState.Title>{title}</EmptyState.Title>
            <EmptyState.Description>
            {description}
            </EmptyState.Description>
        </VStack>
        </EmptyState.Content>
    </EmptyState.Root>
  )
}