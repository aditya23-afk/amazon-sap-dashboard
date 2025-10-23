import React from 'react';
import { Link, LinkProps } from '@mui/material';
import { ARIA_LABELS } from '../../utils/accessibility';

interface SkipLinkProps extends Omit<LinkProps, 'href'> {
  targetId: string;
  children?: React.ReactNode;
}

/**
 * Skip link component for keyboard navigation accessibility
 */
export const SkipLink: React.FC<SkipLinkProps> = ({ 
  targetId, 
  children = 'Skip to main content',
  ...props 
}) => {
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Link
      {...props}
      href={`#${targetId}`}
      onClick={handleClick}
      className={`skip-link ${props.className || ''}`}
      sx={{
        position: 'absolute',
        top: -40,
        left: 6,
        background: 'common.black',
        color: 'common.white',
        padding: 1,
        textDecoration: 'none',
        zIndex: 9999,
        borderRadius: 1,
        fontWeight: 600,
        '&:focus': {
          top: 6,
        },
        ...props.sx,
      }}
      aria-label={ARIA_LABELS.SKIP_TO_CONTENT}
    >
      {children}
    </Link>
  );
};

export default SkipLink;