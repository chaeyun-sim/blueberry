import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, ImageIcon, X, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const INSTRUMENT_OPTIONS = [
  "Violin", "Viola", "Cello", "Double Bass", "Flute", "Oboe", "Clarinet",
  "Bassoon", "Horn", "Trumpet", "Trombone", "Tuba", "Piano", "Harp",
  "Percussion", "Guitar",
];

const ScoreRegister = () => {
  const [instruments, setInstruments] = useState<string[]>([]);
  const [instrumentInput, setInstrumentInput] = useState("");
  const [showInstrumentDropdown, setShowInstrumentDropdown] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const navigate = useNavigate();

  const addInstrument = (name: string) => {
    const sameBase = instruments.filter((i) => i.startsWith(name));
    if (sameBase.length === 0) {
      setInstruments([...instruments, name]);
    } else if (sameBase.length === 1 && !sameBase[0].includes(" ")) {
      setInstruments([
        ...instruments.map((i) => (i === name ? `${name} I` : i)),
        `${name} II`,
      ]);
    } else {
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
      <PageHeader title="악보 추가" description="새로운 악보를 등록합니다" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: PDF Upload */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h2 className="font-display font-semibold mb-4">악보 파일</h2>
            <div
              onDragOver={(e) => e.preventDefault()}
              className="relative min-h-[300px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              {pdfPreview ? (
                <p className="text-sm text-muted-foreground">업로드된 파일 미리보기</p>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">PDF 파일을 드래그하거나 클릭하여 업로드</p>
                    <p className="text-sm text-muted-foreground mt-1">악보 PDF 파일을 업로드하세요</p>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    파일 선택
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Form Fields */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h2 className="font-display font-semibold mb-4">악보 정보</h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">곡명</Label>
                <Input id="title" placeholder="곡 제목을 입력하세요" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrangement">편성명</Label>
                <Input id="arrangement" placeholder="예: 현악 4중주" />
              </div>

              {/* Instrument Chips */}
              <div className="space-y-2">
                <Label>악기 구성</Label>
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
                <Label htmlFor="notes">메모</Label>
                <Textarea id="notes" placeholder="추가 메모..." rows={3} />
              </div>

              <div className="flex gap-3 pt-2">
                <Button className="flex-1">악보 등록</Button>
                <Button variant="outline" onClick={() => navigate(-1)}>취소</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ScoreRegister;
