import { useState, useRef, DragEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { buildInstrumentList } from '@/utils/build-instrument-list';
import { parseInstrumentsFromZipName } from '@/utils/parse-instruments-from-zipName';
import { fileTypeConfig } from '@/constants/file-types';
import { MAX_ZIP_SIZE } from '@/constants/file-size';
import { FileEntry } from '@/types/form';
import { extractZipEntries, ZipExtractionError } from '@/utils/extract-zip-entries';
import DropZone from '../commission/Dropzone';
import FileEntryList from './FileEntryList';
import ZipFileHeader from '../commission/ZipFileHeader';
import FileTypeSummary from './FileTypeSummary';

interface ZipUploadCardProps {
  zipName: string | null;
  zipSize: number;
  files: FileEntry[];
  isSubmitting: boolean;
  onUpload: (data: {
    zipName: string;
    zipSize: number;
    files: FileEntry[];
    instruments: string[];
  }) => void;
  onClear: () => void;
  onFileLabelChange: (idx: number, label: string) => void;
  onFileRemove: (idx: number) => void;
}

export function ZipUploadCard({
  zipName,
  zipSize,
  files,
  isSubmitting,
  onUpload,
  onClear,
  onFileLabelChange,
  onFileRemove,
}: ZipUploadCardProps) {
  const zipInputRef = useRef<HTMLInputElement>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleZipFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      toast.error('ZIP 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > MAX_ZIP_SIZE) {
      toast.error('ZIP 파일 크기는 200MB 이하여야 합니다.');
      return;
    }

    setIsExtracting(true);
    try {
      const buffer = await file.arrayBuffer();
      const entries = await extractZipEntries(buffer);
      const parsed = parseInstrumentsFromZipName(file.name);

      onUpload({
        zipName: file.name,
        zipSize: file.size,
        files: entries,
        instruments: parsed.length > 0 ? buildInstrumentList(parsed) : [],
      });

      if (parsed.length === 0) {
        toast.info('악기 정보를 자동으로 인식하지 못했습니다. 직접 입력해주세요.');
      }
    } catch (e) {
      const message = e instanceof ZipExtractionError
        ? e.message
        : 'ZIP 파일을 읽을 수 없습니다.';
      toast.error(message, e instanceof ZipExtractionError ? undefined : { description: (e as Error).message });
    } finally {
      setIsExtracting(false);
      if (zipInputRef.current) zipInputRef.current.value = '';
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleZipFile(file);
  };

  return (
    <Card className='border-border/50'>
      <CardContent className='p-5'>
        <h2 className='font-display font-semibold mb-4'>악보 파일</h2>

        <input
          ref={zipInputRef}
          type='file'
          accept='.zip'
          className='hidden'
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleZipFile(file);
          }}
        />

        {!zipName ? (
          <DropZone
            onClick={() => zipInputRef.current?.click()}
            onDrop={handleDrop}
            className='min-h-[300px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer'
          />
        ) : (
          <div className='space-y-3'>
            <ZipFileHeader
              name={zipName}
              size={zipSize}
              fileCount={files.length}
              onClear={onClear}
              disabled={isExtracting || isSubmitting}
            />

            {isExtracting ? (
              <div className='flex items-center justify-center gap-2 py-8 text-muted-foreground'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span className='text-sm'>압축 해제 중...</span>
              </div>
            ) : (
              <FileEntryList
                files={files}
                isSubmitting={isSubmitting}
                onLabelChange={onFileLabelChange}
                onRemove={onFileRemove}
              />
            )}

            {files.length > 0 && <FileTypeSummary files={files} />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
