import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge, CommissionStatus } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileImage, Link2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const steps: { status: CommissionStatus; label: string }[] = [
  { status: "received", label: "대기" },
  { status: "working", label: "작업중" },
  { status: "complete", label: "완료" },
];

const mockDetail = {
  id: "1",
  title: "Canon in D",
  arrangement: "현악 4중주",
  client: "김OO",
  deadline: "2026-02-21",
  status: "working" as CommissionStatus,
  notes: "원곡 기반, 약간 재편곡 요청. 비올라 파트 강화 원함.",
  createdAt: "2026-02-15",
  linkedScores: [
    { id: "s1", title: "Canon in D", arrangement: "현악 3중주", version: "v2.1" },
  ],
};

const CommissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const detail = mockDetail; // Would fetch by id
  const currentStepIndex = steps.findIndex((s) => s.status === detail.status);

  return (
    <AppLayout>
      <div className="mb-6">
        <Button variant="ghost" className="gap-2 text-muted-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> 뒤로
        </Button>
      </div>

      <PageHeader title={detail.title}>
        <StatusBadge status={detail.status} />
      </PageHeader>

      {/* Status Progress */}
      <Card className="mb-8 border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step.status} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-display font-bold border-2 transition-colors",
                      i <= currentStepIndex
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </div>
                  <span className={cn("text-xs mt-2", i <= currentStepIndex ? "font-medium" : "text-muted-foreground")}>
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn("flex-1 h-0.5 mx-3", i < currentStepIndex ? "bg-primary" : "bg-border")} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Commission Info */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h2 className="font-display font-semibold mb-4">의뢰 정보</h2>
            <dl className="space-y-3">
              {[
                ["편성", detail.arrangement],
                ["의뢰인", detail.client],
                ["마감일", detail.deadline],
                ["등록일", detail.createdAt],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            {detail.notes && (
              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">{detail.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Original Image */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h2 className="font-display font-semibold mb-4">원본 이미지</h2>
            <div className="min-h-[200px] border border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-3 bg-muted/30">
              <FileImage className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">카톡 캡처 이미지</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Linked Scores */}
      <Card className="border-border/50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">연결된 악보</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Link2 className="h-4 w-4" /> 악보 연결
            </Button>
          </div>
          {detail.linkedScores.length > 0 ? (
            <div className="space-y-3">
              {detail.linkedScores.map((score) => (
                <div key={score.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div>
                    <p className="font-medium">{score.title}</p>
                    <p className="text-sm text-muted-foreground">{score.arrangement}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-md bg-accent/15 text-accent font-medium">{score.version}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">연결된 악보가 없습니다</p>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default CommissionDetail;
