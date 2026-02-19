import { useState } from "react";
import { SongAutocomplete } from "@/components/SongAutocomplete";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload, ImageIcon, X, Plus, ArrowLeft, FileArchive,
  FileMusic, FileAudio, FileText, Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const INSTRUMENT_OPTIONS = [
  "Violin", "Viola", "Cello", "Double Bass", "Flute", "Oboe", "Clarinet",
  "Bassoon", "Horn", "Trumpet", "Trombone", "Tuba", "Piano", "Harp",
  "Percussion", "Guitar",
];

// Mock parsed zip contents
const MOCK_ZIP_FILES = [
  { name: "Canon in D - Score.musx", type: "finale-score" as const, size: "2.4 MB" },
  { name: "Canon in D - Violin I.musx", type: "finale-part" as const, size: "580 KB" },
  { name: "Canon in D - Violin II.musx", type: "finale-part" as const, size: "540 KB" },
  { name: "Canon in D - Viola.musx", type: "finale-part" as const, size: "510 KB" },
  { name: "Canon in D - Cello.musx", type: "finale-part" as const, size: "520 KB" },
  { name: "Canon in D.musicxml", type: "musicxml" as const, size: "1.1 MB" },
  { name: "Canon in D.wav", type: "audio" as const, size: "18.3 MB" },
];

const fileTypeConfig = {
  "finale-score": { icon: FileMusic, label: "스코어", color: "text-primary" },
  "finale-part": { icon: FileMusic, label: "파트보", color: "text-[hsl(var(--status-working))]" },
  "musicxml": { icon: FileText, label: "MusicXML", color: "text-[hsl(var(--success))]" },
  "audio": { icon: FileAudio, label: "오디오", color: "text-[hsl(var(--warning))]" },
};

const ScoreRegister = () => {
  const [instruments, setInstruments] = useState<string[]>([]);
  const [instrumentInput, setInstrumentInput] = useState("");
  const [showInstrumentDropdown, setShowInstrumentDropdown] = useState(false);
  const [zipUploaded, setZipUploaded] = useState(false);
  const [songTitle, setSongTitle] = useState("");
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
      <div className="mb-6">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:bg-foreground/5" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> 뒤로
        </Button>
      </div>
      <PageHeader title="악보 추가" description="새로운 악보를 등록합니다" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: ZIP Upload */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h2 className="font-display font-semibold mb-4">악보 파일</h2>

            {!zipUploaded ? (
              <div
                onClick={() => setZipUploaded(true)}
                onDragOver={(e) => e.preventDefault()}
                className="relative min-h-[300px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-4 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <FileArchive className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-medium">ZIP 파일을 드래그하거나 클릭하여 업로드</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    스코어, 파트보, MusicXML, WAV 파일이 포함된 ZIP
                  </p>
                </div>
                <p className="text-sm text-muted-foreground underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
                  파일 선택
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Zip file header */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/15">
                  <div className="flex items-center gap-3">
                    <FileArchive className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Canon_in_D_Quartet.zip</p>
                      <p className="text-xs text-muted-foreground">23.9 MB · 7개 파일</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setZipUploaded(false)}
                    className="p-1 rounded hover:bg-foreground/5 transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Parsed file list */}
                <div className="space-y-1.5">
                  {MOCK_ZIP_FILES.map((file, idx) => {
                    const config = fileTypeConfig[file.type];
                    const Icon = config.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${config.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{file.name}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium shrink-0">
                          {config.label}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums shrink-0">{file.size}</span>
                        <Check className="h-3.5 w-3.5 text-[hsl(var(--success))] shrink-0" />
                      </div>
                    );
                  })}
                </div>

                {/* File type summary */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                  {Object.entries(fileTypeConfig).map(([key, config]) => {
                    const count = MOCK_ZIP_FILES.filter((f) => f.type === key).length;
                    if (count === 0) return null;
                    return (
                      <span key={key} className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${config.color.replace("text-", "bg-")}`} />
                        {config.label} {count}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Form Fields */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <h2 className="font-display font-semibold mb-4">악보 정보</h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>곡명</Label>
                <SongAutocomplete value={songTitle} onChange={setSongTitle} />
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ScoreRegister;
