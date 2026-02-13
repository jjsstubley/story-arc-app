import { Box } from "@chakra-ui/react";
import InfoPanelTrailer from "../trailer";
import { VideoItemInterface } from "~/interfaces/tmdb/videos";


const TrailersSection = ({videos} : { videos: VideoItemInterface[] }) => {

    return (
      <Box padding={0} margin={0} pl={4} borderLeft="1px solid" borderColor="gray.700">
          <Box display="flex" flexDirection="column" gap={2}>
          {
             videos.filter((i) => !!(i.official )).map((item, i) => (
                  item.site === 'YouTube' && <InfoPanelTrailer key={i} trailer={item} />
              ))
          }
          </Box>
      </Box>
    );
};

export default TrailersSection;