import ConditionCommandEngine from "./condition";
import { ExtendedValueChangeDetails } from "./interfaces/ExtendedValueChangeDetails";

const GlobalCastCommandEngine = ({ onSelect }: { onSelect: (details: ExtendedValueChangeDetails | null) => void }) => {

  return (
    <ConditionCommandEngine 
      suggestions={[]} 
      onSelect={onSelect} 
      startElement="with_cast" 
      fetchUrl="/api/cast" 
      async={true} 
      defaultOpen={true}
    />
  );
};

export default GlobalCastCommandEngine;