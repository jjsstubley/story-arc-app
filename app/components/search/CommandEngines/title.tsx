import { AsyncMultipleCombobox } from "~/components/ui/combobox/async-multiple";
import { Box } from "@chakra-ui/react";

const TitleCommandEngine = () => {

  function handleOnSubmit() { 
    console.log('clicked')
  }

  return (
    <AsyncMultipleCombobox suggestions={[]} onSelect={handleOnSubmit} startElement="" fetchUrl="/api/titles" placeholder="Title" defaultOpen={false}>
      {(item) => {
        return (
          <Box display="flex" justifyItems="space-between" width="100%" alignItems="center">
            <Box
              p={2}
              display="flex"
              flexDirection="column"
              rounded="md"
              width="100%"
              color="white"
              cursor="pointer"
            >
              <strong>{item.name}</strong>
            </Box>
          </Box>
        )
      }}
    </AsyncMultipleCombobox>
  );
};

export default TitleCommandEngine;