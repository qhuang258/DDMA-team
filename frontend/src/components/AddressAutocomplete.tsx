import { useEffect, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

// SF service area bounding box — matches backend polygon
const SF_BOUNDS = {
  north: 37.8120,
  south: 37.7080,
  east: -122.3550,
  west: -122.5150,
};

interface Props {
  placeholder?: string;
  prefix?: React.ReactNode;
  onSelect: (address: string, lat: number, lng: number) => void;
  onClear: () => void;
  status?: 'error' | '';
  disabled?: boolean;
  style?: React.CSSProperties;
}

export function AddressAutocomplete({
  placeholder,
  prefix,
  onSelect,
  onClear,
  status,
  disabled,
  style,
}: Props) {
  const placesLib = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement>(null);
  const hasSelectedRef = useRef(false);

  // Keep callbacks in refs so effects don't re-run when parent re-renders
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onClearRef = useRef(onClear);
  onClearRef.current = onClear;

  // Native input listener: detects edits after a place was selected
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const handleInput = () => {
      if (hasSelectedRef.current) {
        // User edited after selecting — invalidate the selection
        hasSelectedRef.current = false;
        onClearRef.current();
      } else if (el.value === '') {
        onClearRef.current();
      }
    };

    el.addEventListener('input', handleInput);
    return () => el.removeEventListener('input', handleInput);
  }, []);

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    const autocomplete = new placesLib.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'us' },
      bounds: SF_BOUNDS,
      strictBounds: true,
      fields: ['formatted_address', 'geometry'],
    });

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location && place.formatted_address) {
        hasSelectedRef.current = true;
        onSelectRef.current(
          place.formatted_address,
          place.geometry.location.lat(),
          place.geometry.location.lng(),
        );
        // Blur dismisses the dropdown and gives a clear "confirmed" signal
        inputRef.current?.blur();
      }
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [placesLib]);

  const isError = status === 'error';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        border: `1px solid ${isError ? '#ff4d4f' : '#d9d9d9'}`,
        borderRadius: 6,
        padding: '0 11px',
        height: 40,
        background: disabled ? '#f5f5f5' : '#ffffff',
        gap: 8,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: isError ? '0 0 0 2px rgba(255, 77, 79, 0.2)' : 'none',
        ...style,
      }}
    >
      {prefix && (
        <span style={{ display: 'flex', alignItems: 'center', color: '#bfbfbf', flexShrink: 0 }}>
          {prefix}
        </span>
      )}
      <input
        ref={inputRef}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          fontSize: 16,
          background: 'transparent',
          color: disabled ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.88)',
          fontFamily: 'inherit',
          minWidth: 0,
        }}
      />
    </div>
  );
}
