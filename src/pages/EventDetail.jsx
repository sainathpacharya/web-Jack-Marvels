import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import bgImage from '../assets/images/bg.jpg';

const eventVideos = {
  dance: [
    {
      title: 'Dance Performance 1',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: 'https://img.youtube.com/vi/7C2z4GqqS5E/mqdefault.jpg',
    },
    {
      title: 'Dance Performance 2',
      videoUrl: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
      thumbnail: 'https://img.youtube.com/vi/tgbNymZ7vqY/mqdefault.jpg',
    },
  ],
  singing: [
    {
      title: 'Singing Performance 1',
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      thumbnail: 'https://img.youtube.com/vi/2Vv-BfVoq4g/mqdefault.jpg',
    },
  ],
  games: [
    {
      title: 'Gaming Highlights',
      videoUrl: 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4',
      thumbnail: 'https://img.youtube.com/vi/LXb3EKWsInQ/mqdefault.jpg',
    },
  ],
};

function EventDetail() {
  const { id } = useParams();
  const videos = eventVideos[id] || [];
  const [selectedVideo, setSelectedVideo] = useState(null);

  return (
    <div className="min-h-screen bg-green-50 p-6 pt-28"   style={{
      backgroundImage: `url(${bgImage})`,
    }}>
      <h2 className="text-3xl font-bold text-green-700 mb-6 text-center capitalize">
        {id} Event Videos
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        {videos.map((video, index) => (
          <div
            key={index}
            onClick={() => setSelectedVideo(video)}
            className="cursor-pointer bg-white rounded-xl shadow hover:shadow-lg transition"
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-48 object-cover rounded-t-xl"
            />
            <div className="p-3 font-medium text-green-800 text-center">{video.title}</div>
          </div>
        ))}
      </div>

      {selectedVideo && (
        <div className="mt-10">
          <h3 className="text-2xl text-green-700 font-semibold mb-4 text-center">
            Now Playing: {selectedVideo.title}
          </h3>
          <div className="flex justify-center">
            <video
              controls
              className="rounded-lg w-full max-w-3xl shadow-lg"
              src={selectedVideo.videoUrl}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default EventDetail;
