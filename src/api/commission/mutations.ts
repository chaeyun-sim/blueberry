import { mutationOptions } from '@tanstack/react-query';
import { createCommission, deleteCommission, updateCommission, uploadCommissionImage } from '.';
import { CreateCommissionInput, UpdateCommissionInput } from '@/types/commission';

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
};
