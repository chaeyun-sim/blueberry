import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ImageIcon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useRef } from 'react';
import { analyzeCommissionImage } from '@/api/commission';

type AnalyzeResult = Awaited<ReturnType<typeof analyzeCommissionImage>>

interface AnalyzeImageProps {
  url: string | null;
  file: File | null;
  setImage: ({ url, file }: { url: string | null; file: File | null }) => void;
  setForm: (form: AnalyzeResult) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
}

function AnalyzeImage({
  url,
  file,
  setImage,
  setForm,
  isAnalyzing,
  setIsAnalyzing,
}: AnalyzeImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      setImage({ url: e.target?.result as string, file });
    };
    reader.readAsDataURL(file);
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) loadImageFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImageFile(file);
  };

  const handleAnalyze = async () => {
    if (!url || !file) return;
    setIsAnalyzing(true);
    const start = performance.now();
    try {
      const base64 = url.split(',')[1];
      const result = await analyzeCommissionImage(base64, file.type);
      setForm(result);
      const elapsed = ((performance.now() - start) / 1000).toFixed(2);
      toast.success(`AI 분석 완료 (${elapsed}초)`);
    } catch {
      toast.error('AI 분석에 실패했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className='border-border/50'>
      <CardContent className='p-5'>
        <h2 className='font-display font-semibold mb-4'>원본 이미지</h2>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={handleFileChange}
        />
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleImageDrop}
          onClick={() => fileInputRef.current?.click()}
          className='relative min-h-[300px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer'
        >
          {isAnalyzing && (
            <div className='absolute inset-0 rounded-lg overflow-hidden'>
              <div className='absolute left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent animate-scan-line' />
            </div>
          )}
          {url ? (
            <>
              <img
                src={url}
                alt='업로드된 이미지'
                className='max-h-[400px] rounded-md object-contain'
              />
              <button
                type='button'
                onClick={e => {
                  e.stopPropagation();
                  setImage({ url: null, file: null });
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className='absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background border border-border transition-colors'
              >
                <X className='h-4 w-4' />
              </button>
            </>
          ) : (
            <>
              <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center'>
                <ImageIcon className='h-8 w-8 text-muted-foreground' />
              </div>
              <div className='text-center'>
                <p className='font-medium text-sm md:text-base'>이미지를 드래그하거나 클릭하여 업로드</p>
                <p className='text-xs md:text-base text-muted-foreground mt-1'>
                  카카오톡 캡처 이미지를 붙여넣을 수도 있습니다
                </p>
              </div>
            </>
          )}
        </div>
        <div className='mt-4 flex justify-center'>
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !url}
            className='gap-2 text-white border-0 hover:opacity-90'
            style={{
              background:
                'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #8a3ab9, #4c68d7, #6b5ce7)',
            }}
          >
            <Sparkles className='h-4 w-4' />
            {isAnalyzing ? 'AI 분석 중...' : 'AI로 분석하기'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AnalyzeImage;

