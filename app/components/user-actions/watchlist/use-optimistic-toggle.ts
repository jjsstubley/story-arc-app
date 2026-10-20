import { useCallback, useRef, useState } from "react";
import { toaster } from "~/components/ui/toaster";

/**
 * Flips `selected` immediately, runs the request in the background, and
 * rolls back with an error toast if the request fails.
 */
export function useOptimisticToggle(label: string) {
    const [selected, setSelectedState] = useState<boolean>(false);
    const selectedRef = useRef(false);
    const pendingRef = useRef(false);

    const setSelected = useCallback((value: boolean) => {
        selectedRef.current = value;
        setSelectedState(value);
    }, []);

    const toggle = useCallback(async (
        request: (wasSelected: boolean) => Promise<boolean>,
        onChange?: (next: boolean) => void,
    ): Promise<boolean> => {
        // Ignore clicks while a request is in flight so rollbacks stay consistent
        if (pendingRef.current) return false;
        pendingRef.current = true;

        const wasSelected = selectedRef.current;
        setSelected(!wasSelected);
        onChange?.(!wasSelected);

        try {
            const ok = await request(wasSelected);
            if (!ok) {
                setSelected(wasSelected);
                onChange?.(wasSelected);
                toaster.create({
                    type: "error",
                    title: `Couldn't ${wasSelected ? "remove from" : "add to"} ${label}`,
                    description: "Something went wrong. Please try again.",
                    closable: true,
                });
            }
            return ok;
        } finally {
            pendingRef.current = false;
        }
    }, [label, setSelected]);

    return { selected, setSelected, toggle };
}
