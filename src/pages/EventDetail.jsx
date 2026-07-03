import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import bgImage from '../assets/images/bg.jpg';

import eventVideos from '../data/eventDetailVideosCatalog.json';

function EventDetail() {
  const { id } = useParams();
  const videos = eventVideos[id] || [];
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div
      className="theme-page bg-cover bg-center bg-no-repeat pt-28"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <h2 className="theme-page-title !mb-0 capitalize">{id} Event Videos</h2>
        <button type="button" onClick={() => setShowUploadModal(true)} className="theme-btn-primary">
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
          <h3 className="mb-4 text-center font-script text-3xl text-purple-800">
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
              className="theme-btn-primary flex-1 py-2"
            >
              Upload Video
            </button>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="theme-card-lg w-full max-w-md">
            <h3 className="mb-4 font-script text-3xl text-purple-800">Upload Video</h3>
            <p className="mb-4 font-body text-sm text-gray-600">Upload your performance video for this event.</p>
            <input type="file" accept="video/*" className="w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-peach-highlight file:px-4 file:py-2 file:font-label file:text-brand-orange" />
            <div className="mt-4 flex gap-3">
              <button onClick={() => setShowUploadModal(false)} className="theme-btn-secondary flex-1 py-2">Cancel</button>
              <button type="button" onClick={() => { setShowUploadModal(false); alert('Upload started (demo).'); }} className="theme-btn-primary flex-1 py-2">Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventDetail;
