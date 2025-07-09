describe('ImageContext', () => {
  it.todo('holds the opened images');

  describe('handleImageSelection', () => {
    it.todo('replaces the selected images');

    describe('when the ctrl/cmd key is held', () => {
      it.todo('can select multiple images');

      it.todo('can unselect single images');
    });

    describe('when the shift key is held', () => {
      it.todo('can select a range of images in either direction');

      it.todo(
        'does not replace replace already selected images from multiselects',
      );

      describe('when a range is already selected', () => {
        it.todo('can change the range retaining from the initial image');

        describe('when ctrl/cmd is held', () => {
          it.todo('can unselect from the range');

          it.todo('does not replace the range if there is a gap');
        });
      });
    });
  });
});
