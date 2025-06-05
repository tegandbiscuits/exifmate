import { Title1, makeStyles, tokens } from '@fluentui/react-components';
import ImageGrid from './ImageGrid';

const useStyles = makeStyles({
  editor: {
    backgroundColor: tokens.colorNeutralBackground1,
    padding: tokens.spacingHorizontalL,
  },
  imageSelection: {
    backgroundColor: tokens.colorNeutralBackground2,
    overflowY: 'scroll',
    padding: tokens.spacingHorizontalL,
    width: '60vw',
  },
  root: {
    display: 'flex',
    maxHeight: '100vh',
    overflow: 'clip',
  },
});

const App = () => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <div className={styles.imageSelection}>
        <Title1>Images</Title1>

        <ImageGrid />
      </div>

      <div className={styles.editor}>
        Metadata goes here
      </div>
    </div>
  );
}

export default App
