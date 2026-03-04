import Label from '../ui/label';
import Autocomplete, { AutocompleteProps } from '../Autocomplete';

function RegisterFormSongTitle({ value, onChange, suggestions, inputProps }: AutocompleteProps) {
  return (
    <div className='space-y-2'>
      <Label>곡명</Label>
      <Autocomplete
        value={value}
        onChange={onChange}
        suggestions={suggestions}
        placeholder='곡명을 입력하세요'
        inputProps={inputProps}
      />
    </div>
  );
}

export default RegisterFormSongTitle;
