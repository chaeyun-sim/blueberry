import { mutationOptions } from '@tanstack/react-query'
import { ExcelRow } from '@/types/excel'
import { deleteExcelUpload,saveSalesRows } from '.'

export const statsMutations = {
  saveSalesRows: () =>
    mutationOptions({
      mutationFn: ({ rows, name }: { rows: ExcelRow[]; name: string }) =>
        saveSalesRows(rows, name),
    }),
  deleteExcelUpload: () =>
    mutationOptions({
      mutationFn: (id: string) => deleteExcelUpload(id),
    }),
}
