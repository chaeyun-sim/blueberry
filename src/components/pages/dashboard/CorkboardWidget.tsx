import { Commission } from '@/types/commission';
import { useRef, useState } from 'react';
import { motion, animate, useMotionValue } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Plus, Music2, X } from 'lucide-react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

interface Props {
  commissions: Commission[];
  isLoading: boolean;
}

interface CustomNote {
  id: string;
  content: string;
  colorIndex: number;
  x: number; // px from board left
  y: number; // px from board top
}

// Cork texture via SVG fractalNoise
const _svg = [
  '<svg xmlns="http://www.w3.org/2000/svg">',
  '<filter id="f">',
  '<feTurbulence type="fractalNoise" baseFrequency="0.75 0.9" numOctaves="4" seed="7" stitchTiles="stitch"/>',
  '<feColorMatrix type="matrix" values="0.28 0 0 0 0.58  0.17 0 0 0 0.38  0.06 0 0 0 0.16  0 0 0 1 0"/>',
  '</filter>',
  '<rect width="100%" height="100%" filter="url(#f)"/>',
  '</svg>',
].join('');
const CORK_BG = `url("data:image/svg+xml;base64,${btoa(_svg)}")`;

const NOTE_COLORS = [
  { bg: '#fef08a', border: '#fde047', text: '#78350f' },
  { bg: '#bbf7d0', border: '#86efac', text: '#14532d' },
  { bg: '#fecdd3', border: '#fda4af', text: '#881337' },
  { bg: '#bae6fd', border: '#7dd3fc', text: '#0c4a6e' },
  { bg: '#fed7aa', border: '#fdba74', text: '#7c2d12' },
  { bg: '#e9d5ff', border: '#d8b4fe', text: '#581c87' },
];

const POSITIONS = [
  { left: '2%',  top: '7%',  rotate: -2.5 },
  { left: '19%', top: '4%',  rotate:  1.5 },
  { left: '36%', top: '8%',  rotate: -1   },
  { left: '53%', top: '5%',  rotate:  2.5 },
  { left: '70%', top: '7%',  rotate: -1.5 },
  { left: '9%',  top: '52%', rotate:  1   },
  { left: '27%', top: '49%', rotate: -2.5 },
  { left: '44%', top: '53%', rotate:  1.5 },
  { left: '61%', top: '48%', rotate: -1   },
  { left: '78%', top: '51%', rotate:  2   },
];

const NOTE_W     = 180;
const NOTE_MIN_H = 168;

// ── Thumbtack ────────────────────────────────────────────────────────────────
function Thumbtack({ color = '#dc2626' }: { color?: string }) {
  const isRed = color === '#dc2626';
  return (
    <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
      <circle cx="10" cy="8" r="7.5" fill={color}
        stroke={isRed ? '#991b1b' : '#6b7280'} strokeWidth="1" />
      <circle cx="10" cy="8" r="3" fill="white" opacity="0.3" />
      <rect x="9" y="15" width="2" height="10" rx="1"
        fill={isRed ? '#7f1d1d' : '#374151'} />
    </svg>
  );
}

// ── Folded corner ─────────────────────────────────────────────────────────────
function FoldCorner() {
  return (
    <div
      className="absolute bottom-0 right-0 pointer-events-none"
      style={{
        width: 0, height: 0,
        borderStyle: 'solid',
        borderWidth: '0 0 20px 20px',
        borderColor: 'transparent transparent rgba(0,0,0,0.12) transparent',
      }}
    />
  );
}

// ── Commission PostItNote ─────────────────────────────────────────────────────
interface CommissionNoteProps {
  commission: Commission;
  index: number;
  isPinned: boolean;
  onPin: (e: React.MouseEvent) => void;
  onNavigate: () => void;
  boardRef: React.RefObject<HTMLDivElement | null>;
}

