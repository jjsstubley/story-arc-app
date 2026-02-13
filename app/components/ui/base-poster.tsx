import { Box, Card, Icon, Image } from '@chakra-ui/react';
import { BsFilm } from "react-icons/bs";

const BasePoster = ({file, title, cardProps, aspectRatio = 2 / 3, icon = BsFilm, placeholderBg } : { file: string, title: string, cardProps?: React.ComponentProps<typeof Card.Root>; aspectRatio?: number; icon?: React.ElementType; placeholderBg?: string; }) => {
    return (
        <Card.Root width="100%" aspectRatio={aspectRatio}>
            <Card.Body 
                position="relative"
                width="100%"
                height="100%"
                aspectRatio={aspectRatio}
                gap="2" 
                p={0} 
                overflow="hidden" 
                rounded="md" 
                border="1px solid transparent" 
                _hover={{
                    border: "1px solid white",
                    cursor: "pointer",
                }}
                {...cardProps}
            >
                {
                    file ? (
                        <Image 
                            src={`https://image.tmdb.org/t/p/w300/${file}`}
                            width="100%" 
                            height="100%" 
                            aspectRatio={aspectRatio}
                            objectFit="cover" 
                            alt={title}/>
                    ) : (
                        <Box width="100%" height="100%" p={12} aspectRatio={aspectRatio} display="flex" alignItems="flex-start" justifyContent="center" bg={placeholderBg || "gray.700"}>
                            <Icon as={icon} size="xl"/>
                        </Box>
                    )
                }
            </Card.Body>
        </Card.Root>
    );
};

export default BasePoster;
