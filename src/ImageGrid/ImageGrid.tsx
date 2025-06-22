import { Card, Flex, Image, Text, UnstyledButton, rem } from '@mantine/core';
import { useImageSelection } from '../ImageContext';
import { containerStyles } from './ImageGrid.css';

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

/*
 * I think this'll go slow if the images are large; need to test.
 * May want to convert to thumbnail size base64 in Rust, but that might
 * be slow going too, but probably ultimately better.
 */
const ImageGrid = () => {
  const { images, selectedImage, setSelectedImage } = useImageSelection();

  if (images.length === 0) {
    return (
      <Flex align="center" justify="center" h="100%">
        <Text c="dimmed">No Images Loaded</Text>
      </Flex>
    );
  }

  return (
    <Flex wrap="wrap" gap="lg" className={containerStyles}>
      {images?.map((image) => (
        <UnstyledButton
          key={image.filename}
          aria-selected={selectedImage?.path === image.path}
          onClick={() => {
            setSelectedImage(image);
          }}
        >
          <Card
            key={image.filename}
            shadow="md"
            bg={selectedImage?.path === image.path ? 'gray.4' : undefined}
          >
            <Card.Section>
              <Image
                src={image.assetUrl}
                fit="contain"
                alt={image.filename}
                w={rem(200)}
                h={rem(200)}
              />
            </Card.Section>

            <Card.Section inheritPadding py="xs">
              <Text>{image.filename}</Text>
            </Card.Section>
          </Card>
        </UnstyledButton>
      ))}
    </Flex>
  );
};

export default ImageGrid;
