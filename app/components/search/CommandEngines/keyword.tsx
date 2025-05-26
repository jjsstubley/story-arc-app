import { Combobox } from "@chakra-ui/react";
import ConditionCommandEngine from "./condition";

type ExtendedValueChangeDetails = Combobox.ValueChangeDetails & {
  conditions: Record<string, string>;
};

const KeywordCommandEngine = ({ onSelect }: { onSelect: (details: ExtendedValueChangeDetails | null) => void }) => {

  return (
    <ConditionCommandEngine suggestions={[]} onSelect={onSelect} startElement="with_keywords" fetchUrl="/resources/keywords" async={true}/>
  );
};

export default KeywordCommandEngine;