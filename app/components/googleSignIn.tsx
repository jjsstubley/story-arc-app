import { Button } from "@chakra-ui/react";
import { Form } from "@remix-run/react";

export default function GoogleSignIn() {
    return (
      <Form method="get" action="/auth">
        <Button type="submit">Log in</Button>
      </Form>
    );
}