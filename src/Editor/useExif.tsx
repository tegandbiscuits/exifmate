import { useEffect, useState } from 'react';
import type { ImageInfo } from '../core/file-manager';
import { type ExifData, readMetadata } from '../core/metadata-handler';

type Activity = 'idle' | 'active' | 'errored';

function useExif(image?: ImageInfo) {
  const [loadingStatus, setLoadingStatus] = useState<Activity>('idle');
  const [exif, setExif] = useState<ExifData | null>(null);

  useEffect(() => {
    if (!image) {
      return;
    }

    setLoadingStatus('active');

    readMetadata(image.filename, image.path)
      .then((res) => {
        setLoadingStatus('idle');
        setExif(res);
      })
      .catch(() => {
        setLoadingStatus('errored');
      });
  }, [image]);
  
  return {
    loadingStatus,
    exif,
    setExif,
  };
}

export default useExif;
