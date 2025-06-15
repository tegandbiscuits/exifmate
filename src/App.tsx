import { Title1, makeStyles, tokens } from '@fluentui/react-components';
import ImageGrid from './ImageGrid';
import MetadataEditor from './MetadataEditor';
import { useState } from 'react';
import type { ImageInfo } from './file-manager';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

const useStyles = makeStyles({
  titlebar: {
    marginBottom: tokens.spacingVerticalL,
  },
  imageSelection: {
    backgroundColor: tokens.colorNeutralBackground2,
    padding: tokens.spacingHorizontalL,
  },
  root: {
    height: '100vh',
  },
});

const App = () => {
  const [selectedImage, setSelectedImage] = useState<ImageInfo | undefined>();

  const styles = useStyles();

  return (
    <div className={styles.root}>
      <PanelGroup direction="horizontal">
        <Panel className={styles.imageSelection} defaultSize={65} style={{ overflow: 'scroll' }}>
          <div className={styles.titlebar}>
            <Title1>Images</Title1>
          </div>

          <ImageGrid
            selectedImage={selectedImage}
            onImageSelected={setSelectedImage}
          />
        </Panel>
        
        <PanelResizeHandle />

        <Panel defaultSize={35}>
          <MetadataEditor image={selectedImage} />
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default App;
