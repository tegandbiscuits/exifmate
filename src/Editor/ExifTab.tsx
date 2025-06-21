import { Divider, Fieldset, Stack } from '@mantine/core';
import ExifInput from './ExifInput';

function ExifTab() {
  return (
    <div>
      <Fieldset legend="Date and Time" mb="lg">
        <Stack gap="xs">
          <ExifInput tagName="DateTimeOriginal" />
          <ExifInput tagName="CreateDate" />
          <ExifInput tagName="ModifyDate" />
          {/* TODO: add sync all checkbox */}
        </Stack>
      </Fieldset>

      <Fieldset legend="General" mb="lg">
        <Stack gap="xs">
          <ExifInput tagName="Artist" />
          <ExifInput tagName="ImageDescription" />
          <ExifInput tagName="Copyright" />
          <ExifInput tagName="Software" />
        </Stack>
      </Fieldset>

      <Fieldset legend="Camera" mb="lg">
        <Stack gap="xs">
          <ExifInput tagName="Make" />
          <ExifInput tagName="Model" />
          <ExifInput tagName="SerialNumber" />
        </Stack>
      </Fieldset>

      <Fieldset legend="Camera Settings" mb="lg">
        <Stack gap="xs">
          <ExifInput tagName="ISO" />
          <ExifInput tagName="FNumber" />
          {/* <ExifInput tagName="ShutterSpeed" /> */}
          <ExifInput tagName="FocalLength" />
          <ExifInput tagName="FocalLengthIn35mmFormat" />
          <ExifInput tagName="ExposureCompensation" />
          <ExifInput tagName="Flash" />

          <Divider label="Advanced" />

          {/* <ExifInput tagName="ColorSpace" /> */}
          <ExifInput tagName="MaxApertureValue" />
          <ExifInput tagName="ExposureMode" />
          <ExifInput tagName="ExposureProgram" />
          <ExifInput tagName="ExposureTime" />
          <ExifInput tagName="MeteringMode" />
          <ExifInput tagName="WhiteBalance" />
          <ExifInput tagName="Saturation" />
          <ExifInput tagName="Sharpness" />
        </Stack>
      </Fieldset>

      <Fieldset legend="Lens" mb="lg">
        <Stack gap="xs">
          <ExifInput tagName="LensMake" />
          <ExifInput tagName="LensModel" />
          <ExifInput tagName="Lens" />
          <ExifInput tagName="LensSerialNumber" />
        </Stack>
      </Fieldset>

      <Fieldset legend="Dimensions and Resolution" mb="lg">
        <Stack gap="xs">
          <ExifInput tagName="Orientation" />
          <ExifInput tagName="ExifImageWidth" />
          <ExifInput tagName="ExifImageHeight" />
        </Stack>
      </Fieldset>
    </div>
  );
}

export default ExifTab;
