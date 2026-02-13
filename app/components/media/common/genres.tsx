import { Badge } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { GenreInterface } from "~/interfaces/tmdb/genre";

const Genres= ({genres} : { genres: GenreInterface[] }) => {

    return (
        <>
            {
                genres.map((item, index) => (
                    <Link to={`/genres/${item.name.toLowerCase()}`} key={index}>
                        <Badge size="md" colorPalette="orange"> {item.name} </Badge>
                    </Link>
                ))
            }
        </>
    );
};

export default Genres;