import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileArchive, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { buildInstrumentList } from '@/utils/build-instrument-list';
import { parseInstrumentsFromZipName } from '@/utils/parse-instruments-from-zipName';
import { formatFileSize } from '@/utils/format-file-size';
import { detectFileType } from '@/utils/detect-file-type';
import { fileTypeConfig, ALLOWED_EXTENSIONS } from '@/constants/file-types';
import { FileEntry } from '@/types/form';
import { MAX_DECOMPRESSED, MAX_FILE_COUNT, MAX_ZIP_SIZE } from '@/constants/file-size';

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
    const entries: FileEntry[] = [];
    let totalSize = 0;
    let fileCount = 0;
    let aborted = false;

    try {
      const buffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(buffer);

      for (const [path, entry] of Object.entries(zip.files)) {
        if (entry.dir) continue;
        const fileName = path.split('/').pop() ?? path;
        if (fileName.startsWith('.') || path.startsWith('__MACOSX')) continue;
        const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
        if (!ALLOWED_EXTENSIONS.includes(ext)) continue;

        fileCount++;
        if (fileCount > MAX_FILE_COUNT) {
          toast.error('ZIP 내 파일이 100개를 초과합니다.');
          aborted = true;
          break;
        }

        const blob = await entry.async('blob');
        totalSize += blob.size;
        if (totalSize > MAX_DECOMPRESSED) {
          toast.error('압축 해제 크기가 500MB를 초과합니다.');
          aborted = true;
          break;
        }

        entries.push({
          file: new File([blob], fileName),
          label: fileName.replace(/\.[^.]+$/, ''),
          fileType: detectFileType(fileName),
        });
      }

      if (!aborted) {
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
      }
    } catch (e) {
      toast.error('ZIP 파일을 읽을 수 없습니다.', { description: (e as Error).message });
    } finally {
      setIsExtracting(false);
      if (zipInputRef.current) zipInputRef.current.value = '';
    }
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
          <div
            onClick={() => zipInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleZipFile(file); }}
            className='min-h-[300px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer'
          >
            <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center'>
              <FileArchive className='h-8 w-8 text-muted-foreground' />
            </div>
            <div className='text-center'>
              <p className='font-medium'>ZIP 파일을 드래그하거나 클릭하여 업로드</p>
              <p className='text-sm text-muted-foreground mt-1'>
                스코어, 파트보, MusicXML 파일이 담긴 ZIP
              </p>
            </div>
          </div>
        ) : (
          <div className='space-y-3'>
            <div className='flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/15'>
              <div className='flex items-center gap-3'>
                <FileArchive className='h-5 w-5 text-primary shrink-0' />
                <div>
                  <p className='text-sm font-medium truncate max-w-[200px]'>{zipName}</p>
                  <p className='text-xs text-muted-foreground'>
                    {formatFileSize(zipSize)}
                    {files.length > 0 && ` · ${files.length}개 파일`}
                  </p>
                </div>
              </div>
              <button
                onClick={onClear}
                disabled={isExtracting || isSubmitting}
                className='p-1 rounded hover:bg-foreground/5 transition-colors disabled:pointer-events-none'
              >
                <X className='h-4 w-4 text-muted-foreground' />
              </button>
            </div>

            {isExtracting ? (
              <div className='flex items-center justify-center gap-2 py-8 text-muted-foreground'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span className='text-sm'>압축 해제 중...</span>
              </div>
            ) : (
              <div className='space-y-1.5'>
                {files.map((entry, idx) => {
                  const config = fileTypeConfig[entry.fileType] ?? fileTypeConfig.score;
                  const Icon = config.icon;
                  return (
                    <div
                      key={idx}
                      className='flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group'
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${config.color}`} />
                      <input
                        className='flex-1 min-w-0 text-sm bg-transparent outline-none border-b border-transparent hover:border-border focus:border-primary transition-colors'
                        value={entry.label}
                        onChange={e => onFileLabelChange(idx, e.target.value)}
                        disabled={isSubmitting}
                      />
                      <span className='text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium shrink-0'>
                        {config.label}
                      </span>
                      <span className='text-xs text-muted-foreground tabular-nums shrink-0'>
                        {formatFileSize(entry.file.size)}
                      </span>
                      <button
                        type='button'
                        onClick={() => onFileRemove(idx)}
                        disabled={isSubmitting}
                        className='opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive disabled:pointer-events-none'
                      >
                        <X className='h-3.5 w-3.5' />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {files.length > 0 && (
              <div className='flex flex-wrap gap-2 pt-2 border-t border-border/50'>
                {Object.entries(fileTypeConfig).map(([key, config]) => {
                  const count = files.filter(f => f.fileType === key).length;
                  if (count === 0) return null;
                  return (
                    <span
                      key={key}
                      className='text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground flex items-center gap-1'
                    >
                      <span className='w-1.5 h-1.5 rounded-full' style={{ backgroundColor: config.dot }} />
                      {config.label} {count}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
