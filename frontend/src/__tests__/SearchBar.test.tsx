import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../components/SearchBar';

describe('SearchBar', () => {
  it('renders a text input and a Search button', () => {
    render(<SearchBar value="" onChange={() => {}} onSearch={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument();
  });

  it('displays the current value in the input', () => {
    render(<SearchBar value="Tokyo" onChange={() => {}} onSearch={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('Tokyo');
  });

  it('calls onChange when the user types', async () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} onSearch={() => {}} />);
    await userEvent.type(screen.getByRole('textbox'), 'A');
    expect(onChange).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith('A');
  });

  it('calls onSearch when the Search button is clicked', async () => {
    const onSearch = vi.fn();
    render(<SearchBar value="London" onChange={() => {}} onSearch={onSearch} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onSearch).toHaveBeenCalledOnce();
  });

  it('calls onSearch when Enter is pressed inside the input', () => {
    const onSearch = vi.fn();
    render(<SearchBar value="Paris" onChange={() => {}} onSearch={onSearch} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(onSearch).toHaveBeenCalledOnce();
  });

  it('does NOT call onSearch when a non-Enter key is pressed', () => {
    const onSearch = vi.fn();
    render(<SearchBar value="Paris" onChange={() => {}} onSearch={onSearch} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'a' });
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('disables the button when value is an empty string', () => {
    render(<SearchBar value="" onChange={() => {}} onSearch={() => {}} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables the button when value is only whitespace', () => {
    render(<SearchBar value="   " onChange={() => {}} onSearch={() => {}} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('enables the button when value has content', () => {
    render(<SearchBar value="Berlin" onChange={() => {}} onSearch={() => {}} />);
    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('disables both input and button when disabled prop is true', () => {
    render(
      <SearchBar value="Sydney" onChange={() => {}} onSearch={() => {}} disabled />
    );
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows "Searching..." label when disabled', () => {
    render(
      <SearchBar value="Sydney" onChange={() => {}} onSearch={() => {}} disabled />
    );
    expect(screen.getByRole('button')).toHaveTextContent('Searching...');
  });
});
