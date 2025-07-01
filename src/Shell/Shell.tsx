import { ActionIcon, Box, Flex, Stack, Title } from '@mantine/core';
import { IconPhotoPlus } from '@tabler/icons-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import MetadataEditor from '../Editor/MetadataEditor';
import ImageGrid from '../ImageGrid/ImageGrid';
import { findImages } from '../core/file-manager';
import {
  editorPanelStyles,
  imageGridPanelStyles,
  imageSelectionStyles,
  rootStyles,
  titlebarStyles,
} from './Shell.css';

function Shell() {
  return (
    <Stack h="100vh" gap={0}>
      <Flex
        direction="row"
        align="center"
        justify="space-between"
        className={titlebarStyles}
      >
        <Title order={1} size="h2">
          Images
        </Title>

        <ActionIcon
          type="button"
          variant="filled"
          size="md"
          title="Add Images"
          onClick={() => findImages()}
        >
          <IconPhotoPlus />
        </ActionIcon>
      </Flex>

      <PanelGroup direction="horizontal" className={rootStyles}>
        <Panel className={imageSelectionStyles} defaultSize={65}>
          <Box p="lg" className={imageGridPanelStyles}>
            <ImageGrid />
          </Box>
        </Panel>

        <PanelResizeHandle />

        <Panel className={editorPanelStyles} defaultSize={35}>
          <MetadataEditor />
        </Panel>
      </PanelGroup>
    </Stack>
  );
}

export default Shell;
