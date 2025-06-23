import { Card, Flex, Image, Text, UnstyledButton, rem } from '@mantine/core';
import { useImageSelection } from '../ImageContext';
import { containerStyles } from './ImageGrid.css';

/*
 * I think this'll go slow if the images are large; need to test.
 * May want to convert to thumbnail size base64 in Rust, but that might
 * be slow going too, but probably ultimately better.
 */
const ImageGrid = () => {
  const { images, selectedImages, handleImageSelection } = useImageSelection();

  if (images.length === 0) {
    return (
      <Flex align="center" justify="center" h="100%">
        <Text c="dimmed">No Images Loaded</Text>
      </Flex>
    );
  }

  return (
    <Flex wrap="wrap" gap="lg" className={containerStyles}>
      {images?.map((image) => {
        const isSelected: boolean = !!selectedImages.find(
          (i) => i.path === image.path,
        );

        return (
          <UnstyledButton
            key={image.filename}
            aria-selected={isSelected}
            onClick={(e) => {
              handleImageSelection(e, image);
            }}
          >
            <Card
              key={image.filename}
              shadow="md"
              bg={isSelected ? 'gray.4' : undefined}
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
        );
      })}
    </Flex>
  );
};

export default ImageGrid;
