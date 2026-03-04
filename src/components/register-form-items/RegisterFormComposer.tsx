import Label from '@/components/ui/label';
import Autocomplete, { AutocompleteProps } from '@/components/Autocomplete';

function RegisterFormComposer({ value, onChange, suggestions, inputProps }: AutocompleteProps) {
  return (
    <div className='space-y-2'>
      <Label>작곡가</Label>
      <Autocomplete
        value={value}
        onChange={onChange}
        placeholder='작곡가를 입력하세요'
        suggestions={suggestions}
        inputProps={inputProps}
      />
    </div>
  );
}

export default RegisterFormComposer;
