import type { UnlistenFn } from '@tauri-apps/api/event';
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { onImagesOpened } from './core/events';
import type { ImageInfo } from './core/types';

interface ImageContext {
  images: ImageInfo[];
  selectedImage?: ImageInfo;
  setSelectedImage: Dispatch<SetStateAction<ImageContext['selectedImage']>>;
}

const ImageSelectionContext = createContext<ImageContext>({
  images: [],
  setSelectedImage: () => {},
});

export const useImageSelection = () => useContext(ImageSelectionContext);

interface Props {
  children: ReactNode;
}

export function ImageProvider({ children }: Props) {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageInfo>();

  useEffect(() => {
    let unlisten: UnlistenFn | null = null;

    onImagesOpened((images) => {
      setImages(images);
    }).then((clean) => {
      unlisten = clean;
    });

    return () => {
      unlisten?.();
    };
  }, []);

  return (
    <ImageSelectionContext.Provider
      value={{ images, selectedImage, setSelectedImage }}
    >
      {children}
    </ImageSelectionContext.Provider>
  );
}
