import { NativeSelect, TextInput } from '@mantine/core';
import { useFormContext } from 'react-hook-form';
import { ZodEnum } from 'zod/v4';
import { type ExifData, exifData } from '../core/types';
import { baseInputStyles } from './ExifInput.css';

interface Props {
  tagName: keyof typeof exifData.shape;
}

function ExifInput({ tagName }: Props) {
  const { register, formState } = useFormContext<ExifData>();
  const tag = exifData.shape[tagName].unwrap();
  const description = tag.meta()?.description;

  if (tag instanceof ZodEnum) {
    const options = [''].concat(tag.options);

    return (
      <NativeSelect
        label={tagName}
        description={description}
        data={options}
        error={formState.errors[tagName]?.message}
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
      className={baseInputStyles}
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
