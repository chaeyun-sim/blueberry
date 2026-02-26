import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnalyzeImage from '@/components/pages/commission/AnalyzeImage';
import CommissionRegisterForm from '@/components/pages/commission/CommissionRegisterForm';
import { buildInstrumentList } from '@/utils/build-instrument-list';
import { CommissionRegisterFormType } from '@/types/form';

const CommissionRegister = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<CommissionRegisterFormType>({
    imagePreview: null,
    instruments: [],
    songTitle: '',
    composer: '',
    version: null,
    deadline: '',
    notes: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Share Target: 다른 앱에서 공유된 이미지 자동 로드
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('shared') !== 'true') return;
    (async () => {
      try {
        const cache = await caches.open('blueberry-share');
        const res = await cache.match('/shared-image');
        if (!res) return;
        const blob = await res.blob();
        const file = new File([blob], 'shared-image.jpg', { type: blob.type || 'image/jpeg' });
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        setForm(prev => ({ ...prev, imagePreview: dataUrl }));
        setImageFile(file);
        await cache.delete('/shared-image');
      } catch { /* 무시 */ }
    })();
  }, []);

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
        title='의뢰 등록'
        description='카톡 캡처를 업로드하면 AI가 자동으로 분석합니다'
      />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Left: Image Upload */}
        <AnalyzeImage
          url={form.imagePreview}
          file={imageFile}
          setImage={({ url, file }) => {
            setForm(prev => ({ ...prev, imagePreview: url }));
            setImageFile(file);
          }}
          setForm={res =>
            setForm(prev => ({
              ...prev,
              songTitle: res.songTitle ?? '',
              composer: res.composer ?? '',
              instruments: buildInstrumentList(res.instruments ?? []),
              version: res.version ?? null,
              deadline: res.deadline ?? '',
              notes: res.notes ?? '',
            }))
          }
          isAnalyzing={isAnalyzing}
          setIsAnalyzing={setIsAnalyzing}
        />

        {/* Right: Form Fields */}
        <CommissionRegisterForm
          form={form}
          setForm={setForm}
          imageFile={imageFile}
          isAnalyzing={isAnalyzing}
        />
      </div>
    </AppLayout>
  );
};

export default CommissionRegister;
