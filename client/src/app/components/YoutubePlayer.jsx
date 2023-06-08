"use client";
import React, { useState } from 'react';

const VideoPlayer = () => {
  const [videoSource, setVideoSource] = useState('/video.mp4');
  const [selectedQuality, setSelectedQuality] = useState('720p');

  const handleQualityChange = (event) => {
    const newQuality = event.target.value;
    // Load the video source with the selected quality
    setVideoSource(`/path/to/video_${newQuality}.mp4`);
    setSelectedQuality(newQuality);
  };

  return (
    <div>
      <video controls src={videoSource} />
      <div>
        <button>Play</button>
        <button>Pause</button>
        <input type="range" min="0" max="1" step="0.1" />
        <select value={selectedQuality} onChange={handleQualityChange}>
          <option value="720p">720p</option>
          <option value="480p">480p</option>
          <option value="360p">360p</option>
        </select>
      </div>
    </div>
  );
};

export default VideoPlayer;
