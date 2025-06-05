import { Combobox } from "@chakra-ui/react";

export type ExtendedValueChangeDetails = Combobox.ValueChangeDetails & {
    conditions: Record<string, string>;
};