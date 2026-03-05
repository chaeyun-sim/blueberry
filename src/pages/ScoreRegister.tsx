import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { FileEntry } from '@/types/form';
import { ZipUploadCard } from '@/components/pages/score/ZipUploadCard';
import ScoreRegisterForm from '@/components/pages/score/ScoreRegisterForm';
import AppHeader from '@/components/layout/AppHeader';

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
      <AppHeader>
        <AppHeader.Back />
      </AppHeader>
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
