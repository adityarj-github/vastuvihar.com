'use client';

import Link from 'next/link';
import './VVArrowButton.css';

/**
 * Props for a shared Vastu Vihar arrow CTA.
 *
 * Every property is optional because the component supports both:
 * - links:   <VVArrowButton href="/contact/" label="Contact us" />
 * - buttons: <VVArrowButton type="submit" label="Post Comment" />
 *
 * @typedef {object} VVArrowButtonProps
 * @property {string} [href]                       Internal or external link destination.
 * @property {string} [label]                      Visible button text.
 * @property {import('react').ReactNode} [children] Custom visible content (overrides label).
 * @property {import('react').MouseEventHandler<HTMLButtonElement>} [onClick]
 * @property {'button' | 'submit' | 'reset'} [type]
 * @property {boolean} [iconOnly]
 * @property {string} [ariaLabel]
 * @property {boolean} [disabled]
 * @property {boolean} [prefetch]
 * @property {string} [className]
 * @property {string} [target]
 * @property {string} [rel]
 * @property {string} [id]
 * @property {string} [title]
 */

/**
 * Reusable outlined button with the original About-page Spaciaz
 * two-arrow diagonal sliding hover animation.
 *
 * @param {VVArrowButtonProps} props
 */
export default function VVArrowButton({
  href,
  label,
  children,
  onClick,
  type = 'button',
  iconOnly = false,
  ariaLabel,
  disabled = false,
  prefetch = false,
  className = '',
  target,
  rel,
  ...rest
}) {
  const caption = children ?? label;
  const classes = [
    'vv-arrow-button',
    iconOnly && 'vv-arrow-button--icon-only',
    disabled && 'vv-arrow-button--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {!iconOnly && <span className="vv-arrow-button__text">{caption}</span>}
      <span className="vv-arrow-button__icon" aria-hidden="true">
        <span className="vv-arrow-button__icon-clip">
          <span className="vv-arrow-button__arrow">
            <i className="spaciaz-icon-arrow-long-right" />
          </span>
          <span className="vv-arrow-button__arrow vv-arrow-button__arrow--hover">
            <i className="spaciaz-icon-arrow-long-right" />
          </span>
        </span>
      </span>
    </>
  );

  const accessibleLabel =
    ariaLabel ?? (typeof caption === 'string' ? caption : undefined);

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={classes}
        prefetch={prefetch}
        aria-label={accessibleLabel}
        target={target}
        rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
        {...rest}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      aria-label={accessibleLabel}
      disabled={disabled}
      {...rest}
    >
      {content}
    </button>
  );
}
