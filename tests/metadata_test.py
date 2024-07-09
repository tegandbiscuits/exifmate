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

    for tag_name in exif_data:
      tag_id = EDITABLE_METADATA["exif"][tag_name]["tag_id"]
      exif[tag_id] = exif_data[tag_name]

    out_path = tmp_path / "test.jpg"
    img.save(out_path, exif=exif)
    return Image.open(out_path)

  return _create_test_image


class TestMetadataRead:
  def test_when_value_is_arbitrary(self, create_test_image):
    test_image = create_test_image({ "Make": "Test Camera" })
    m = Metadata(test_image)
    assert m.read("Make") == "Test Camera", "returns raw value"
