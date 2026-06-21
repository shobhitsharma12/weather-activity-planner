import { KeyboardEvent } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  disabled?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  disabled,
}: SearchBarProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Enter a city (e.g. London, Aspen, Sydney)..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoFocus
      />
      <button
        className="search-button"
        onClick={onSearch}
        disabled={disabled || !value.trim()}
      >
        {disabled ? 'Searching...' : 'Search'}
      </button>
    </div>
  );
}
