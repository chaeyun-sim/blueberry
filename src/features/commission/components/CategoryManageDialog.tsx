import { useMutation, useQuery } from '@tanstack/react-query';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { commissionKeys, commissionMutations, commissionQueries } from '@/features/commission/api';
import { queryClient } from '@/utils/query-client';

interface CategoryManageDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CategoryManageDialog({ open, onOpenChange }: CategoryManageDialogProps) {
	const { data: categories = [] } = useQuery(commissionQueries.getCategories());
	const [newCatName, setNewCatName] = useState('');
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingName, setEditingName] = useState('');

	const invalidate = () => queryClient.invalidateQueries({ queryKey: commissionKeys.categories() });

	const { mutate: createCategory, isPending: isCreating } = useMutation({
		...commissionMutations.createCategory(),
		onSuccess: () => { setNewCatName(''); invalidate(); },
		onError: (e) => toast.error('카테고리 추가에 실패했어요', { description: e.message }),
	});

	const { mutate: updateCategory, isPending: isUpdating } = useMutation({
		...commissionMutations.updateCategory(),
		onSuccess: () => { setEditingId(null); invalidate(); },
		onError: (e) => toast.error('카테고리 수정에 실패했어요', { description: e.message }),
	});

	const { mutate: deleteCategory } = useMutation({
		...commissionMutations.deleteCategory(),
		onSuccess: invalidate,
		onError: (e) => toast.error('카테고리 삭제에 실패했어요', { description: e.message }),
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-sm'>
				<DialogHeader>
					<DialogTitle className='font-display'>카테고리 관리</DialogTitle>
				</DialogHeader>

				<div className='space-y-2 pt-1'>

					{categories.map((cat) => (
						<div key={cat.id} className='flex items-center gap-2'>
							{editingId === cat.id ? (
								<>
									<Input
										ref={(el) => { el?.focus(); }}
										value={editingName}
										onChange={(e) => setEditingName(e.target.value)}
										className='h-8 text-sm flex-1'
										onKeyDown={(e) => {
											if (e.key === 'Enter') updateCategory({ id: cat.id, name: editingName });
											if (e.key === 'Escape') setEditingId(null);
										}}
									/>
									<button
										type='button'
										onClick={() => updateCategory({ id: cat.id, name: editingName })}
										disabled={isUpdating || !editingName.trim()}
										className='p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors disabled:opacity-40'
										aria-label='저장'
									>
										<Check className='w-3.5 h-3.5' />
									</button>
									<button
										type='button'
										onClick={() => setEditingId(null)}
										className='p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors'
										aria-label='취소'
									>
										<X className='w-3.5 h-3.5' />
									</button>
								</>
							) : (
								<>
									<span className='text-sm flex-1 truncate'>{cat.name}</span>
									<button
										type='button'
										onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
										className='p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors'
										aria-label='편집'
									>
										<Pencil className='w-3.5 h-3.5' />
									</button>
									<button
										type='button'
										onClick={() => deleteCategory({ id: cat.id })}
										className='p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors'
										aria-label='삭제'
									>
										<Trash2 className='w-3.5 h-3.5' />
									</button>
								</>
							)}
						</div>
					))}

					<div className='flex items-center gap-2 pt-2'>
						<Input
							value={newCatName}
							onChange={(e) => setNewCatName(e.target.value)}
							placeholder='새 카테고리 이름...'
							className='h-8 text-sm flex-1'
							onKeyDown={(e) => {
								if (e.key === 'Enter' && !e.nativeEvent.isComposing && newCatName.trim() && !isCreating) {
									e.preventDefault();
									createCategory({ name: newCatName.trim() });
								}
							}}
						/>
						<button
							type='button'
							onClick={() => { if (newCatName.trim()) createCategory({ name: newCatName.trim() }); }}
							disabled={isCreating || !newCatName.trim()}
							className='p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors disabled:opacity-40'
							aria-label='카테고리 추가'
						>
							<Plus className='w-4 h-4' />
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
