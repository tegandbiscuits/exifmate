import type { UnlistenFn } from '@tauri-apps/api/event';
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { onImagesOpened } from './core/events';
import type { ImageInfo } from './core/types';

interface ImageContext {
  images: ImageInfo[];
  selectedImages: ImageInfo[];
  handleImageSelection: (
    event: React.MouseEvent,
    selectedImage: ImageInfo,
  ) => void;
}

const ImageSelectionContext = createContext<ImageContext>({
  images: [],
  selectedImages: [],
  handleImageSelection: () => {},
});

export const useImageSelection = () => useContext(ImageSelectionContext);

const useGridSelection = (images: ImageInfo[]) => {
  const [selectedImages, setSelectedImages] = useState<ImageInfo[]>([]);
  const [anchorImage, setAnchorImage] = useState<ImageInfo | null>(null);

  const handleImageSelection = (
    event: React.MouseEvent,
    selectedImage: ImageInfo,
  ) => {
    const isMultiSelect = event.metaKey || event.ctrlKey;
    const isRangeSelect = event.shiftKey && anchorImage !== null;

    if (isRangeSelect) {
      let startIndex = images.findIndex(
        (image) => image.path === anchorImage.path,
      );
      let endIndex = images.findIndex(
        (image) => image.path === selectedImage.path,
      );

      if (startIndex > endIndex) {
        const prevStart = startIndex;
        startIndex = endIndex;
        endIndex = prevStart;
      }

      const END_OFFSET = 1;
      setSelectedImages(images.slice(startIndex, endIndex + END_OFFSET));
    } else if (isMultiSelect) {
      setSelectedImages((prev) => {
        if (prev.find((i) => i.path === selectedImage.path)) {
          return prev.filter((item) => item.path !== selectedImage.path);
        }

        return prev.concat(selectedImage);
      });

      setAnchorImage(selectedImage);
    } else {
      setSelectedImages([selectedImage]);
      setAnchorImage(selectedImage);
    }
  };

  return {
    handleImageSelection,
    selectedImages,
  };
};

interface Props {
  children: ReactNode;
}

export function ImageProvider({ children }: Props) {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const { selectedImages, handleImageSelection } = useGridSelection(images);

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
      value={{ images, selectedImages, handleImageSelection }}
    >
      {children}
    </ImageSelectionContext.Provider>
  );
}
