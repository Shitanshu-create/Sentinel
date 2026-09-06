import { useState, useRef, useEffect } from 'react';

export function useMedia(initialMedia = null) {
  const [media, setMedia] = useState(initialMedia);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (media?.url && !media.url.startsWith('data:')) URL.revokeObjectURL(media.url);
    };
  }, [media]);

  const handleMediaSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (media?.url && !media.url.startsWith('data:')) URL.revokeObjectURL(media.url);

    setMedia({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      file: file
    });
  };

  const removeMedia = () => {
    setMedia(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return { media, setMedia, fileInputRef, handleMediaSelect, removeMedia };
}
