import { mutationOptions } from '@tanstack/react-query'
import {
  createArrangement,
  createSong,
  deleteArrangement,
  deleteArrangementFile,
  deleteSong,
  updateSong,
  uploadArrangementFile,
} from '.'
import { CreateArrangementInput, CreateSongInput, UpdateSongInput } from '@/types/score'

export const scoreMutations = {
  createSong: () =>
    mutationOptions({
      mutationFn: (input: CreateSongInput) => createSong(input),
    }),
  updateSong: () =>
    mutationOptions({
      mutationFn: ({ id, input }: { id: string; input: UpdateSongInput }) =>
        updateSong(id, input),
    }),
  deleteSong: () =>
    mutationOptions({
      mutationFn: ({ id }: { id: string }) => deleteSong(id),
    }),
  createArrangement: () =>
    mutationOptions({
      mutationFn: (input: CreateArrangementInput) => createArrangement(input),
    }),
  deleteArrangement: () =>
    mutationOptions({
      mutationFn: ({ id }: { id: string }) => deleteArrangement(id),
    }),
  uploadArrangementFile: () =>
    mutationOptions({
      mutationFn: ({
        arrangementId,
        file,
        label,
        fileType,
      }: {
        arrangementId: string
        file: File
        label: string
        fileType: string
      }) => uploadArrangementFile(arrangementId, file, label, fileType),
    }),
  deleteArrangementFile: () =>
    mutationOptions({
      mutationFn: ({ id }: { id: string }) => deleteArrangementFile(id),
    }),
}