function CommissionNote({ commission, index, isPinned, onPin, onNavigate, boardRef }: CommissionNoteProps) {
  const pos   = POSITIONS[index % POSITIONS.length];
  const color = NOTE_COLORS[index % NOTE_COLORS.length];
  const title = commission.songs?.title ?? commission.title ?? '—';
  const days  = dayjs(commission.deadline).diff(dayjs(), 'day');
  const ddayColor = days < 0 ? '#dc2626' : days <= 3 ? '#d97706' : color.text;
  const ddayLabel = days < 0 ? '마감 초과' : days === 0 ? 'D-Day' : `D-${days}`;
  const didDrag = useRef(false);

  return (
    <motion.div
      className="absolute group select-none"
      style={{ left: pos.left, top: pos.top, width: NOTE_W, zIndex: isPinned ? 1 : 2,
        cursor: isPinned ? 'default' : 'grab' }}
      initial={{ rotate: pos.rotate }}
      animate={{
        rotate: isPinned ? 0 : pos.rotate,
        filter: isPinned
          ? 'drop-shadow(1px 2px 5px rgba(0,0,0,0.22))'
          : 'drop-shadow(3px 10px 16px rgba(0,0,0,0.4))',
      }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      drag={!isPinned}
      dragConstraints={boardRef}
      dragMomentum={false}
      dragElastic={0.05}
      whileDrag={{ scale: 1.07, rotate: pos.rotate * 0.4,
        filter: 'drop-shadow(6px 14px 22px rgba(0,0,0,0.5))', zIndex: 50, cursor: 'grabbing' }}
      onDragStart={() => { didDrag.current = false; }}
      onDrag={()    => { didDrag.current = true; }}
      onDragEnd={()  => { setTimeout(() => { didDrag.current = false; }, 80); }}
    >
      {/* Thumbtack */}
      <button
        className={['absolute -top-5 left-1/2 -translate-x-1/2 z-20',
          'transition-all duration-150 hover:scale-110 cursor-pointer',
          isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'].join(' ')}
        onClick={onPin} title={isPinned ? '핀 제거' : '핀 꽂기'}
      >
        <Thumbtack color={isPinned ? '#dc2626' : '#9ca3af'} />
      </button>

      {/* Body */}
      <motion.div
        className="relative overflow-hidden"
        style={{ background: color.bg, height: NOTE_MIN_H }}
        animate={{ opacity: isPinned ? 0.9 : 1 }}
        transition={{ duration: 0.2 }}
        onClick={() => { if (!didDrag.current) onNavigate(); }}
      >
        <FoldCorner />
        <div className="p-4 flex flex-col h-full">
          {/* 곡명 */}
          <p className="font-bold text-[15px] leading-snug" style={{ color: color.text }}>
            {title.length > 16 ? `${title.slice(0, 15)}…` : title}
          </p>

          {/* 날짜 */}
          <p className="text-[11px] mt-2 tabular-nums" style={{ color: color.text, opacity: 0.55 }}>
            {dayjs(commission.deadline).format('YYYY. MM. DD')}
          </p>

          {/* D-day — 크게 */}
          <div className="mt-auto pt-4 border-t" style={{ borderColor: `${color.border}99` }}>
            <p className="text-[28px] font-black leading-none tabular-nums" style={{ color: ddayColor, opacity: 0.55 }}>
              {ddayLabel}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Custom PostItNote (board) ─────────────────────────────────────────────────
interface CustomNoteProps {
  note: CustomNote;
  isPinned: boolean;
  onPin: (e: React.MouseEvent) => void;
  onDelete: () => void;
  boardRef: React.RefObject<HTMLDivElement | null>;
}

function CustomNote({ note, isPinned, onPin, onDelete, boardRef }: CustomNoteProps) {
  const color  = NOTE_COLORS[note.colorIndex];
  // Deterministic rotation from drop position
  const rotate = ((note.x % 50) / 10) - 2.5;

  return (
    <motion.div
      className="absolute group select-none"
      style={{ left: note.x, top: note.y, width: NOTE_W, zIndex: isPinned ? 1 : 2,
        cursor: isPinned ? 'default' : 'grab' }}
      initial={{ scale: 0.7, opacity: 0, rotate }}
      animate={{
        scale: 1, opacity: 1,
        rotate: isPinned ? 0 : rotate,
        filter: isPinned
          ? 'drop-shadow(1px 2px 5px rgba(0,0,0,0.22))'
          : 'drop-shadow(3px 10px 16px rgba(0,0,0,0.4))',
      }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      drag={!isPinned}
      dragConstraints={boardRef}
      dragMomentum={false}
      dragElastic={0.05}
      whileDrag={{ scale: 1.07, filter: 'drop-shadow(6px 14px 22px rgba(0,0,0,0.5))',
        zIndex: 50, cursor: 'grabbing' }}
    >
      {/* Thumbtack */}
      <button
        className={['absolute -top-5 left-1/2 -translate-x-1/2 z-20',
          'transition-all duration-150 hover:scale-110 cursor-pointer',
          isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'].join(' ')}
        onClick={onPin} title={isPinned ? '핀 제거' : '핀 꽂기'}
      >
        <Thumbtack color={isPinned ? '#dc2626' : '#9ca3af'} />
      </button>

      {/* Delete button */}
      <button
        className="absolute -top-2 -right-2 z-20 w-5 h-5 rounded-full bg-gray-600/80 text-white
          flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity
          hover:bg-red-500 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        title="삭제"
      >
        <X className="h-2.5 w-2.5" />
      </button>

      {/* Body */}
      <motion.div
        className="relative overflow-hidden"
        style={{ background: color.bg, minHeight: NOTE_MIN_H }}
        animate={{ opacity: isPinned ? 0.9 : 1 }}
      >
        <FoldCorner />
        <div className="p-4">
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words"
            style={{ color: color.text }}>
            {note.content || <span style={{ opacity: 0.35 }}>메모</span>}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── TrayNote (draggable preview in tray) ──────────────────────────────────────
interface TrayNoteProps {
  colorIndex: number;
  content: string;
  onContentChange: (v: string) => void;
  boardRef: React.RefObject<HTMLDivElement | null>;
  onDrop: (x: number, y: number) => void;
}

function TrayNote({ colorIndex, content, onContentChange, boardRef, onDrop }: TrayNoteProps) {
  const color  = NOTE_COLORS[colorIndex];
  const dragX  = useMotionValue(0);
  const dragY  = useMotionValue(0);
  const isDragging = useRef(false);

  const snapBack = () => {
    animate(dragX, 0, { type: 'spring', stiffness: 380, damping: 32 });
    animate(dragY, 0, { type: 'spring', stiffness: 380, damping: 32 });
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    isDragging.current = false;
    const boardEl = boardRef.current;
    if (boardEl) {
      const rect = boardEl.getBoundingClientRect();
      const { x: px, y: py } = info.point;
      if (px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom) {
        const nx = Math.max(0, Math.min(px - rect.left - NOTE_W / 2, rect.width  - NOTE_W));
        const ny = Math.max(0, Math.min(py - rect.top  - NOTE_MIN_H / 2, rect.height - NOTE_MIN_H));
        onDrop(nx, ny);
      }
    }
    snapBack();
  };

  return (
    <motion.div
      className="relative select-none w-full"
      style={{ x: dragX, y: dragY, zIndex: 30 }}
      drag
      dragMomentum={false}
      dragElastic={0.08}
      onDragStart={() => { isDragging.current = true; }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.04, zIndex: 100,
        filter: 'drop-shadow(4px 12px 20px rgba(0,0,0,0.45))' }}
    >
      {/* Drag handle strip */}
      <div
        className="flex items-center justify-center gap-1 py-1.5 rounded-t-sm cursor-grab active:cursor-grabbing"
        style={{ background: `${color.border}cc` }}
      >
        {[0,1,2].map(i => (
          <div key={i} className="w-4 h-0.5 rounded-full" style={{ background: color.text, opacity: 0.4 }} />
        ))}
      </div>

      {/* Post-it body with textarea */}
      <div className="relative overflow-hidden"
        style={{ background: color.bg, filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.28))' }}>
        <FoldCorner />
        <div className="p-3">
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            placeholder="여기에 메모를 적고&#10;보드로 드래그하세요"
            rows={5}
            className="w-full resize-none outline-none text-[12px] leading-relaxed bg-transparent
              placeholder:opacity-35 cursor-text"
            style={{ color: color.text, caretColor: color.text }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ── CorkboardWidget ───────────────────────────────────────────────────────────
export function CorkboardWidget({ commissions, isLoading }: Props) {
  const navigate  = useNavigate();
  const boardRef  = useRef<HTMLDivElement>(null);
  const received  = commissions.filter((c) => c.status === 'received');

  const [pinned,       setPinned]       = useState<Set<string>>(new Set());
  const [customNotes,  setCustomNotes]  = useState<CustomNote[]>([]);
  const [trayColorIdx, setTrayColorIdx] = useState(0);
  const [trayContent,  setTrayContent]  = useState('');

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const handleTrayDrop = (x: number, y: number) => {
    setCustomNotes((prev) => [
      ...prev,
      { id: crypto.randomUUID(), content: trayContent, colorIndex: trayColorIdx, x, y },
    ]);
    setTrayContent('');
  };

  const deleteCustomNote = (id: string) => {
    setCustomNotes((prev) => prev.filter((n) => n.id !== id));
    setPinned((prev) => { const next = new Set(prev); next.delete(id); return next; });
  };

  return (
    <div className="hidden lg:block w-full mb-2">
      {/* Wooden frame */}
      <div
        className="rounded-3xl p-[10px] shadow-xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #9b6a38 0%, #b8824e 30%, #a0713d 70%, #7a5228 100%)',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        {/* Cork board */}
        <div
          className="relative rounded-2xl flex h-[400px]"
          style={{ backgroundColor: '#c49560', backgroundImage: CORK_BG, backgroundSize: '280px 280px' }}
        >
          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none z-0 rounded-2xl"
            style={{ background: 'radial-gradient(ellipse 90% 85% at 50% 50%, transparent 55%, rgba(0,0,0,0.18) 100%)' }} />

          {/* Board label */}
          <div className="absolute top-3 left-4 z-10 pointer-events-none">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-950/40">
              대기 중 &middot; {isLoading ? '—' : received.length}건
            </p>
          </div>

          {/* ── Main board ─────────────────────────────────────────────────── */}
          <div ref={boardRef} className="flex-1 relative">
            {isLoading ? (
              [0, 1, 2].map((i) => (
                <div key={i} className="absolute animate-pulse rounded"
                  style={{ left: POSITIONS[i].left, top: POSITIONS[i].top, width: NOTE_W,
                    height: NOTE_MIN_H, background: NOTE_COLORS[i].bg, opacity: 0.4,
                    transform: `rotate(${POSITIONS[i].rotate}deg)` }} />
              ))
            ) : (
              <>
                {received.length === 0 && customNotes.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-amber-950/35">
                    <Music2 className="h-8 w-8 opacity-40" />
                    <p className="text-sm font-medium">대기 중인 의뢰가 없어요</p>
                  </div>
                )}

                {/* Commission-based post-its */}
                {received.slice(0, 10).map((c, i) => (
                  <CommissionNote key={c.id} commission={c} index={i}
                    isPinned={pinned.has(c.id)}
                    onPin={(e) => togglePin(c.id, e)}
                    onNavigate={() => navigate(`/commissions/${c.id}`)}
                    boardRef={boardRef} />
                ))}

                {/* Custom post-its */}
                {customNotes.map((note) => (
                  <CustomNote key={note.id} note={note}
                    isPinned={pinned.has(note.id)}
                    onPin={(e) => togglePin(note.id, e)}
                    onDelete={() => deleteCustomNote(note.id)}
                    boardRef={boardRef} />
                ))}
              </>
            )}
          </div>

          {/* ── Right tray ─────────────────────────────────────────────────── */}
          <div
            className="w-[220px] shrink-0 flex flex-col items-center gap-4 pt-6 pb-4 px-4 relative z-10"
            style={{
              background: 'rgba(65, 33, 8, 0.32)',
              backdropFilter: 'blur(1px)',
              borderLeft: '1px solid rgba(80,45,15,0.22)',
            }}
          >
            <p className="text-[9px] font-bold uppercase tracking-widest text-amber-100/50 self-start">
              트레이
            </p>

            {/* Color selector */}
            <div className="flex gap-2.5 flex-wrap justify-start w-full">
              {NOTE_COLORS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setTrayColorIdx(i)}
                  className="w-6 h-6 rounded-full shrink-0 transition-shadow"
                  style={{
                    background: c.bg,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    outline: trayColorIdx === i ? `2px solid rgba(255,255,255,0.9)` : 'none',
                    outlineOffset: '2px',
                  }}
                  title={`색상 ${i + 1}`}
                />
              ))}
            </div>

            {/* Tray post-it — textarea embedded, drag to board */}
            <TrayNote
              colorIndex={trayColorIdx}
              content={trayContent}
              onContentChange={setTrayContent}
              boardRef={boardRef}
              onDrop={handleTrayDrop}
            />

            {/* New commission button */}
            <button
              onClick={() => navigate('/new')}
              className="mt-auto w-full flex items-center justify-center gap-1 text-amber-100
                text-[11px] font-semibold py-2 rounded-xl transition-all hover:brightness-125"
              style={{
                background: 'rgba(80,45,15,0.5)',
                border: '1px solid rgba(255,200,120,0.18)',
              }}
            >
              <Plus className="h-3 w-3" />
              새 의뢰
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
