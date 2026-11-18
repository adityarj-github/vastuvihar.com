'use client';

import { useEffect, useId, useRef, useState } from 'react';

/**
 * Custom, form-compatible select used by ProjectEnquiry.
 * - Keeps a native select for browser validation and FormData submission.
 * - Renders a scrollable (max 600px) popup.
 * - Supports arrows, Home/End, Enter/Space, Escape, and outside-click dismissal.
 */
export default function VVEnquirySelect({
  id,
  name,
  label,
  placeholder,
  options = [],
  required = false,
  defaultValue = '',
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const optionRefs = useRef([]);
  const generatedId = useId();
  const listId = `${generatedId}-listbox`;
  const labelId = `${generatedId}-label`;

  const items = options.map((option) =>
    typeof option === 'string'
      ? { value: option, label: option }
      : option
  );
  const selectedIndex = items.findIndex((item) => item.value === value);
  const selected = items[selectedIndex];
  const displayValue = selected?.label ?? placeholder;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  useEffect(() => {
    if (open && selectedIndex >= 0) {
      optionRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, selectedIndex]);

  const choose = (nextValue) => {
    setValue(nextValue);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const move = (direction) => {
    if (!items.length) return;
    const nextIndex = direction === 'first'
      ? 0
      : direction === 'last'
        ? items.length - 1
        : Math.max(0, Math.min(items.length - 1, selectedIndex + direction));
    setValue(items[nextIndex].value);
    setOpen(true);
    requestAnimationFrame(() => {
      optionRefs.current[nextIndex]?.scrollIntoView({ block: 'nearest' });
    });
  };

  const onTriggerKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      move(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      move(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      move('first');
    } else if (event.key === 'End') {
      event.preventDefault();
      move('last');
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen((previous) => !previous);
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div className={`vv-enquiry-select${open ? ' vv-enquiry-select--open' : ''}`} ref={rootRef}>
      {/* Keeping the actual select in the form preserves existing field names,
          ContactForm FormData usage, and native required validation. */}
      <select
        className="vv-enquiry-select__native"
        id={id}
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        required={required}
        tabIndex={-1}
        aria-label={label || placeholder}
        onInvalid={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
      >
        <option value="">{placeholder}</option>
        {items.filter((item) => item.value !== '').map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>

      <button
        ref={triggerRef}
        className="vv-enquiry-select__trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={labelId}
        onClick={() => setOpen((previous) => !previous)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="vv-enquiry-select__trigger-text">
          <span id={labelId} className="vv-enquiry-select__label">{label || placeholder}</span>
          <span className="vv-enquiry-select__value">{displayValue}</span>
        </span>
        <svg className="vv-enquiry-select__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          ref={listRef}
          id={listId}
          className="vv-enquiry-select__dropdown"
          role="listbox"
          aria-label={label || placeholder}
        >
          {items.map((item, index) => (
            <button
              ref={(element) => { optionRefs.current[index] = element; }}
              type="button"
              role="option"
              aria-selected={value === item.value}
              tabIndex={-1}
              key={`${item.value}-${index}`}
              className={`vv-enquiry-select__option${value === item.value ? ' vv-enquiry-select__option--selected' : ''}`}
              onClick={() => choose(item.value)}
            >
              <span>{item.label}</span>
              {value === item.value && (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m5 12 4 4L19 6" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
