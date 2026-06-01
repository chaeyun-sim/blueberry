import { RefObject } from 'react';
import { Pencil } from 'lucide-react';

interface InlineEditFieldProps {
	value: string;
	isEditing: boolean;
	inputRef: RefObject<HTMLInputElement>;
	onChange: (value: string) => void;
	onStartEditing: () => void;
	onStopEditing: () => void;
	placeholder: string;
	ariaLabel: string;
	inputClassName: string;
	buttonClassName: string;
	emptyDisplay: React.ReactNode;
	displayContent: React.ReactNode;
}

export function InlineEditField({
	value,
	isEditing,
	inputRef,
	onChange,
	onStartEditing,
	onStopEditing,
	placeholder,
	ariaLabel,
	inputClassName,
	buttonClassName,
	emptyDisplay,
	displayContent,
}: InlineEditFieldProps) {
	if (isEditing) {
		return (
			<input
				ref={inputRef}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onBlur={onStopEditing}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === 'Escape') onStopEditing();
				}}
				className={inputClassName}
				placeholder={placeholder}
			/>
		);
	}

	return (
		<button
			type='button'
			onClick={onStartEditing}
			className={buttonClassName}
			aria-label={ariaLabel}
		>
			{value ? displayContent : emptyDisplay}
			<Pencil className='h-3 w-3 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity shrink-0' />
		</button>
	);
}
