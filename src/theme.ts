import { Tabs, createTheme } from '@mantine/core';

export default createTheme({
  components: {
    Tabs: Tabs.extend({
      // @ts-expect-error
      vars: () => ({
        root: {
          '--tabs-display': 'flex',
          '--tabs-flex-direction': 'column',
        },
      }),
    }),
  },
});
