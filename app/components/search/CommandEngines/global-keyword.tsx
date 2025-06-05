import ConditionCommandEngine from "./condition";
import { ExtendedValueChangeDetails } from "./interfaces/ExtendedValueChangeDetails";

const GlobalKeywordCommandEngine = ({ onSelect }: { onSelect: (details: ExtendedValueChangeDetails | null) => void }) => {

  return (
    <ConditionCommandEngine 
      suggestions={[]} 
      onSelect={onSelect} 
      startElement="Add Keywords" 
      fetchUrl="/api/keywords" 
      async={true} 
      addButton={true} 
      defaultOpen={true}
    />
  );
};

export default GlobalKeywordCommandEngine;