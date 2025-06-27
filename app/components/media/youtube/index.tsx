import "./styles.css";


export const YouTubeEmbed = ({ url } : {url: string}) => {

    return (
        <div className="youtube-embed-container">
            <iframe
                width="100%"
                height="400"
                src={`https://www.youtube.com/embed/${url}?mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&`}
                title="YouTube video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
    );
};