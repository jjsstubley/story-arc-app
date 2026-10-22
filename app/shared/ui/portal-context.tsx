import { createContext, useContext, type ReactNode } from "react";

const InsideModalContext = createContext(false);

/**
 * Wrap the contents of a modal Dialog/Drawer whose children were written to
 * be used outside one (e.g. nav sections reused in a bottom sheet). A modal
 * blocks interaction with portalled content, so popups inside render inline.
 */
export function InsideModal({ children }: { children: ReactNode }) {
  return <InsideModalContext.Provider value={true}>{children}</InsideModalContext.Provider>;
}

/** Whether a Select/Menu/Combobox should portal its positioner. An explicit prop wins over the context. */
export function usePortalled(explicit?: boolean): boolean {
  const insideModal = useContext(InsideModalContext);
  return explicit ?? !insideModal;
}
