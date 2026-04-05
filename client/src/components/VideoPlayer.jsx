import React, { useState } from 'react';

export default function VideoPlayer({ videos, onComplete, completedVideos = [] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [completed, setCompleted] = useState(new Set(completedVideos));

  const current = videos?.[activeIdx];

  const markComplete = () => {
    const newSet = new Set(completed);
    newSet.add(activeIdx);
    setCompleted(newSet);
    if (onComplete) onComplete(activeIdx);
  };

  const isYouTube = (url) => url?.includes('youtube.com') || url?.includes('youtu.be');

  if (!videos || videos.length === 0) {
    return (
      <div className="card flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">🎬</div>
          <p>No videos available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Player */}
      <div className="flex-1">
        <div className="card !p-0 overflow-hidden">
          <div className="relative aspect-video bg-black rounded-t-2xl">
            {isYouTube(current?.url) ? (
              <iframe
                src={current.url}
                title={current.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                key={current?.url}
                src={current?.url}
                controls
                className="w-full h-full"
                onEnded={markComplete}
              />
            )}
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white text-lg">{current?.title}</h3>
                {current?.duration && (
                  <span className="text-xs text-gray-500 mt-1 block">⏱ {current.duration}</span>
                )}
                {current?.description && (
                  <p className="text-sm text-gray-400 mt-2">{current.description}</p>
                )}
              </div>
              <button
                onClick={markComplete}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${completed.has(activeIdx)
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'btn-primary'}`}
              >
                {completed.has(activeIdx) ? '✅ Completed' : '✓ Mark Complete'}
              </button>
            </div>

            {/* Navigation arrows */}
            <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
              <button
                disabled={activeIdx === 0}
                onClick={() => setActiveIdx(i => i - 1)}
                className="btn-ghost text-sm disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                ← Previous
              </button>
              <button
                disabled={activeIdx === videos.length - 1}
                onClick={() => setActiveIdx(i => i + 1)}
                className="btn-primary text-sm disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Playlist */}
      <div className="lg:w-72 flex flex-col gap-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
          Course Content ({videos.length} videos)
        </p>
        <div className="flex flex-col gap-1.5 max-h-[480px] overflow-y-auto pr-1">
          {videos.map((video, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all w-full
                ${idx === activeIdx
                  ? 'bg-primary-600/20 border border-primary-500/30 text-white'
                  : 'glass hover:bg-white/8 text-gray-400 hover:text-white'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold
                ${completed.has(idx) ? 'bg-emerald-500/20 text-emerald-400' : idx === activeIdx ? 'bg-primary-600 text-white' : 'bg-white/10 text-gray-400'}`}>
                {completed.has(idx) ? '✓' : idx + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{video.title}</p>
                {video.duration && <p className="text-xs text-gray-600 mt-0.5">{video.duration}</p>}
              </div>
            </button>
          ))}
        </div>
        <div className="card !p-3 mt-1">
          <p className="text-xs text-gray-500 mb-1.5">Course Progress</p>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((completed.size / videos.length) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">{completed.size}/{videos.length} completed</p>
        </div>
      </div>
    </div>
  );
}
