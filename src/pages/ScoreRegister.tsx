import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import Button from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FileEntry } from '@/types/form';
import { ZipUploadCard } from '@/components/pages/score/ZipUploadCard';
import ScoreRegisterForm from '@/components/pages/score/ScoreRegisterForm';

export interface ScoreRegisterFormType {
  songTitle: string;
  composer: string;
  instruments: string[];
  version: string | null;
  zipName: string | null;
  zipSize: number;
  files: FileEntry[];
}

const ScoreRegister = () => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<ScoreRegisterFormType>({
    songTitle: '',
    composer: '',
    instruments: [],
    version: null,
    zipName: null,
    zipSize: 0,
    files: [],
  })

  const handleZipUpload = (data: { zipName: string; zipSize: number; files: FileEntry[]; instruments: string[] }) => {
    setForm(prev => ({
      ...prev,
      zipName: data.zipName,
      zipSize: data.zipSize,
      files: data.files,
      ...(data.instruments.length > 0 ? { instruments: data.instruments } : {}),
    }));
  };

  const clearZip = () => {
    setForm(prev => ({ ...prev, zipName: null, zipSize: 0, files: [], instruments: [], songTitle: '', composer: '', version: null }));
  };

  return (
    <AppLayout>
      <div className='mb-6'>
        <Button
          variant='ghost'
          className='gap-2 text-muted-foreground hover:bg-foreground/5'
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className='h-4 w-4' /> 뒤로
        </Button>
      </div>
      <PageHeader
        title='악보 추가'
        description='새로운 악보를 등록합니다'
      />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <ZipUploadCard
          {...form}
          isSubmitting={isSubmitting}
          onUpload={handleZipUpload}
          onClear={clearZip}
          onFileLabelChange={(idx, label) =>
            setForm(prev => ({ ...prev, files: prev.files.map((f, i) => i === idx ? { ...f, label } : f) }))
          }
          onFileRemove={idx =>
            setForm(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }))
          }
        />

        {/* Right: Form */}
        <ScoreRegisterForm form={form} setForm={setForm} isSubmitting={isSubmitting} setIsSubmitting={setIsSubmitting} clearZip={clearZip} />
      </div>
    </AppLayout>
  );
};

export default ScoreRegister;
