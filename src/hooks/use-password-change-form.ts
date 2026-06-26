import { Session } from '@supabase/supabase-js';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

type PwFormField = 'current' | 'next' | 'confirm';
type PwForm = Record<PwFormField, string>;
type ShowPw = Record<PwFormField, boolean>;

const EMPTY_FORM: PwForm = { current: '', next: '', confirm: '' };
const HIDDEN_PW: ShowPw = { current: false, next: false, confirm: false };

export function usePasswordChangeForm(session: Session | null) {
	const [pwOpen, setPwOpen] = useState(false);
	const [pwLoading, setPwLoading] = useState(false);
	const [pwForm, setPwForm] = useState<PwForm>(EMPTY_FORM);
	const [showPw, setShowPw] = useState<ShowPw>(HIDDEN_PW);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (pwForm.next !== pwForm.confirm) {
			toast.error('새 비밀번호가 일치하지 않아요');
			return;
		}
		if (pwForm.next.length < 6) {
			toast.error('비밀번호는 6자 이상이어야 해요');
			return;
		}
		setPwLoading(true);
		try {
			const { error: verifyError } = await supabase.auth.signInWithPassword({
				email: session!.user.email!,
				password: pwForm.current,
			});
			if (verifyError) {
				toast.error('현재 비밀번호가 올바르지 않아요');
				return;
			}
			const { error } = await supabase.auth.updateUser({ password: pwForm.next });
			if (error) throw error;
			toast.success('비밀번호가 변경됐어요');
			setPwForm(EMPTY_FORM);
			setPwOpen(false);
		} catch (e) {
			toast.error('비밀번호 변경에 실패했어요', {
				description: e instanceof Error ? e.message : String(e),
			});
		} finally {
			setPwLoading(false);
		}
	};

	return { pwOpen, setPwOpen, pwLoading, pwForm, setPwForm, showPw, setShowPw, handleSubmit };
}
