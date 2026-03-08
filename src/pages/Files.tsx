import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import Button from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TabsContent } from '@radix-ui/react-tabs';
import { Music, Sheet, PlusCircle, Upload } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { ExcelUploadDialog } from '@/components/ExcelUploadDialog';
import { ExcelRow } from '@/types/excel';
import { statsMutations } from '@/api/stats/mutations';
import { statsKeys } from '@/api/stats/queryKeys';
import ScoreTab from '@/components/pages/scores/ScoreTab';
import ExcelTab from '@/components/pages/uploads/ExcelTab';
import { queryClient } from '@/utils/query-client';
import { toast } from 'sonner';

const Files = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('scores');
  const [uploadOpen, setUploadOpen] = useState(false);

  const { mutate: saveRows } = useMutation(statsMutations.saveSalesRows());

  const handleUpload = useCallback(
    (data: ExcelRow[], name: string) => {
      saveRows(
        { rows: data, name },
        {
          onSuccess: (_, { rows }) => {
            queryClient.invalidateQueries({ queryKey: statsKeys.all });
            toast.success(`"${name}" — ${rows.length}건이 저장되었습니다.`);
          },
          onError: e =>
            toast.error('저장에 실패했습니다.', {
              description: e instanceof Error ? e.message : undefined,
            }),
        },
      );
    },
    [saveRows],
  );

  return (
    <AppLayout>
      <PageHeader
        title='파일 관리'
        description='악보와 엑셀 데이터를 통합 관리합니다'
      />

      <ExcelUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={handleUpload}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-6'
      >
        {/* 탭 + 액션 버튼 같은 줄 */}
        <div className='flex items-center justify-between'>
          <TabsList className='grid grid-cols-2 w-auto'>
            <TabsTrigger
              value='scores'
              className='gap-1.5'
            >
              <Music className='h-3.5 w-3.5' />
              악보 관리
            </TabsTrigger>
            <TabsTrigger
              value='excel'
              className='gap-1.5'
            >
              <Sheet className='h-3.5 w-3.5' />
              엑셀 관리
            </TabsTrigger>
          </TabsList>
          <div className='hidden md:flex'>
             {activeTab === 'scores' && (
              <Button
                className='gap-2'
                onClick={() => navigate('/scores/new')}
              >
                <PlusCircle className='h-4 w-4' />
                악보 추가
              </Button>
            )}
            {activeTab === 'excel' && (
              <Button
                className='gap-2'
                onClick={() => setUploadOpen(true)}
              >
                <Upload className='h-4 w-4' />
                엑셀 업로드
              </Button>
            )}
         </div>
        </div>

        <TabsContent value='scores'>
          <ScoreTab />
        </TabsContent>
        <TabsContent value='excel'>
          <ExcelTab onUploadRequest={() => setUploadOpen(true)} />
        </TabsContent>
      </Tabs>
      <div className='md:hidden absolute bottom-5 left-6 right-6'>
        {activeTab === 'scores' && (
          <Button
            className='gap-2 w-full'
            onClick={() => navigate('/scores/new')}
          >
            <PlusCircle className='h-4 w-4' />
            악보 추가
          </Button>
        )}
        {activeTab === 'excel' && (
          <Button
            className='gap-2 w-full'
            onClick={() => setUploadOpen(true)}
          >
            <Upload className='h-4 w-4' />
            엑셀 업로드
          </Button>
        )}
      </div>
    </AppLayout>
  );
};

export default Files;
