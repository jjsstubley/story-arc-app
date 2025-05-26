import { useNavigate } from "@remix-run/react";
import { Text, Box } from "@chakra-ui/react"
import { FaLongArrowAltLeft } from "react-icons/fa";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(-1)}>
      <Box display="flex" gap={2} alignItems="center" cursor="pointer"><FaLongArrowAltLeft /><Text color="white">Go Back</Text></Box>
    </button>
  );
}