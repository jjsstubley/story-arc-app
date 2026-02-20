import { Box } from "@chakra-ui/react";
import { getGradientColor } from "~/utils/helpers/gradient-colors";

interface BlurredPlaceholderProps {
  seed?: string;
  height?: string;
}

const BlurredPlaceholder = ({ seed = "default", height = "100px" }: BlurredPlaceholderProps) => {
  const gradientColor = getGradientColor(seed);
  const lighterColor = gradientColor.replace('.900', '.800');
  
  return (
    <Box
      position="relative"
      width="100%"
      height={height}
      overflow="hidden"
      bgGradient="to-br"
      gradientFrom={gradientColor}
      gradientTo={lighterColor}
      filter="blur(8px)"
      opacity={0.6}
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255, 255, 255, 0.02) 10px,
            rgba(255, 255, 255, 0.02) 20px
          )
        `,
      }}
    />
  );
};

export default BlurredPlaceholder;

