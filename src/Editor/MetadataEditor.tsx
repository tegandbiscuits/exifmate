import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Loader,
  LoadingOverlay,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCancel, IconCheck, IconEdit } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { ImageInfo } from '../core/file-manager';
import {
  type ExifData,
  exifData,
  updateMetadata,
} from '../core/metadata-handler';
import ExifTab from './ExifTab';
import LocationTab from './LocationTab';
import useExif from './useExif';

interface Props {
  image?: ImageInfo;
}

function MetadataEditor({ image }: Props) {
  const { loadingStatus, exif } = useExif(image);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const form = useForm({
    mode: 'onChange',
    disabled: !isEditing,
    resolver: zodResolver(exifData),
  });

  useEffect(() => {
    if (exif) {
      form.reset(exif);
    }
  }, [exif, form.reset]);

  useEffect(() => {
    if (image) {
      setIsEditing(false);
    }
  }, [image]);

  const saveMetadata = useCallback(
    async (newExif: ExifData) => {
      if (!image) {
        return;
      }

      setIsEditing(false);
      try {
        await updateMetadata(image.filename, image.path, newExif);
      } catch (err) {
        notifications.show({
          message: `Failed saving ${image.filename}`,
          color: 'red',
        });
      }
    },
    [image],
  );

  if (!image) {
    return (
      <Center h="100%">
        <Text c="dimmed">No Image Selected</Text>
      </Center>
    );
  }

  return (
    <Stack h="100%" gap={0}>
      <Box p="md">
        <Title order={2} size="xl">
          {image.filename}
        </Title>
      </Box>

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
        <Stack
          gap={0}
          pos="relative"
          style={{
            flexGrow: 1,
            overflow: 'clip',
          }}
        >
          <LoadingOverlay
            visible={form.formState.isSubmitting}
            overlayProps={{ blur: 2 }}
          />

          <FormProvider {...form}>
            <form
              id="metadata-form"
              style={{
                flexGrow: 1,
                overflow: 'auto',
              }}
              onSubmit={form.handleSubmit(saveMetadata)}
            >
              <Tabs
                display="flex"
                h="100%"
                defaultValue="exif"
                style={{
                  flexDirection: 'column',
                  overflow: 'clip',
                }}
              >
                <Tabs.List>
                  <Tabs.Tab value="exif">EXIF</Tabs.Tab>
                  <Tabs.Tab value="gps">Location</Tabs.Tab>
                </Tabs.List>

                <Box py="sm" px="md" style={{ overflow: 'auto' }}>
                  <Tabs.Panel value="exif">
                    <ExifTab />
                  </Tabs.Panel>

                  <Tabs.Panel value="gps">
                    <LocationTab />
                  </Tabs.Panel>
                </Box>
              </Tabs>
            </form>
          </FormProvider>

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
                    type="reset"
                    variant="default"
                    leftSection={<IconCancel size={16} />}
                    size="xs"
                    onClick={() => {
                      setIsEditing(false);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    form="metadata-form"
                    leftSection={<IconCheck size={16} />}
                    size="xs"
                  >
                    Save
                  </Button>
                </>
              )}
            </Group>
          </div>
        </Stack>
      )}
    </Stack>
  );
}

export default MetadataEditor;
