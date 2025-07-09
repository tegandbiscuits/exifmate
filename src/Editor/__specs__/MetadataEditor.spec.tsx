describe('MetadataEditor', () => {
  it.todo('indicates when no image is selected');

  describe('when failing to open an image', () => {
    it.todo('indicates failure with no form even with partial load error');
  });

  describe('when images are selected', () => {
    it.todo('indicates when metadata is loading');

    it.todo('has different buttons when the form is disabled');

    it.todo('can enable the form');

    describe('when selected image is changed', () => {
      it.todo('persists the opened tab between image selection changing');

      it.todo('disables the form');

      it.todo('blanks out inputs for fields that now have no value');
    });

    describe('when form changes are cancelled', () => {
      it.todo('resets unsaved values');
    });

    describe('form submission', () => {
      it.todo('disables the form');

      it.todo('has a saving indicator');

      it.todo('sets the form to the saved value');

      it.todo('can not submit if the form is invalid');

      describe('when failed to save an image', () => {
        it.todo('indicates when an image fails to save');

        it.todo('does something to the form value if partial success saving');
      });
    });
  });
});
