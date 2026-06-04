import {
  type ButtonProps,
  buttonVariants,
  Button as HeroButton,
} from '@heroui/react';
import { tv } from 'tailwind-variants';

const customButtonVariants = tv({
  extend: buttonVariants,
  variants: {
    variant: {
      success: 'bg-success hover:bg-success-hover text-success-foreground',
    },
  },
});

interface Props extends Omit<ButtonProps, 'variant'> {
  className?: string;
  variant?: ButtonProps['variant'] | 'success';
}

function Button({ className, variant, ...props }: Props) {
  return (
    <HeroButton
      className={customButtonVariants({ className, variant })}
      {...props}
    />
  );
}

export default Button;
