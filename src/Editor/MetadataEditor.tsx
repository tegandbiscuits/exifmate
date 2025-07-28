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
} from '@mantine/core';
import { IconCancel, IconCheck, IconEdit } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useImageSelection } from '../ImageContext';
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
  const [tab, setTab] = useState<string | null>('exif');
  const { loadingStatus, exif, saveMetadata } = useExif(selectedImages);

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

  if (selectedImages.length === 0) {
    return (
      <Center h="100%">
        <Text c="dimmed">No Image Selected</Text>
      </Center>
    );
  }

  if (loadingStatus === 'active') {
    return (
      <Center h="100%">
        <Stack align="center">
          <Loader />
          <Text c="dimmed">Loading Metadata...</Text>
        </Stack>
      </Center>
    );
  }

  if (loadingStatus === 'errored') {
    return (
      <Center h="100%">
        <Alert color="red" variant="filled">
          Error Loading Metadata
        </Alert>
      </Center>
    );
  }

  return (
    <Stack gap={0} pos="relative" className={formContainerStyles}>
      <LoadingOverlay
        visible={form.formState.isSubmitting}
        overlayProps={{ blur: 2 }}
      />

      <FormProvider {...form}>
        <form
          id="metadata-form"
          className={formStyles}
          onSubmit={form.handleSubmit(async (newExif: ExifData) => {
            setIsEditing(false);
            await saveMetadata(newExif);
          })}
        >
          <Tabs value={tab} onChange={setTab} className={tabContainerStyles}>
            <Tabs.List>
              <Tabs.Tab value="exif">EXIF</Tabs.Tab>
              <Tabs.Tab value="gps">Location</Tabs.Tab>
            </Tabs.List>

            <Box py="sm" px="md" className={tabContentStyles}>
              <Tabs.Panel value="exif">
                <ExifTab />
              </Tabs.Panel>

              <Tabs.Panel value="gps" style={{ height: '100%' }}>
                <LocationTab />
              </Tabs.Panel>
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
                      disabled={!form.formState.isValid}
                    >
                      Save
                    </Button>
                  </>
                )}
              </Group>
            </div>
          </Tabs>
        </form>
      </FormProvider>
    </Stack>
  );
}

export default MetadataEditor;
