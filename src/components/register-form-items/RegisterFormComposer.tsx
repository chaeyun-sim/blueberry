import { useId } from 'react';
import Label from '@/components/ui/label';
import Autocomplete, { AutocompleteProps } from '@/components/Autocomplete';

function RegisterFormComposer({ value, onChange, suggestions, inputProps }: AutocompleteProps) {
  const inputId = useId();
  return (
    <div className='space-y-2'>
      <Label htmlFor={inputId}>작곡가</Label>
      <Autocomplete
        value={value}
        onChange={onChange}
        placeholder='작곡가를 입력하세요'
        suggestions={suggestions}
        inputProps={{ id: inputId, ...inputProps }}
      />
    </div>
  );
}

export default RegisterFormComposer;
