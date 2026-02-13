import { Badge, Box } from "@chakra-ui/react";
import { SiFireship } from "react-icons/si";
import { GiSmallFire, GiThunderStruck } from "react-icons/gi";
import { PiShootingStarDuotone } from "react-icons/pi";

const PopularityIndex= ({score} : { score: number}) => {

    function getScore(value: number) {
        if (value >= 1000) {
            return <Badge colorPalette="red" size="lg"><GiSmallFire color="red.500" />Ultra-Hot</Badge>;
        } else if (value >= 500) {
            return <Badge colorPalette="orange" size="lg"><PiShootingStarDuotone color="orange.500" />Popular</Badge>;
        } else if (value >= 250) {
            return <Badge colorPalette="green" size="lg"><SiFireship color="green.500" />Hot</Badge>;
        } else if (value >= 100) {
            return <Badge colorPalette="yellow" size="lg"><GiThunderStruck color="yellow.500" />Buzzwothry</Badge>;
        } else {
            return '';
        }
    }

    return (
        <Box display="flex" gap={2} alignItems="center">
            {getScore(score)}
        </Box>
    );
};

export default PopularityIndex;