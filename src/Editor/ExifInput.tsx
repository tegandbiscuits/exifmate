import { NativeSelect, TextInput } from '@mantine/core';
import { useFormContext } from 'react-hook-form';
import { type ExifData, exifData } from '../core/types';

interface Props {
  tagName: keyof typeof exifData.shape;
}

function ExifInput({ tagName }: Props) {
  const { register, formState } = useFormContext<ExifData>();
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
      <NativeSelect
        label={tagName}
        description={description}
        data={[{ label: '', value: '' }, ...data]}
        {...register(tagName)}
      />
    );
  }

  const isDateInput =
    tagName === 'DateTimeOriginal' ||
    tagName === 'CreateDate' ||
    tagName === 'ModifyDate';

  return (
    <TextInput
      type={isDateInput ? 'datetime-local' : 'text'}
      step={isDateInput ? 1 : undefined}
      label={tagName}
      description={description}
      error={formState.errors[tagName]?.message}
      {...register(tagName)}
    />
  );
}

export default ExifInput;
