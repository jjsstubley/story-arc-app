import { Avatar, Box, Card } from '@chakra-ui/react';
// import { Link, useLocation } from "@remix-run/react";
import { ReviewInterface } from '~/interfaces/tmdb/review';

const Review = ({item} : { item: ReviewInterface }) => {

    return (
        <Card.Root width="100%">
            <Card.Body gap="2" p={4}>
                <Box display="flex" gap={4} alignItems="center">
                    <Avatar.Root colorPalette="blue">
                        <Avatar.Fallback name="Random" />
                        <Avatar.Image src={item.author_details.avatar_path} />
                    </Avatar.Root>
                    <Box>
                        @{ item.author_details.username}
                    </Box>
                </Box>
                <Box lineClamp={5}>
                    {item.content}
                </Box>
            </Card.Body>
            {/* <Card.Footer>
                <Card.Title mt="2">Hello</Card.Title>
            </Card.Footer> */}
        </Card.Root>
    );
};

export default Review;