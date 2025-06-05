import {
  Card,
  CardHeader,
  CardPreview,
  Image,
  makeStyles,
  Text,
  tokens,
} from '@fluentui/react-components';
import React, {
  useEffect,
  useState,
} from 'react';

const useStyles = makeStyles({
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    userSelect: 'none',
    gap: tokens.spacingHorizontalM,
  },
  image: {
    width: '200px',
    height: '200px',
  },
});

const useGridSelection = (items: string[]) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [anchorItem, setAnchorItem] = useState<string | null>(null);
  const handleClick = (e: React.MouseEvent, id: string) => {
    const isMultiSelect = e.metaKey || e.ctrlKey;
    const isRangeSelect = e.shiftKey && anchorItem !== null;
    
    if (isRangeSelect) {
      let startIndex = items.findIndex((i) => i === anchorItem);
      let endIndex = items.findIndex((i) => i === id);

      if (startIndex > endIndex) {
        const prevStart = startIndex
        startIndex = endIndex;
        endIndex = prevStart;
      }

      setSelectedItems(items.slice(startIndex, endIndex + 1));
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
    selectedItems,
    handleClick,
  };
};

interface DirectoryInfo {
  directory: string;
  imageList: {
    filename: string;
    url: string;
  }[];
}

function ImageGrid() {
  const [info, setInfo] = useState<DirectoryInfo | null>(null);
  const {
    selectedItems,
    handleClick,
  } = useGridSelection(info?.imageList.map(i => i.filename) ?? []);
  const styles = useStyles();
  
  useEffect(() => {
    // @ts-expect-error electron bits
    window.electronAPI.onOpenDirectory((newInfo) => {
      setInfo(newInfo);
    });
  }, []);

  return (
    <div
      className={styles.grid}
    >
      {info?.imageList.map((image) => (
        <Card
          key={image.filename}
          selected={selectedItems.includes(image.filename)}
          onSelectionChange={(e) => handleClick(e, image.filename)}
        >
          <CardPreview className={styles.image}>
            <Image
              key={image.filename}
              src={image.url}
              fit="contain"
              alt={image.filename}
            />
          </CardPreview>
          <CardHeader header={<Text>{image.filename}</Text>} />
        </Card>
      ))}
    </div>
  );
}

export default ImageGrid;
