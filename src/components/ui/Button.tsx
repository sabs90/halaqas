import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'whatsapp';

const variantStyles: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-light active:bg-primary-dark',
  secondary: 'bg-secondary text-white hover:bg-secondary-light active:bg-secondary-dark',
  outline: 'bg-white text-charcoal border border-sand-dark hover:text-primary hover:border-primary',
  ghost: 'bg-primary/[0.06] text-primary hover:bg-primary/[0.12]',
  whatsapp: 'bg-white text-[#25D366] border border-sand-dark hover:border-[#25D366]',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  href?: string;
}

export function Button({ variant = 'primary', className = '', children, href, ...props }: ButtonProps) {
  const styles = `inline-flex items-center justify-center gap-2 text-sm font-semibold px-[22px] py-[10px] rounded-button transition-colors ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={styles}>
        {children}
      </a>
    );
  }

  return (
    <button className={styles} {...props}>
      {children}
    </button>
  );
}
