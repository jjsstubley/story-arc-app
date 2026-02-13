import { Button, Dialog, Portal, CloseButton } from '@chakra-ui/react'
import { LuPopcorn } from 'react-icons/lu'
import PopcornWatchlist from '~/components/watchlist/popcorn-watchlist';
import { WatchlistInterface } from "~/interfaces/watchlist";


export default function PopcornDialog({watchlists}: {watchlists: WatchlistInterface[]}) {
    function formatTimeRemaining(ms: number): string {
        const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        
        const days = Math.floor(ms / (24 * 60 * 60 * 1000));
        const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
        
        // Automatically pick the largest non-zero unit
        if (days > 0) return formatter.format(days, 'day');
        if (hours > 0) return formatter.format(hours, 'hour');
        if (minutes > 0) return formatter.format(minutes, 'minute');
        
        return 'Less than 1 minute';
    }
    function getPopcornExpiry() {
        const popcornWatchlist = watchlists.length > 0 ? watchlists.find((watchlist) => watchlist.id === "popcorn") : null 
        if (!popcornWatchlist) {
            return '(Expired)'
        }
        const expiresAt = new Date(popcornWatchlist.updated_at).getTime() + (2 * 24 * 60 * 60 * 1000)
        const now = Date.now();
        const remainingMs = expiresAt - now;
        if (remainingMs <= 0) {
            return 'Expired';
        }
    
        return `(Expires ${formatTimeRemaining(remainingMs)})`
    }

  return (
    <Dialog.Root size="lg" motionPreset="slide-in-bottom">
      <Dialog.Trigger asChild>
        <Button position="fixed" variant="outline" bgColor="orange.700/50" colorScheme="orange" bottom={10} right={20} borderRadius="full"  boxShadow="lg" zIndex={1000} onClick={() => {
            console.log('Test')
          }}>
            <LuPopcorn color="whiteAlpha.600" />
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header flexDirection="column" gap={2}>
              <Dialog.Title>Popcorn watchlist</Dialog.Title>
              <Dialog.Description>A quick list of movies you&apos;re in the mood to watch — perfect for tonight&apos;s lineup. {getPopcornExpiry()}</Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <PopcornWatchlist watchlist={watchlists.find((watchlist) => watchlist.id === "popcorn") || null} />
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button>Save</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}