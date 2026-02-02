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
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div className="min-h-screen bg-green-50 p-6 pt-28"   style={{
      backgroundImage: `url(${bgImage})`,
    }}>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-green-700 text-center capitalize">
          {id} Event Videos
        </h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 text-sm font-medium"
        >
          Upload Video
        </button>
      </div>

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
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
            >
              Upload Video
            </button>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Upload Video</h3>
            <p className="text-gray-600 text-sm mb-4">Upload your performance video for this event.</p>
            <input type="file" accept="video/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-green-50 file:text-green-700" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowUploadModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={() => { setShowUploadModal(false); alert('Upload started (demo).'); }} className="flex-1 py-2 bg-green-600 text-white rounded-lg">Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventDetail;
