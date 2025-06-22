import { ActionIcon, Box, Flex, Title } from '@mantine/core';
import { IconPhotoPlus } from '@tabler/icons-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import {
  editorPanelStyles,
  imageGridPanelStyles,
  imageSelectionStyles,
  rootStyles,
  titlebarStyles,
} from './App.css';
import MetadataEditor from './Editor/MetadataEditor';
import ImageGrid from './ImageGrid/ImageGrid';
import { findImages } from './core/file-manager';

function App() {
  return (
    <PanelGroup direction="horizontal" className={rootStyles}>
      <Panel className={imageSelectionStyles} defaultSize={65}>
        <Flex
          direction="row"
          align="center"
          justify="space-between"
          className={titlebarStyles}
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

        <Box h="100%" p="lg" bg="gray.0" className={imageGridPanelStyles}>
          <ImageGrid />
        </Box>
      </Panel>

      <PanelResizeHandle />

      <Panel className={editorPanelStyles} defaultSize={35}>
        <MetadataEditor />
      </Panel>
    </PanelGroup>
  );
}

export default App;
