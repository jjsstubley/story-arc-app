import { Checkbox } from "@chakra-ui/react";
import { CheckedChangeDetails } from "node_modules/@chakra-ui/react/dist/types/components/checkbox/namespace";

interface TableCheckboxProps {
  checked: boolean | "indeterminate";
  onCheckedChange: (details: CheckedChangeDetails) => void;
  ariaLabel?: string;
  size?: "sm" | "md" | "lg";
}

export function TableCheckbox({ 
  checked, 
  onCheckedChange, 
  ariaLabel = "Select item",
  size = "sm"
}: TableCheckboxProps) {
  return (
    <Checkbox.Root
      size={size}
      top="0.5"
      aria-label={ariaLabel}
      checked={checked}
      onCheckedChange={onCheckedChange}
    >
      <Checkbox.HiddenInput />
      <Checkbox.Control />
    </Checkbox.Root>
  );
}