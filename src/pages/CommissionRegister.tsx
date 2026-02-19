import { useState } from "react";
import { SongAutocomplete } from "@/components/SongAutocomplete";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Sparkles, ImageIcon, X, Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const INSTRUMENT_OPTIONS = [
  "Violin", "Viola", "Cello", "Double Bass", "Flute", "Oboe", "Clarinet",
  "Bassoon", "Horn", "Trumpet", "Trombone", "Tuba", "Piano", "Harp",
  "Percussion", "Guitar",
];

const CommissionRegister = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [instruments, setInstruments] = useState<string[]>([]);
  const [songTitle, setSongTitle] = useState("");
  const [instrumentInput, setInstrumentInput] = useState("");
  const [showInstrumentDropdown, setShowInstrumentDropdown] = useState(false);
  const navigate = useNavigate();

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  const addInstrument = (name: string) => {
    // Count existing same-name instruments
    const sameBase = instruments.filter((i) => i.startsWith(name));
    if (sameBase.length === 0) {
      setInstruments([...instruments, name]);
    } else if (sameBase.length === 1 && !sameBase[0].includes(" ")) {
      // Rename existing to I, add II
      setInstruments([
        ...instruments.map((i) => (i === name ? `${name} I` : i)),
        `${name} II`,
      ]);
    } else {
      // Add next roman numeral
      const nextNum = sameBase.length + 1;
      const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
      setInstruments([...instruments, `${name} ${roman[nextNum - 1] || nextNum}`]);
    }
    setInstrumentInput("");
    setShowInstrumentDropdown(false);
  };

  const removeInstrument = (index: number) => {
    const removed = instruments[index];
    const baseName = removed.replace(/ (I{1,3}V?|IV|V|VI{0,3})$/, "");
    const remaining = instruments.filter((_, i) => i !== index);

    // If only one of this base instrument remains, remove the numeral
    const sameBase = remaining.filter((i) => i.startsWith(baseName));
    if (sameBase.length === 1 && sameBase[0].includes(" ")) {
      setInstruments(remaining.map((i) => (i.startsWith(baseName) ? baseName : i)));
    } else {
      setInstruments(remaining);
    }
  };

  const filteredOptions = INSTRUMENT_OPTIONS.filter((opt) =>
    opt.toLowerCase().includes(instrumentInput.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="mb-6">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:bg-foreground/5" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> 뒤로
        </Button>
      </div>
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
                  <p className="text-sm text-muted-foreground underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">파일 선택</p>
                </>
              )}
            </div>
            <div className="mt-4 flex justify-center">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="gap-2 text-white border-0 hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #8a3ab9, #4c68d7, #6b5ce7)" }}
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
                <Label>곡명</Label>
                <SongAutocomplete value={songTitle} onChange={setSongTitle} />
              </div>

              {/* Instrument Chips */}
              <div className="space-y-2">
                <Label>편성</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {instruments.map((inst, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/15 text-primary border border-primary/20"
                    >
                      {inst}
                      <button
                        type="button"
                        onClick={() => removeInstrument(idx)}
                        className="ml-0.5 hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <Input
                    placeholder="악기를 검색하여 추가..."
                    value={instrumentInput}
                    onChange={(e) => {
                      setInstrumentInput(e.target.value);
                      setShowInstrumentDropdown(true);
                    }}
                    onFocus={() => setShowInstrumentDropdown(true)}
                    onBlur={() => setTimeout(() => setShowInstrumentDropdown(false), 200)}
                  />
                  {showInstrumentDropdown && instrumentInput && filteredOptions.length > 0 && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            addInstrument(opt);
                          }}
                        >
                          <Plus className="h-3 w-3 text-muted-foreground" />
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">버전</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="버전을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">일반</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CommissionRegister;
