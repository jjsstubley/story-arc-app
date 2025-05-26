import React from 'react';
import { Card, Button, Avatar } from '@chakra-ui/react';

interface GoalCardProps {
    title: string;
    description: string;
}

const GoalCard: React.FC<GoalCardProps> = ({ title, description, ...rest }) => {
    return (
        <Card.Root width="320px" {...rest}>
            <Card.Body gap="2">
                <Avatar.Root shape="rounded" size="lg">
                    <Avatar.Fallback name="Nue Camp" />
                    <Avatar.Image src="https://picsum.photos/200/300" />
                </Avatar.Root>
                <Card.Title mt="2">{title}</Card.Title>
                <Card.Description>{description}</Card.Description>
            </Card.Body>
            <Card.Footer justifyContent="flex-end">
                <Button variant="outline">View</Button>
                <Button>Edit</Button>
            </Card.Footer>
        </Card.Root>
    );
};

export default GoalCard;