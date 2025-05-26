import { Combobox } from "@chakra-ui/react";
import ConditionCommandEngine from "./condition";

type ExtendedValueChangeDetails = Combobox.ValueChangeDetails & {
  conditions: Record<string, string>;
};

const CastCommandEngine = ({ onSelect }: { onSelect: (details: ExtendedValueChangeDetails | null) => void }) => {

  return (
    <ConditionCommandEngine suggestions={[]} onSelect={onSelect} startElement="with_cast" fetchUrl="/resources/cast" async={true}/>
  );
};

export default CastCommandEngine;