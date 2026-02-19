import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Sparkles, ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CommissionRegister = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Placeholder for drag & drop
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  return (
    <AppLayout>
      <PageHeader title="의뢰 등록" description="카톡 캡처를 업로드하면 AI가 자동으로 분석합니다" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Image Upload */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h2 className="font-display font-semibold mb-4">원본 이미지</h2>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleImageDrop}
              className="relative min-h-[300px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              {isAnalyzing && (
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent animate-scan-line" />
                </div>
              )}
              {imagePreview ? (
                <img src={imagePreview} alt="업로드된 이미지" className="max-h-[400px] rounded-md object-contain" />
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">이미지를 드래그하거나 클릭하여 업로드</p>
                    <p className="text-sm text-muted-foreground mt-1">카카오톡 캡처 이미지를 붙여넣을 수도 있습니다</p>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    파일 선택
                  </Button>
                </>
              )}
            </div>
            <div className="mt-4 flex justify-center">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" />
                {isAnalyzing ? "AI 분석 중..." : "AI로 분석하기"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Form Fields */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h2 className="font-display font-semibold mb-4">의뢰 정보</h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">곡명</Label>
                <Input id="title" placeholder="곡 제목을 입력하세요" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrangement">편성</Label>
                <Input id="arrangement" placeholder="예: 현악 4중주, 피아노 솔로" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">의뢰인</Label>
                <Input id="client" placeholder="의뢰인 이름" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">마감일</Label>
                <Input id="deadline" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">메모</Label>
                <Textarea id="notes" placeholder="추가 요청사항이나 메모..." rows={4} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button className="flex-1">의뢰 등록</Button>
                <Button variant="outline" onClick={() => navigate(-1)}>취소</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CommissionRegister;
