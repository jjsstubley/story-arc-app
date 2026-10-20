import { useState, useEffect } from 'react';

import { CustomDialog } from '../../../custom-dialog';
import { useSuggestionStream } from '~/hooks/use-suggestion-stream';
import SuggestionsDialogHeader from './suggestions-dialog-header';
import SuggestionsResults from '../results';


const SuggestionsDialog = ({stream, children} : { stream: ReturnType<typeof useSuggestionStream>, children: React.ReactNode;}) => {
    const [open, setOpen] = useState(false);
    const { status, title, error } = stream.state;

    // Open as soon as the stream starts returning (meta) or fails
    useEffect(() => {
        if (status !== "idle" && (title || error)) {
            setOpen(true);
        }
    }, [status, title, error]);

    return (
        <CustomDialog
            dialogProps={{
                open: open,
                onOpenChange: (e) => {
                    setOpen(e.open);
                    // Stop streaming when the dialog is closed
                    if (!e.open) stream.cancel();
                },
                size: 'cover',
                placement: "center",
                motionPreset: 'slide-in-bottom',
                scrollBehavior: 'outside',
            }}
            trigger={ children }
            header={ <SuggestionsDialogHeader query={stream.state.query} />}
            body={ <SuggestionsResults stream={stream} />}
        />
    );
};

export default SuggestionsDialog;
