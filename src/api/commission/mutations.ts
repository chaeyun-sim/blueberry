import { mutationOptions } from '@tanstack/react-query';
import { createCommission, deleteCommission, updateCommission, updateCommissionStatus, uploadCommissionImage } from '.';
import { CreateCommissionInput, UpdateCommissionInput } from '@/types/commission';
import { CommissionStatus } from '@/components/StatusBadge';

export const commissionMutations = {
  createCommission: () =>
    mutationOptions({
      mutationFn: (input: CreateCommissionInput) => createCommission(input),
    }),
  updateCommission: () =>
    mutationOptions({
      mutationFn: ({
        commissionId,
        input,
      }: {
        commissionId: string;
        input: UpdateCommissionInput;
      }) => updateCommission(commissionId, input),
      retry: 1,
    }),
  deleteCommission: () =>
    mutationOptions({
      mutationFn: ({ commissionId }: { commissionId: string }) => deleteCommission(commissionId),
    }),
  uploadCommissionImage: () =>
    mutationOptions({
      mutationFn: ({ commissionId, file }: { commissionId: string; file: File }) =>
        uploadCommissionImage(commissionId, file),
    }),
  updateCommissionStatus: () =>
    mutationOptions({
      mutationFn: ({ commissionId, status }: { commissionId: string; status: CommissionStatus }) =>
        updateCommissionStatus(commissionId, status),
      retry: 1,
    }),
};
