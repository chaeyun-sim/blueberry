import { mutationOptions } from '@tanstack/react-query'
import { saveSalesRows, deleteExcelUpload } from '.'
import { ExcelRow } from '@/components/ExcelUploadDialog'

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
