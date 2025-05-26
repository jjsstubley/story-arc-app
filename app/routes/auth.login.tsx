import { redirect, type MetaFunction } from "@remix-run/node";
import { Container } from "@chakra-ui/react"

export const loader = async ({ request }: { request: Request }) => {
  const { user } = await request.json();
  if (!user) return redirect("/auth/login");
  return Response.json({ user });
};

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <Container>
      You are logged out !!
    </Container>
  );
}
