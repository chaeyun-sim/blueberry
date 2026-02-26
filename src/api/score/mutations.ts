import { mutationOptions } from '@tanstack/react-query'
import {
  createArrangement,
  createArrangementFile,
  createSong,
  deleteArrangement,
  deleteArrangementFile,
  deleteSong,
  findSongByTitle,
  updateSong,
  uploadArrangementFile,
} from '.'
import { CreateArrangementFileInput, CreateArrangementInput, CreateSongInput, UpdateSongInput } from '@/types/score'

export const scoreMutations = {
  createSong: () =>
    mutationOptions({
      mutationFn: (input: CreateSongInput) => createSong(input),
    }),
  updateSong: () =>
    mutationOptions({
      mutationFn: ({ id, input }: { id: string; input: UpdateSongInput }) =>
        updateSong(id, input),
      retry: 1,
    }),
  deleteSong: () =>
    mutationOptions({
      mutationFn: ({ id }: { id: string }) => deleteSong(id),
      retry: 1,
    }),
  createArrangement: () =>
    mutationOptions({
      mutationFn: (input: CreateArrangementInput) => createArrangement(input),
    }),
  deleteArrangement: () =>
    mutationOptions({
      mutationFn: ({ id }: { id: string }) => deleteArrangement(id),
      retry: 1,
    }),
  uploadArrangementFile: () =>
    mutationOptions({
      mutationFn: async ({
        arrangementId,
        file,
        label,
        fileType,
      }: CreateArrangementFileInput) => {
        const publicUrl = await uploadArrangementFile(arrangementId, file, label)
        return createArrangementFile(arrangementId, label, fileType, publicUrl)
      },
    }),
  deleteArrangementFile: () =>
    mutationOptions({
      mutationFn: ({ id }: { id: string }) => deleteArrangementFile(id),
      retry: 1,
    }),
  findSongByTitle: () =>
    mutationOptions({
      mutationFn: ({ title }: {title: string}) => findSongByTitle(title),
    }),
}
