describe('LocationTab', () => {
  it.todo('indicates that the map is loading');

  describe('when the previous map state has loaded', () => {
    it.todo('initially centers the map to London by default');

    it.todo('sets a pin to the form value');

    it.todo('updates the pin when the text input is updated');

    it.todo('does not break the map when a non-number is entered');

    it.todo('has no pin when there is no value for location');

    it.todo('handles one of the location fields is not set');

    describe('when the map is clicked', () => {
      it.todo('updates the location inputs');

      it.todo('moves the pin');

      describe('when the form is disabled', () => {
        it.todo('does nothing');
      });
    });

    describe('when the map is moved', () => {
      it.todo('persists the centered location and zoom to the app state');

      it.todo('does not matter if the save fails');
    });

    describe('when the map has been moved', () => {
      it.todo(
        'initially centers the map and zoom to where it was last moved to',
      );
    });
  });
});
