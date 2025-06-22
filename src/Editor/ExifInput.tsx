import { Select, TextInput } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { Controller, useFormContext } from 'react-hook-form';
import { type ExifData, exifData } from '../core/types';
import '@mantine/dates/styles.css';
import { EXIF_DATE_FORMAT, dayjs } from '../core/util';

interface Props {
  tagName: keyof typeof exifData.shape;
}

function ExifInput({ tagName }: Props) {
  const { register, formState, control } = useFormContext<ExifData>();
  const tagMeta = exifData.shape[tagName].meta();

  let description: string | undefined;
  if (tagMeta && typeof tagMeta.realTag === 'string') {
    description = tagMeta.realTag;
  }

  if (tagMeta?.options && typeof tagMeta.options === 'object') {
    const data = Object.keys(tagMeta.options).map((label) => ({
      label,
      value: String((tagMeta.options as Record<string, number>)[label]),
    }));

    return (
      <Controller
        name={tagName}
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            label={tagName}
            description={description}
            data={data}
            value={String(field.value)}
          />
        )}
      />
    );
  }

  if (
    tagName === 'DateTimeOriginal' ||
    tagName === 'CreateDate' ||
    tagName === 'ModifyDate'
  ) {
    return (
      <Controller
        name={tagName}
        control={control}
        render={({ field }) => (
          <DateTimePicker
            {...field}
            label={tagName}
            description={description}
            withSeconds
            valueFormat={EXIF_DATE_FORMAT}
            value={dayjs(field.value, EXIF_DATE_FORMAT).format()}
          />
        )}
      />
    );
  }

  return (
    <TextInput
      label={tagName}
      description={description}
      error={formState.errors[tagName]?.message}
      {...register(tagName)}
    />
  );
}

export default ExifInput;
