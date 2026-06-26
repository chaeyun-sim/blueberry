import { Pencil } from 'lucide-react';
import { InputHTMLAttributes, ReactNode, useRef, useState } from 'react';

interface InlineEditFieldProps extends InputHTMLAttributes<HTMLInputElement> {
	ariaLabel: string;
	buttonClassName: string;
	emptyDisplay: ReactNode;
	displayContent: ReactNode;
}

export function InlineEditField({
	value,
	onChange,
	placeholder,
	ariaLabel,
	buttonClassName,
	emptyDisplay,
	displayContent,
	...rest
}: InlineEditFieldProps) {
	const [isEditing, setIsEditing] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const startEditing = () => {
		setIsEditing(true);
		setTimeout(() => inputRef.current?.focus(), 0);
	};

	const stopEditing = () => setIsEditing(false);

	if (isEditing) {
		return (
			<input
				ref={inputRef}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				onBlur={stopEditing}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === 'Escape') stopEditing();
				}}
				{...rest}
			/>
		);
	}

	return (
		<button
			type='button'
			onClick={startEditing}
			className={buttonClassName}
			aria-label={ariaLabel}
		>
			{value ? displayContent : emptyDisplay}
			<Pencil className='h-3 w-3 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity shrink-0' />
		</button>
	);
}
