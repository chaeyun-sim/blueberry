import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { CommissionStatus } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Link2, ChevronRight, Check, X, Mail, ExternalLink } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { StatusTransitionDialog } from "@/components/StatusTransitionDialog";

const steps: { status: CommissionStatus; label: string }[] = [
  { status: "received", label: "대기" },
  { status: "working", label: "작업중" },
  { status: "complete", label: "완료" },
  { status: "delivered", label: "전달" },
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
  const [detail, setDetail] = useState(mockDetail);
  const [transitionOpen, setTransitionOpen] = useState(false);
  const currentStepIndex = steps.findIndex((s) => s.status === detail.status);

  const nextStatus = currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1].status : null;

  const handleTransitionConfirm = (file: File) => {
    // In production, upload file then update status
    console.log("증빙 파일:", file.name, "→", nextStatus);
    if (nextStatus) {
      setDetail((prev) => ({ ...prev, status: nextStatus }));
    }
    setTransitionOpen(false);
  };

  const handleReject = () => {
    navigate(-1);
  };

  return (
    <AppLayout bottomBar={
      <div className="border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="px-6 py-3 flex justify-end">
          {detail.status === "received" && (
            <div className="flex items-center gap-3">
              <Button onClick={() => setTransitionOpen(true)} className="gap-2 px-6 py-5">
                <Check className="h-4 w-4" /> 의뢰 승낙
              </Button>
              <Button variant="destructive" onClick={handleReject} className="gap-2 px-6 py-5">
                <X className="h-4 w-4" /> 의뢰 거절
              </Button>
            </div>
          )}
          {detail.status === "working" && (
            <Button onClick={() => setTransitionOpen(true)} className="gap-2 px-6 py-5">
              <ChevronRight className="h-4 w-4" /> 완료로 변경
            </Button>
          )}
          {detail.status === "complete" && (
            <Button onClick={() => setTransitionOpen(true)} className="gap-2 px-6 py-5">
              <Mail className="h-4 w-4" /> 메일 전송 및 전달
            </Button>
          )}
          {detail.status === "delivered" && (
            <p className="text-sm text-muted-foreground py-2">전달이 완료된 의뢰입니다.</p>
          )}
        </div>
      </div>
    }>
      {/* Transition Dialog */}
      {nextStatus && (
        <StatusTransitionDialog
          open={transitionOpen}
          onOpenChange={setTransitionOpen}
          fromStatus={detail.status}
          toStatus={nextStatus}
          onConfirm={handleTransitionConfirm}
        />
      )}

      <div className="mb-6">
        <Button variant="ghost" className="gap-2 text-muted-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> 뒤로
        </Button>
      </div>

      <PageHeader title={detail.title} />

      {/* Status Progress */}
      <Card className="mb-8 border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between w-full">
            {steps.map((step, i) => (
              <div key={step.status} className={cn("flex items-center", i < steps.length - 1 ? "flex-1" : "")}>
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

      <div className="mb-8">
        {/* Commission Info */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold">의뢰 정보</h2>
              <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                원본 이미지 보기 <ExternalLink className="h-3 w-3" />
              </button>
            </div>
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
