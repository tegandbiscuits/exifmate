import { ActionIcon, Box, Flex, Title } from '@mantine/core';
import { IconPhotoPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
// @ts-expect-error
import styles from './App.module.css';
import MetadataEditor from './Editor/MetadataEditor';
import ImageGrid from './ImageGrid';
import { type ImageInfo, findImages } from './core/file-manager';

const App = () => {
  const [selectedImage, setSelectedImage] = useState<ImageInfo | undefined>();

  return (
    <PanelGroup direction="horizontal" className={styles.root}>
      <Panel className={styles.imageSelection} defaultSize={65}>
        <Flex
          direction="row"
          align="center"
          justify="space-between"
          style={(t) => ({
            paddingTop: t.spacing.xs,
            paddingBottom: t.spacing.xs,
            paddingLeft: t.spacing.md,
            paddingRight: t.spacing.md,
          })}
        >
          <Title order={1}>Images</Title>

          <ActionIcon
            type="button"
            variant="filled"
            size="lg"
            title="Add Images"
            onClick={() => findImages()}
          >
            <IconPhotoPlus />
          </ActionIcon>
        </Flex>

        <Box h="100%" p="lg" bg="gray.0" style={{ overflow: 'auto' }}>
          <ImageGrid
            selectedImage={selectedImage}
            onImageSelected={setSelectedImage}
          />
        </Box>
      </Panel>

      <PanelResizeHandle />

      <Panel className={styles.editor} defaultSize={35}>
        <MetadataEditor image={selectedImage} />
      </Panel>
    </PanelGroup>
  );
};

export default App;
