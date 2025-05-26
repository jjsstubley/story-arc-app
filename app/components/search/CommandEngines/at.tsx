import { Combobox } from "@chakra-ui/react";
import ConditionCommandEngine from "./condition";

type ExtendedValueChangeDetails = Combobox.ValueChangeDetails & {
  conditions: Record<string, string>;
};

const AtCommandEngine = ({ onSelect }: { onSelect: (details: ExtendedValueChangeDetails | null) => void }) => {

  return (
    <ConditionCommandEngine suggestions={[]} onSelect={onSelect} startElement="@" fetchUrl="/resources/keywords" async={true} grouped={true}/>
  );
};

export default AtCommandEngine;