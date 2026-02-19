import { useState, useRef } from "react";
import { CommissionStatus } from "@/components/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileCheck, Image, Mail, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransitionConfig {
  title: string;
  description: string;
  acceptLabel: string;
  fileLabel: string;
  fileAccept: string;
  icon: typeof Image;
}

const transitionConfigs: Record<string, TransitionConfig> = {
  "received→working": {
    title: "의뢰 승낙 — 피날레 캡처 첨부",
    description: "피날레(Finale) 프로젝트 캡처를 첨부하여 작업 시작을 확인해 주세요.",
    acceptLabel: "승낙 및 작업 시작",
    fileLabel: "피날레 캡처 이미지",
    fileAccept: "image/*",
    icon: Image,
  },
  "working→complete": {
    title: "작업 완료 — MusicXML 첨부",
    description: "완성된 MusicXML 파일을 첨부하여 작업 완료를 확인해 주세요.",
    acceptLabel: "완료 처리",
    fileLabel: "MusicXML 파일 (.xml, .musicxml)",
    fileAccept: ".xml,.musicxml,.mxl",
    icon: FileCheck,
  },
  "complete→delivered": {
    title: "납품 처리 — 메일 발송 증빙",
    description: "의뢰인에게 메일을 보낸 스크린샷을 첨부해 주세요.",
    acceptLabel: "납품 완료",
    fileLabel: "메일 발송 스크린샷",
    fileAccept: "image/*",
    icon: Mail,
  },
};

interface StatusTransitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromStatus: CommissionStatus;
  toStatus: CommissionStatus;
  onConfirm: (file: File) => void;
}

export function StatusTransitionDialog({
  open,
  onOpenChange,
  fromStatus,
  toStatus,
  onConfirm,
}: StatusTransitionDialogProps) {
  const key = `${fromStatus}→${toStatus}`;
  const config = transitionConfigs[key];
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!config) return null;

  const Icon = config.icon;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleConfirm = () => {
    if (file) {
      onConfirm(file);
      setFile(null);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) setFile(null);
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Icon className="h-5 w-5 text-primary" />
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Drop Zone */}
          <div
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              dragOver
                ? "border-primary bg-primary/10"
                : file
                ? "border-status-complete bg-status-complete/5"
                : "border-border hover:border-muted-foreground"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept={config.fileAccept}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFile(f);
              }}
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileCheck className="h-8 w-8 text-status-complete" />
                <p className="text-sm font-medium truncate max-w-[280px]">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 text-xs text-muted-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  <X className="h-3 w-3 mr-1" /> 파일 변경
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">{config.fileLabel}</p>
                <p className="text-xs text-muted-foreground">
                  클릭하거나 파일을 드래그해 주세요
                </p>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-sm">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              증빙 파일 없이는 상태를 변경할 수 없습니다. 파일을 첨부해 주세요.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleClose(false)}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={!file} className="gap-2">
            <Icon className="h-4 w-4" />
            {config.acceptLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
