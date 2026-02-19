import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileImage } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const mockArrangementDetail = {
  s1: {
    a1: { title: "Canon in D", arrangement: "현악 3중주", createdAt: "2025-11-20" },
    a2: { title: "Canon in D", arrangement: "현악 4중주", createdAt: "2025-10-15" },
    a3: { title: "Canon in D", arrangement: "피아노 솔로", createdAt: "2025-09-01" },
  },
  s2: {
    a4: { title: "River Flows in You", arrangement: "피아노 솔로", createdAt: "2025-12-01" },
  },
  s3: {
    a5: { title: "A Thousand Years", arrangement: "현악 5중주", createdAt: "2026-01-10" },
    a6: { title: "A Thousand Years", arrangement: "현악 4중주", createdAt: "2026-01-05" },
  },
  s4: {
    a7: { title: "Wedding March", arrangement: "브라스 앙상블", createdAt: "2024-06-22" },
  },
  s5: {
    a8: { title: "Spring Waltz", arrangement: "플룻 듀엣", createdAt: "2026-02-05" },
  },
} as Record<string, Record<string, { title: string; arrangement: string; createdAt: string }>>;

const ScoreDetail = () => {
  const { scoreId, arrangementId } = useParams();
  const navigate = useNavigate();

  const detail = scoreId && arrangementId
    ? mockArrangementDetail[scoreId]?.[arrangementId]
    : null;

  if (!detail) {
    return (
      <AppLayout>
        <div className="text-center py-20 text-muted-foreground">악보를 찾을 수 없습니다</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <Button variant="ghost" className="gap-2 text-muted-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> 뒤로
        </Button>
      </div>

      <PageHeader title={detail.title} description={detail.arrangement} />

      <Card className="border-border/50">
        <CardContent className="p-5">
          <div className="min-h-[500px] border border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-3 bg-muted/30">
            <FileImage className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">악보 PDF 미리보기</p>
          </div>
          <div className="flex justify-center mt-4">
            <Button variant="ghost" className="gap-2 text-muted-foreground">
              <Download className="h-4 w-4" /> 다운로드
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default ScoreDetail;
