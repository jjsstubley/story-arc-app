import { useState } from 'react';

import { CustomDialog } from '../../custom-dialog';
import {  SuggestionsDataInterface } from '~/interfaces/suggestions';
import Suggestions from '../suggestions';
import { useFetcher } from '@remix-run/react';
import SuggestionsDialogHeader from './suggestions-dialog-header';


const SuggestionsDialog = ({fetcher, query, children} : { fetcher: ReturnType<typeof useFetcher<SuggestionsDataInterface>>, query: string, children: React.ReactNode;}) => {
    // const location = useLocation();
    const [open, setOpen] = useState(false);

    return (
        <CustomDialog 
            dialogProps={{
                open: open,
                onOpenChange: (e) => setOpen(e.open),
                size: 'cover',
                placement: "center",
                motionPreset: 'slide-in-bottom',
                scrollBehavior: 'outside',
            }}
            trigger={ children }
            header={ <SuggestionsDialogHeader query={query} />}
            body={ <Suggestions fetcher={fetcher}/>}
        />
    );
};

export default SuggestionsDialog;