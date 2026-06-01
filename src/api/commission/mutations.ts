import { mutationOptions } from '@tanstack/react-query';
import { createCommission, ConcurrencyConflictError, deleteCommission, updateCommission, updateCommissionStatus, uploadCommissionImage } from '.';
import { Commission, CreateCommissionInput, UpdateCommissionInput } from '@/types/commission';
import { CommissionStatus } from '@/constants/status-config';

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
      mutationFn: async ({ commissionId, file }: { commissionId: string; file: File }): Promise<Commission> => {
        const publicUrl = await uploadCommissionImage(commissionId, file)
        return updateCommission(commissionId, { image_url: publicUrl })
      },
    }),
  updateCommissionStatus: () =>
    mutationOptions({
      mutationFn: ({
        commissionId,
        status,
        prevStatus,
      }: {
        commissionId: string;
        status: CommissionStatus;
        prevStatus: CommissionStatus;
      }) => updateCommissionStatus(commissionId, status, prevStatus),
      // Never retry concurrency conflicts — the stale status must be refreshed by the user.
      // Retry once for transient network errors.
      retry: (failureCount, error) =>
        !(error instanceof ConcurrencyConflictError) && failureCount < 1,
    }),
};
