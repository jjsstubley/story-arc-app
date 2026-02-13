import { Badge } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { slugify } from "~/utils/helpers";
import { KeywordItemInterface } from "~/interfaces/tmdb/keywords";

const Keywords= ({keywords} : { keywords: KeywordItemInterface[] }) => {

    return (
        <>
            {
                keywords.map((item, index) => (
                    <Link to={`/tags/${slugify(item.name)}?id=${item.id}`} key={index}>
                        <Badge size="md" colorPalette="red"> {item.name} </Badge>
                    </Link>
                ))
            }
        </>
    );
};

export default Keywords;