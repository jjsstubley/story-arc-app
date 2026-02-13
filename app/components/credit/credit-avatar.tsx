import { Box, Image, Text } from '@chakra-ui/react';
import { IoIosPerson } from 'react-icons/io';
import { PersonSummaryForInterface } from '~/interfaces/tmdb/people/summary';
const CreditAvatar = ({item} : { item: PersonSummaryForInterface }) => {
    return (
        // <MovieDialog item={item}>
            <Box rounded="full" width="120px">
                {
                    item.profile_path ? (
                        <Image 
                            src={`https://image.tmdb.org/t/p/w300/${item.profile_path}`}
                            width="100%" 
                            height="120px" 
                            rounded="full"
                            
                            objectFit="cover" 
                            transition="transform 0.3s ease"
                            filter='grayscale(100%)'
                            border="1px solid transparent"
                            _hover={{
                                border: "1px solid orange",
                                filter: 'grayscale(0%)',
                                cursor: "pointer",
                            }}
                            alt={item.name}/>
                    ) : (
                        <Box width="100%" height="100%" rounded="full" p={4} display="flex" alignItems="flex-start" justifyContent="center" bg="gray.700">
                            <IoIosPerson size="xl"/>
                        </Box>
                    )
                }
                <Box width="100%" color="white" pt={2} textAlign="left">
                    <Text fontSize="xs" color="whiteAlpha.600">{item.name}</Text>
                </Box>
            </Box>
        // </MovieDialog>
    );
};

export default CreditAvatar;