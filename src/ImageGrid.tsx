import {
  Card,
  CardHeader,
  CardPreview,
  Image,
  Subtitle1,
  Text,
  makeStyles,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import { type UnlistenFn, listen } from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';
import type { ImageInfo } from './core/file-manager';

const useStyles = makeStyles({
  container: {
    backgroundColor: tokens.colorNeutralBackground2,
    padding: tokens.spacingHorizontalL,
    overflow: 'auto',
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorNeutralForeground4,
    height: '100%',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
    userSelect: 'none',
  },
  image: {
    height: '200px',
    width: '200px',
  },
});

// const useGridSelection = (items: string[]) => {
//   const [selectedItems, setSelectedItems] = useState<string[]>([]);
//   const [anchorItem, setAnchorItem] = useState<string | null>(null);
//
//   const handleClick = (event: MouseEvent, id: string) => {
//     const isMultiSelect = event.metaKey || event.ctrlKey;
//     const isRangeSelect = event.shiftKey && anchorItem !== null;
//
//     if (isRangeSelect) {
//       let startIndex = items.findIndex((item) => item === anchorItem);
//       let endIndex = items.findIndex((item) => item === id);
//
//       if (startIndex > endIndex) {
//         const prevStart = startIndex;
//         startIndex = endIndex;
//         endIndex = prevStart;
//       }
//
//       const END_OFFSET = 1;
//       setSelectedItems(items.slice(startIndex, endIndex + END_OFFSET));
//     } else if (isMultiSelect) {
//       setSelectedItems((prev) => {
//         if (prev.includes(id)) {
//           return prev.filter((item) => item !== id);
//         }
//
//         return prev.concat(id);
//       });
//
//       setAnchorItem(id);
//     } else {
//       setSelectedItems([id]);
//       setAnchorItem(id);
//     }
//   };
//
//   return {
//     handleClick,
//     selectedItems,
//   };
// };

interface Props {
  selectedImage?: ImageInfo;
  onImageSelected: (image: ImageInfo) => void;
}

/*
 * I think this'll go slow if the images are large; need to test.
 * May want to convert to thumbnail size base64 in Rust, but that might
 * be slow going too, but probably ultimately better.
 */
const ImageGrid = ({ selectedImage, onImageSelected }: Props) => {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const styles = useStyles();

  useEffect(() => {
    let unlisten: UnlistenFn | null = null;

    listen<{ images: ImageInfo[] }>('files-selected', (res) => {
      setImages(res.payload.images);
    }).then((clean) => {
      unlisten = clean;
    });

    return () => {
      unlisten?.();
    };
  }, []);

  if (images.length === 0) {
    return (
      <div className={mergeClasses(styles.container, styles.empty)}>
        <Subtitle1>No Images Loaded</Subtitle1>
      </div>
    );
  }

  return (
    <div className={mergeClasses(styles.grid, styles.container)}>
      {images?.map((image) => (
        <Card
          key={image.filename}
          selected={selectedImage?.assetUrl === image.assetUrl}
          onSelectionChange={() => onImageSelected(image)}
        >
          <CardPreview className={styles.image}>
            <Image
              key={image.filename}
              src={image.assetUrl}
              fit="contain"
              alt={image.filename}
            />
          </CardPreview>
          <CardHeader header={<Text>{image.filename}</Text>} />
        </Card>
      ))}
    </div>
  );
};

export default ImageGrid;
