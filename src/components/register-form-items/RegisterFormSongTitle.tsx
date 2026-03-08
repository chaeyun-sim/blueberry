import { useId } from 'react';
import Label from '../ui/label';
import Autocomplete, { AutocompleteProps } from '../Autocomplete';

function RegisterFormSongTitle({ value, onChange, suggestions, inputProps }: AutocompleteProps) {
  const inputId = useId();
  return (
    <div className='space-y-2'>
      <Label htmlFor={inputId}>곡명</Label>
      <Autocomplete
        value={value}
        onChange={onChange}
        suggestions={suggestions}
        placeholder='곡명을 입력하세요'
        inputProps={{ id: inputId, ...inputProps }}
      />
    </div>
  );
}

export default RegisterFormSongTitle;
