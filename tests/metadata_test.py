from exifmate.metadata import Metadata, EDITABLE_METADATA
from PIL.ExifTags import TAGS, IFD
from PIL import Image
import pytest
import pdb;

class TestEditableMetadata:
  def test_contains_valid_exif_tags(self):
    assertion_count = 0
    for tag_label in EDITABLE_METADATA["exif"]:
      tag_id = EDITABLE_METADATA["exif"][tag_label]["tag_id"]
      assert TAGS[tag_id] == tag_label
      assertion_count += 1
    
    assert assertion_count == len(EDITABLE_METADATA["exif"])

@pytest.fixture
def create_test_image(tmp_path):
  def _create_test_image(exif_data: dict) -> Image:
    img = Image.new("1", [1, 1])
    exif = img.getexif()
    # https://github.com/python-pillow/Pillow/issues/8229#issuecomment-2226731875
    exif._ifds.setdefault(IFD.Exif, {})

    for tag_name in exif_data:
      tag_value = exif_data[tag_name]
      tag_id = EDITABLE_METADATA["exif"][tag_name]["tag_id"]

      if type(tag_value) == dict and tag_value.get("in_ifd"):
        exif.get_ifd(IFD.Exif)[tag_id] = tag_value["value"]
      else:
        exif[tag_id] = tag_value

    return img

  return _create_test_image


class TestMetadataRead:
  def test_when_value_is_arbitrary(self, create_test_image):
    test_image = create_test_image({ "Make": "Test Camera" })
    m = Metadata(test_image)
    assert m.read("Make") == "Test Camera", "returns raw value"

  def test_when_tag_is_in_an_ifd(self, create_test_image):
    test_date = "2010:01:01 00:00:00" 
    test_image = create_test_image({ "DateTimeOriginal": { "in_ifd": True, "value": test_date }})
    m = Metadata(test_image)
    assert m.read("DateTimeOriginal") == test_date, "still returns the value"

  # Returning unknown values as the original so it doesn't act destructive.
  # TODO: the UI needs to make sure the unknown value is a selectable option
  @pytest.mark.parametrize("wb_value,expected", [("1", "Manual"), ("123", "123")])
  def test_when_values_are_predefined(self, create_test_image, wb_value, expected):
    test_image = create_test_image({ "WhiteBalance": wb_value })
    m = Metadata(test_image)
    assert m.read("WhiteBalance") == expected
