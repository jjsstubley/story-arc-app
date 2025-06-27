import { useNavigate } from "@remix-run/react";
import { Text, Box, Button } from "@chakra-ui/react"
import { FaLongArrowAltLeft } from "react-icons/fa";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate(-1)} variant="ghost">
      <Box display="flex" gap={2} alignItems="center" cursor="pointer"><FaLongArrowAltLeft /><Text color="white">Go Back</Text></Box>
    </Button>
  );
}