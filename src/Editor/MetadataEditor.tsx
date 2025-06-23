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
import { useImageSelection } from '../ImageContext';
import { updateMetadata } from '../core/metadata-handler';
import { type ExifData, exifData } from '../core/types';
import ExifTab from './ExifTab';
import LocationTab from './LocationTab';
import {
  formContainerStyles,
  formStyles,
  tabContainerStyles,
  tabContentStyles,
} from './MetadataEditor.css';
import useExif from './useExif';

function MetadataEditor() {
  const { selectedImages } = useImageSelection();
  const { loadingStatus, exif } = useExif(selectedImages);

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
    if (selectedImages) {
      setIsEditing(false);
    }
  }, [selectedImages]);

  const saveMetadata = useCallback(
    async (newExif: ExifData) => {
      if (selectedImages.length === 0) {
        return;
      }

      setIsEditing(false);
      try {
        await updateMetadata(selectedImages, newExif);
      } catch (err) {
        console.log('err', err);
        notifications.show({
          message: `Failed saving ${selectedImages[0].filename}`,
          color: 'red',
        });
      }
    },
    [selectedImages],
  );

  if (selectedImages.length === 0) {
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
          {selectedImages[0]?.filename}
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
        <Stack gap={0} pos="relative" className={formContainerStyles}>
          <LoadingOverlay
            visible={form.formState.isSubmitting}
            overlayProps={{ blur: 2 }}
          />

          <FormProvider {...form}>
            <form
              id="metadata-form"
              className={formStyles}
              onSubmit={form.handleSubmit(saveMetadata)}
            >
              <Tabs h="100%" defaultValue="exif" className={tabContainerStyles}>
                <Tabs.List>
                  <Tabs.Tab value="exif">EXIF</Tabs.Tab>
                  <Tabs.Tab value="gps">Location</Tabs.Tab>
                </Tabs.List>

                <Box py="sm" px="md" className={tabContentStyles}>
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
