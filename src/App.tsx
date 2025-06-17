import {
  Title1,
  Toolbar,
  ToolbarButton,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Add16Filled } from '@fluentui/react-icons/fonts';
import { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ImageGrid from './ImageGrid';
import MetadataEditor from './MetadataEditor';
import { type ImageInfo, findImages } from './file-manager';

const useStyles = makeStyles({
  titlebar: {
    backgroundColor: tokens.colorNeutralBackground3,
    justifyContent: 'space-between',
  },
  imageSelection: {
    backgroundColor: tokens.colorNeutralBackground2,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  editor: {
    height: '100vh',
  },
  root: {
    display: 'flex',
  },
});

const App = () => {
  const [selectedImage, setSelectedImage] = useState<ImageInfo | undefined>();

  const styles = useStyles();

  return (
    <PanelGroup direction="horizontal" className={styles.root}>
      <Panel className={styles.imageSelection} defaultSize={65}>
        <Toolbar className={styles.titlebar}>
          <Title1>Images</Title1>

          <ToolbarButton
            title="Add Images"
            appearance="primary"
            icon={<Add16Filled />}
            onClick={() => findImages()}
          />
        </Toolbar>

        <ImageGrid
          selectedImage={selectedImage}
          onImageSelected={setSelectedImage}
        />
      </Panel>

      <PanelResizeHandle />

      <Panel className={styles.editor} defaultSize={35}>
        <MetadataEditor image={selectedImage} />
      </Panel>
    </PanelGroup>
  );
};

export default App;
