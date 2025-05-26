import { ReactNode } from "react";
import { ComboboxItemProp } from "./combobox-item";

export interface BaseComboboxProps {
    suggestions: ComboboxItemProp[];
    startElement?: ReactNode | string
    placeholder?: string
    defaultOpen?: boolean
}