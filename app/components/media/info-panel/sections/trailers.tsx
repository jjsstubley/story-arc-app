import { Box } from "@chakra-ui/react";
import InfoPanelTrailer from "../trailer";
import { VideoItemInterface } from "~/interfaces/tmdb/videos";


// Only official YouTube videos can be played in the panel.
export const getPlayableTrailers = (videos: VideoItemInterface[]) =>
    videos.filter((i) => i.official && i.site === 'YouTube');

const TrailersSection = ({videos} : { videos: VideoItemInterface[] }) => {

    return (
      <Box padding={0} margin={0} pl={4} borderLeft="1px solid" borderColor="gray.700">
          <Box display="flex" flexDirection="column" gap={2}>
          {
             getPlayableTrailers(videos).map((item) => (
                  <InfoPanelTrailer key={item.id} trailer={item} />
              ))
          }
          </Box>
      </Box>
    );
};

export default TrailersSection;