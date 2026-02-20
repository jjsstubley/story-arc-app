import { Box, Icon } from '@chakra-ui/react';
import { BsFilm, BsBuilding, BsCollection, BsCameraReels } from "react-icons/bs";
import { IoIosPerson } from 'react-icons/io';

type PlaceholderType = 'company' | 'collection' | 'movie' | 'person';

interface CinematicPlaceholderProps {
  type: PlaceholderType;
  title?: string;
  aspectRatio?: number;
}

const CinematicPlaceholder = ({ type, title, aspectRatio = 2 / 3 }: CinematicPlaceholderProps) => {
  const getIcon = () => {
    switch (type) {
      case 'company':
        return BsBuilding;
      case 'collection':
        return BsCollection;
      case 'movie':
        return BsFilm;
      case 'person':
        return IoIosPerson;
      default:
        return BsFilm;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'company':
        return 'linear-gradient(135deg, rgba(45, 55, 72, 0.8) 0%, rgba(26, 32, 44, 0.9) 50%, rgba(17, 24, 39, 1) 100%)';
      case 'collection':
        return 'linear-gradient(135deg, rgba(68, 64, 60, 0.8) 0%, rgba(41, 37, 36, 0.9) 50%, rgba(28, 25, 23, 1) 100%)';
      case 'movie':
        return 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(2, 6, 23, 1) 100%)';
      case 'person':
        return 'linear-gradient(135deg, rgba(55, 48, 163, 0.6) 0%, rgba(30, 27, 75, 0.8) 50%, rgba(17, 24, 39, 1) 100%)';
      default:
        return 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(2, 6, 23, 1) 100%)';
    }
  };

  const getPattern = () => {
    if (type === 'collection') {
      return {
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(255, 255, 255, 0.03) 10px,
          rgba(255, 255, 255, 0.03) 20px
        )`,
      };
    }
    if (type === 'movie') {
      return {
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255, 165, 0, 0.1) 0%, transparent 50%),
                          radial-gradient(circle at 80% 80%, rgba(255, 165, 0, 0.05) 0%, transparent 50%)`,
      };
    }
    return {};
  };

  const IconComponent = getIcon();

  return (
    <Box
      width="100%"
      height="100%"
      aspectRatio={aspectRatio}
      position="relative"
      overflow="hidden"
      rounded="md"
      bgGradient={getGradient()}
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        ...getPattern(),
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
          animation: 'pulse 3s ease-in-out infinite',
        },
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 0.3,
          },
          '50%': {
            opacity: 0.6,
          },
        },
      }}
    >
      <Box
        position="relative"
        zIndex={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={2}
      >
        <Icon
          as={IconComponent}
          size="3xl"
          color="whiteAlpha.400"
          sx={{
            filter: 'drop-shadow(0 0 8px rgba(255, 165, 0, 0.3))',
            animation: 'shimmer 2s ease-in-out infinite',
            '@keyframes shimmer': {
              '0%, 100%': {
                opacity: 0.4,
              },
              '50%': {
                opacity: 0.7,
              },
            },
          }}
        />
        {type === 'collection' && (
          <Box
            position="absolute"
            top="20%"
            left="10%"
            width="60%"
            height="2px"
            bg="whiteAlpha.200"
            sx={{
              transform: 'rotate(-45deg)',
              boxShadow: '0 0 4px rgba(255, 165, 0, 0.3)',
            }}
          />
        )}
        {type === 'movie' && (
          <>
            <Box
              position="absolute"
              top="15%"
              left="15%"
              width="70%"
              height="1px"
              bg="whiteAlpha.100"
              sx={{
                transform: 'rotate(-30deg)',
              }}
            />
            <Box
              position="absolute"
              bottom="15%"
              right="15%"
              width="70%"
              height="1px"
              bg="whiteAlpha.100"
              sx={{
                transform: 'rotate(30deg)',
              }}
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default CinematicPlaceholder;



