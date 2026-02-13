import { Box, Card, Image, Text } from '@chakra-ui/react';
import { IoIosPerson } from "react-icons/io";
import { CastInterface } from '~/interfaces/tmdb/people/cast';
import { CrewInterface } from '~/interfaces/tmdb/people/crew';

const CreditProfile = ({item , role} : { item: CastInterface | CrewInterface, role: string }) => {
    return (
        <Box>
            <Card.Root width="100%">
                <Card.Body gap="2" p={0} overflow="hidden" rounded="md" border="1px solid transparent" 
                    _hover={{
                        border: "1px solid white"
                    }}
                >
                    <Box position="relative" width="100%" height="100%">
                        {
                            item.profile_path ? (
                                <Image 
                                    src={`https://image.tmdb.org/t/p/original/${item.profile_path}`}
                                    width="100%" 
                                    height="100%" 
                                    objectFit="cover" 
                                    filter= 'grayscale(100%)'
                                    _hover={{
                        
                                    cursor: "pointer",
                                    filter: 'grayscale(0%)'
                                    }}
                                    alt=""/>
                            ) : (
                                <Box width="100%" height="100%" aspectRatio={2 / 3} display="flex" alignItems="flex-start" justifyContent="center" bg="gray.700">
                                    <IoIosPerson size="xl"/>
                                </Box>
                            )
                        }
                        <Box
                            position="absolute"
                            bottom="0"
                            left="0"
                            width="100%"
                            bgGradient="to-t" gradientFrom="blackAlpha.800" gradientTo="transparent" gradientVia="blackAlpha.800"
                            color="white"
                            p={4}
                            ><Text fontSize="xs">{role}</Text></Box>
                    </Box>

                </Card.Body>
            </Card.Root>
            {/* <Box width="100%" color="white" pt={4}>
                {item.name}
            </Box> */}
        </Box>
    );
};

export default CreditProfile;