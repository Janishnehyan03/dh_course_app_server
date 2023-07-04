"use client";
import ReactPlayer from "react-player";

const VideoPlayer = ({ videoId }) => {
  return (
    <div>
      <ReactPlayer
        url={`http://localhost:5000/stream/`}
        controls
        width="100%"
        height="auto"
      />
    </div>
  );
};

export default VideoPlayer;
