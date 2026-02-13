import { Heading } from "@chakra-ui/react"

export default function ArkHeader({fontSize, children, as = 'h1'}: {fontSize: string, children: React.ReactNode, as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'}) {

  return (
    <Heading 
      as={as}
      fontSize={fontSize} 
      fontWeight="bold" 
      fontFamily="'Epilogue', sans-serif"
      letterSpacing="widest"
      textTransform="uppercase"
      color="white"
      textShadow="2px 2px 4px rgba(0,0,0,0.7)"
      borderLeft="4px solid"
      borderColor="orange.400"
      pl={3}
    >
      {children}
    </Heading>
  );
}