import { Flex, Input, Button } from "@chakra-ui/react";
import { Form, useFetcher } from "@remix-run/react";
import { useState } from "react";


const SearchInput = ({ fetcher }: { fetcher: ReturnType<typeof useFetcher> } ) => {

  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetcher.submit({ query }, { method: "post" });
  };
  return (
    <>
      <Form method="get" action="/" onSubmit={handleSubmit}>
        <Flex gap={4}>
          <Input name="search" placeholder="What movie can I help you find..." variant="subtle" colorPalette="orange" onChange={(e) => setQuery(e.target.value)}/>
          <Button type="submit">Search</Button>
        </Flex>
      </Form>
    </>
  );
};

export default SearchInput;