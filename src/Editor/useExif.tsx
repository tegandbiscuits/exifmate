import { useEffect, useState } from 'react';
import { readMetadata } from '../core/metadata-handler';
import type { ExifData, ImageInfo } from '../core/types';

type Activity = 'idle' | 'active' | 'errored';

function useExif(images: ImageInfo[]) {
  const [loadingStatus, setLoadingStatus] = useState<Activity>('idle');
  const [exif, setExif] = useState<ExifData | null>(null);

  useEffect(() => {
    setLoadingStatus('active');
    setExif(null);

    readMetadata(images)
      .then((res) => {
        setLoadingStatus('idle');
        setExif(res);
      })
      .catch(() => {
        setLoadingStatus('errored');
      });
  }, [images]);

  return {
    loadingStatus,
    exif,
    setExif,
  };
}

export default useExif;
