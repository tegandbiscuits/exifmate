import {
  Alert,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Input,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconCancel, IconCheck, IconEdit } from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import MapField from '../MapField/MapField';
import type { ImageInfo } from '../core/file-manager';
import { exifData, updateMetadata } from '../core/metadata-handler';
// @ts-expect-error
import styles from './MetadataEditor.module.css';
import useExif from './useExif';

interface Props {
  image?: ImageInfo;
}

function MetadataEditor({ image }: Props) {
  const { loadingStatus, exif, setExif } = useExif(image);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const saveMetadata = useCallback(() => {
    if (!image || !exif) {
      return;
    }

    console.log('starting save');

    setIsEditing(false);
    updateMetadata(image.filename, image.path, exif)
      .then(() => {
        console.log('yayyy! :D');
      })
      .catch((err) => {
        console.error('oh no :(', err);
      });
  }, [image, exif]);

  if (!image) {
    return (
      <Center h="100%">
        <Text c="dimmed">No Image Selected</Text>
      </Center>
    );
  }

  return (
    <Stack h="100%" gap={0}>
      <div>
        <Box p="md">
          <Title order={2} size="xl">
            {image.filename}
          </Title>
        </Box>

        <Divider />
      </div>

      {loadingStatus === 'active' && (
        <Center h="100%">
          <Stack align="center">
            <Loader />
            <Text c="dimmed">Loading Metadata...</Text>
          </Stack>
        </Center>
      )}

      {loadingStatus === 'errored' && (
        <Center h="100%">
          <Alert color="red" variant="filled">
            Error Loading Metadata
          </Alert>
        </Center>
      )}

      {loadingStatus === 'idle' && exif !== null && (
        <form
          className={styles.editForm}
          onSubmit={(e) => {
            e.preventDefault();
            saveMetadata();
          }}
        >
          <Box py="sm" px="md" style={{ overflow: 'auto' }}>
            <MapField
              latitude={exif.GPSLatitude}
              longitude={exif.GPSLongitude}
              disabled={!isEditing}
              onPositionChange={([lat, lon]) => {
                setExif((prev) => {
                  if (!prev) return null;

                  return {
                    ...prev,
                    GPSLatitude: lat,
                    GPSLongitude: lon,
                  };
                });
              }}
            />

            {exifData.keyof().options.map((tagName) => (
              <Input.Wrapper
                key={tagName}
                label={tagName}
                description={
                  exifData.shape[tagName].meta()?.realTag as string | undefined
                }
              >
                <Input
                  disabled={!isEditing}
                  value={String(exif[tagName] ?? '')}
                  onChange={(e) => {
                    setExif((prev) => {
                      if (prev !== null) {
                        return {
                          ...prev,
                          [tagName]: e.target.value,
                        };
                      }
                      return null;
                    });
                  }}
                />
              </Input.Wrapper>
            ))}
          </Box>

          <div>
            <Divider />

            <Group p="md" justify="space-between">
              {!isEditing && (
                <Button
                  type="button"
                  title="Edit"
                  leftSection={<IconEdit size={16} />}
                  onClick={() => setIsEditing(true)}
                  size="xs"
                >
                  Edit
                </Button>
              )}

              {isEditing && (
                <>
                  <Button
                    type="button"
                    variant="default"
                    leftSection={<IconCancel size={16} />}
                    size="xs"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    leftSection={<IconCheck size={16} />}
                    size="xs"
                  >
                    Save
                  </Button>
                </>
              )}
            </Group>
          </div>
        </form>
      )}
    </Stack>
  );
}

export default MetadataEditor;
