/* eslint-disable max-lines-per-function */
import {
  Card,
  CardHeader,
  CardPreview,
  Image,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { convertFileSrc } from '@tauri-apps/api/core';
import { type UnlistenFn, listen } from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';

interface DirectoryImage {
  filename: string;
  path: string;
}

interface DirectoryInfo {
  dirPath: string;
  imageList: DirectoryImage[];
}

const useStyles = makeStyles({
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

/*
 * I think this'll go slow if the images are large; need to test.
 * May want to convert to thumbnail size base64 in Rust, but that might
 * be slow going too, but probably ultimately better.
 */
const useGridSelection = (items: string[]) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [anchorItem, setAnchorItem] = useState<string | null>(null);

  const handleClick = (event: MouseEvent, id: string) => {
    const isMultiSelect = event.metaKey || event.ctrlKey;
    const isRangeSelect = event.shiftKey && anchorItem !== null;

    if (isRangeSelect) {
      let startIndex = items.findIndex((item) => item === anchorItem);
      let endIndex = items.findIndex((item) => item === id);

      if (startIndex > endIndex) {
        const prevStart = startIndex;
        startIndex = endIndex;
        endIndex = prevStart;
      }

      const END_OFFSET = 1;
      setSelectedItems(items.slice(startIndex, endIndex + END_OFFSET));
    } else if (isMultiSelect) {
      setSelectedItems((prev) => {
        if (prev.includes(id)) {
          return prev.filter((item) => item !== id);
        }

        return prev.concat(id);
      });

      setAnchorItem(id);
    } else {
      setSelectedItems([id]);
      setAnchorItem(id);
    }
  };

  return {
    handleClick,
    selectedItems,
  };
};

const ImageGrid = () => {
  const [info, setInfo] = useState<DirectoryInfo | null>(null);
  const { selectedItems, handleClick } = useGridSelection(
    info?.imageList.map((img) => img.filename) ?? [],
  );
  const styles = useStyles();

  useEffect(() => {
    let unlisten: UnlistenFn | null = null;

    listen<DirectoryInfo>('find-images', (res) => {
      const newInfo: DirectoryInfo = {
        ...res.payload,
        imageList: res.payload.imageList.map((img) => {
          const assetUrl = convertFileSrc(img.path);
          return {
            filename: img.filename,
            path: assetUrl,
          };
        }),
      };

      setInfo(newInfo);
    }).then((clean) => {
      unlisten = clean;
    });

    return () => {
      unlisten?.();
    };
  }, []);

  return (
    <div className={styles.grid}>
      {info?.imageList.map((image) => (
        <Card
          key={image.filename}
          selected={selectedItems.includes(image.filename)}
          onSelectionChange={(event: MouseEvent) =>
            handleClick(event, image.filename)
          }
        >
          <CardPreview className={styles.image}>
            <Image
              key={image.filename}
              src={image.path}
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
