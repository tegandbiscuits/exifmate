import pytest
from PIL import Image
from PIL.ExifTags import IFD, TAGS

from exifmate.metadata import EDITABLE_METADATA, Metadata


class TestEditableMetadata:
  def test_contains_valid_exif_tags(self):
    assertion_count = 0
    for tag_label in EDITABLE_METADATA["exif"]:
      tag_id = EDITABLE_METADATA["exif"][tag_label]["tag_id"]
      assert TAGS[tag_id] == tag_label
      assertion_count += 1

    assert assertion_count == len(EDITABLE_METADATA["exif"])


@pytest.fixture()
def create_test_image():
  def _create_test_image(exif_data: dict) -> Image:
    img = Image.new("1", [1, 1])
    exif = img.getexif()
    # https://github.com/python-pillow/Pillow/issues/8229#issuecomment-2226731875
    exif._ifds.setdefault(IFD.Exif, {})

    for tag_name in exif_data:
      tag_value = exif_data[tag_name]
      tag_id = EDITABLE_METADATA["exif"][tag_name]["tag_id"]

      if isinstance(tag_value, dict) and tag_value.get("in_ifd"):
        exif.get_ifd(IFD.Exif)[tag_id] = tag_value["value"]
      else:
        exif[tag_id] = tag_value

    return img

  return _create_test_image


class TestMetadataRead:
  @pytest.mark.parametrize(("make_value"), ["Test Camera", None])
  def test_when_value_is_arbitrary(self, create_test_image, make_value):
    test_image = create_test_image({"Make": make_value})
    m = Metadata(test_image)
    assert m.read("Make") == make_value, "returns raw value"

  @pytest.mark.parametrize(("dto_value"), ["2010:01:01 00:00:00", None])
  def test_when_tag_is_in_an_ifd(self, create_test_image, dto_value):
    test_image = create_test_image(
      {"DateTimeOriginal": {"in_ifd": True, "value": dto_value}},
    )
    m = Metadata(test_image)
    assert m.read("DateTimeOriginal") == dto_value, "still returns the value"

  # Returning unknown values as the original so it doesn't act destructive.
  # TODO: the UI needs to make sure the unknown value is a selectable option
  @pytest.mark.parametrize(
    ("wb_value", "expected"),
    [("1", "Manual"), ("123", "123"), (None, None), (1, "Manual")],
  )
  def test_when_values_are_predefined(self, create_test_image, wb_value, expected):
    test_image = create_test_image({"WhiteBalance": wb_value})
    m = Metadata(test_image)
    assert m.read("WhiteBalance") == expected

  def test_when_value_is_stored_in_bytes(self, create_test_image):
    test_image = create_test_image(
      {"ExifVersion": {"in_ifd": True, "value": bytes("0232", "utf8")}},
    )
    m = Metadata(test_image)
    assert m.read("ExifVersion") == "0232", "returns UTF-8 serialized"

class TestMetadataReadAll:
  def test_opens_and_returns_all_the_exif_data(self, create_test_image, tmp_path):
    test_image = create_test_image({})
    test_image_path = tmp_path / "test.jpg"
    test_image.save(test_image_path)

    all_data = Metadata.read_all(test_image_path)
    assert len(all_data["exif"]) == len(EDITABLE_METADATA["exif"])
    assert all(d["key"] in EDITABLE_METADATA["exif"] for d in all_data["exif"])
    assert all(isinstance(d["value"], str) for d in all_data["exif"])

  def test_when_file_does_not_exist(self, tmp_path):
    test_image_path = tmp_path / "test.jpg"
    with pytest.raises(FileNotFoundError):
      Metadata.read_all(test_image_path)
