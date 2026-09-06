import React from 'react';
import { ImagePlus, Sparkles, X } from 'lucide-react';

export function MediaDisplay({ media, removeMedia }) {
  if (!media) return null;

  return (
    <div className="writing-media-container">
      <div className="writing-media-frame">
        {media.type.startsWith('image/') ? (
          <img src={media.url} alt={media.name} className="writing-media-element" />
        ) : media.type.startsWith('video/') ? (
          <video src={media.url} className="writing-media-element" controls />
        ) : media.type.startsWith('audio/') ? (
          <Sparkles size={26} className="writing-canary-text" strokeWidth={3} />
        ) : (
          <ImagePlus size={26} className="writing-dim-text" strokeWidth={3} />
        )}
      </div>
      {media.type.startsWith('audio/') && <audio src={media.url} controls className="writing-audio-player" />}
      <button
        type="button"
        onClick={removeMedia}
        className="writing-media-remove-btn"
        aria-label="Remove media"
        title="Remove media"
      >
        <X size={18} strokeWidth={3} />
      </button>
    </div>
  );
}
