import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge, CommissionStatus } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardList, Clock, Truck, CheckCircle2, History,
  PlusCircle, TrendingUp, DollarSign, Sun, CloudRain, Cloud,
  ChevronLeft, ChevronRight, Music,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "framer-motion";
import lofiCornerImg from "@/assets/lofi-corner.png";
import todayDawnImg from "@/assets/today-dawn.png";
import todayDayImg from "@/assets/today-day.jpg";
import todaySunsetImg from "@/assets/today-sunset.jpg";
import todayNightImg from "@/assets/today-night.png";

function getTodayBg(hour: number) {
  if (hour >= 4 && hour < 11) return todayDawnImg;
  if (hour >= 11 && hour < 15) return todayDayImg;
  if (hour >= 15 && hour < 19) return todaySunsetImg;
  return todayNightImg;
}

// ── Data ──

const recentCommissions = [
  { id: "1", title: "Canon in D", arrangement: "현악 4중주", status: "working" as const, updatedAt: "2시간 전" },
  { id: "2", title: "River Flows in You", arrangement: "피아노 솔로", status: "complete" as const, updatedAt: "5시간 전" },
  { id: "3", title: "Spring Waltz", arrangement: "플룻 듀엣", status: "received" as const, updatedAt: "어제" },
];

const commissionSummary = {
  received: 3,
  working: 5,
  complete: 12,
  delivered: 2,
};

const revenueSlides = [
  { label: "올해 총 매출", value: 28450000, sub: "전년 대비 +22.4%", up: true },
  { label: "지난 달 매출", value: 2340000, sub: "전월 대비 +15.2%", up: true },
];

// ── Rolling Number Component ──

function RollingNumber({ value, prefix = "₩" }: { value: number; prefix?: string }) {
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => {
        setDisplay(Math.round(v).toLocaleString("ko-KR"));
      },
    });
    return controls.stop;
  }, [value]);

  return <>{prefix}{display}</>;
}

// ── Helpers ──

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return "늦은 밤이에요 🌙";
  if (h < 12) return "좋은 아침이에요 ☀️";
  if (h < 18) return "좋은 오후예요 🌤";
  return "좋은 저녁이에요 🌆";
}

function getFormattedDate() {
  const d = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`;
}

const DAILY_QUOTE = "적게 일하고 돈 많이 벌자 💰";

function useLiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return time;
}

// ── Mini Calendar ──

function MiniCalendar({ onNavigate }: { onNavigate: () => void }) {
  const [viewDate, setViewDate] = useState(new Date());
  const today = new Date();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const deadlineDays = [21, 23, 25]; // mock

  const { startDay, daysInMonth } = useMemo(() => {
    const first = new Date(year, month, 1);
    return {
      startDay: (first.getDay() + 6) % 7, // Mon=0
      daysInMonth: new Date(year, month + 1, 0).getDate(),
    };
  }, [year, month]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length < 42) cells.push(null); // 항상 6주(42칸) 고정

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const hasDeadline = (d: number) =>
    month === today.getMonth() && year === today.getFullYear() && deadlineDays.includes(d);

  return (
    <div className="flex flex-col h-full cursor-pointer" onClick={onNavigate}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-sm">
          {year}년 {month + 1}월
        </h3>
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            className="p-1 rounded hover:bg-muted/50 transition-colors"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
          >
            <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            className="p-1 rounded hover:bg-muted/50 transition-colors"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
          >
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] text-muted-foreground mb-1">
        {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
          <span key={d} className="font-medium">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5 text-center flex-1">
        {cells.map((d, i) => (
          <div key={i} className="flex flex-col items-center justify-center">
            {d ? (
              <span
                className={`
                  w-7 h-7 flex items-center justify-center text-xs font-medium transition-colors
                  ${isToday(d) ? "rounded-full bg-primary text-primary-foreground font-bold" : ""}
                `}
              >
                {hasDeadline(d) && !isToday(d) ? (
                  <span className="px-1 bg-yellow-300/30 rounded-[2px]">{d}</span>
                ) : d}
              </span>
            ) : (
              <span className="w-7 h-7" />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-primary" /> 오늘
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-yellow-300/40" /> 마감
        </span>
      </div>
    </div>
  );
}

// ── Dashboard ──

const Dashboard = () => {
  const navigate = useNavigate();
  const [slideIdx, setSlideIdx] = useState(0);
  const clock = useLiveClock();

  useEffect(() => {
    const timer = setInterval(() => setSlideIdx((p) => (p + 1) % revenueSlides.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const total = commissionSummary.received + commissionSummary.working + commissionSummary.complete + commissionSummary.delivered;

  return (
    <AppLayout>
      <PageHeader title="대시보드" description="의뢰 현황을 한눈에 확인하세요" />

      {/* Bento Grid */}
      <div className="flex flex-col gap-5">
        {/* Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5">

        {/* ① Top-Left: Today */}
        <Card className="border-border/50 overflow-hidden relative min-h-[180px]">
          {/* Background image with crossfade */}
          <AnimatePresence mode="wait">
            <motion.img
              key={getTodayBg(clock.getHours())}
              src={getTodayBg(clock.getHours())}
              alt=""
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/10" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-white/80">{getFormattedDate()}</p>
              <span className="font-display font-bold text-lg tabular-nums text-white drop-shadow">
                {clock.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold mb-2 text-white drop-shadow">{getGreeting()}</h2>
            <p className="text-xs text-white/70 italic mb-4">"{DAILY_QUOTE}"</p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-white/80">
                <Sun className="h-4 w-4 text-[hsl(var(--warning))]" />
                <span>맑음 · 4°C</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Music className="h-4 w-4" />
                <span>진행 중인 의뢰 <strong className="text-white">{commissionSummary.working}건</strong></span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <History className="h-4 w-4 text-[hsl(var(--success))]" />
                <span>최근 업데이트 <strong className="text-white">{recentCommissions.length}건</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ② Top-Right: Mini Calendar */}
        <Card className="border-border/50">
          <CardContent className="p-4 h-full">
            <MiniCalendar onNavigate={() => navigate("/calendar")} />
          </CardContent>
        </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-5">
        {/* ③ Bottom-Left: Revenue + Commission Summary */}
        <div className="flex flex-col gap-5">
          {/* Revenue Slider Card */}
          <Card className="border-border/50">
            <CardContent className="p-5">
              <div
                className="cursor-pointer hover:bg-muted/30 rounded-lg p-3 -m-1 transition-colors"
                onClick={() => navigate("/stats")}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <DollarSign className="h-4 w-4 text-[hsl(var(--success))]" />
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={slideIdx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="text-xs font-medium"
                      >
                        {revenueSlides[slideIdx].label}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <span className="text-xs text-muted-foreground">자세히 →</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slideIdx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                  >
                    <p className="text-3xl font-display font-bold mb-0.5">
                      <RollingNumber value={revenueSlides[slideIdx].value} />
                    </p>
                    <p className="text-xs text-[hsl(var(--success))] flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" /> {revenueSlides[slideIdx].sub}
                    </p>
                  </motion.div>
                </AnimatePresence>
                <div className="flex gap-1.5 mt-3">
                  {revenueSlides.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === slideIdx ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commission Summary Card */}
          <Card className="border-border/50 flex-1">
            <CardContent className="p-5">
              <h3 className="text-xs font-medium text-muted-foreground mb-3">이번 달 의뢰 요약</h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "접수", count: commissionSummary.received, status: "received" as CommissionStatus, icon: ClipboardList },
                  { label: "작업중", count: commissionSummary.working, status: "working" as CommissionStatus, icon: Clock },
                  { label: "완료", count: commissionSummary.complete, status: "complete" as CommissionStatus, icon: CheckCircle2 },
                  { label: "전달", count: commissionSummary.delivered, status: "delivered" as CommissionStatus, icon: Truck },
                ].map((item) => (
                  <div
                    key={item.status}
                    className="flex flex-col items-center p-2.5 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/commissions?status=${item.status}`)}
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground mb-1.5" />
                    <p className="text-xl font-display font-bold">{item.count}</p>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex h-2 rounded-full overflow-hidden mt-3">
                <div className="bg-[hsl(var(--status-received))]" style={{ width: `${(commissionSummary.received / total) * 100}%` }} />
                <div className="bg-[hsl(var(--status-working))]" style={{ width: `${(commissionSummary.working / total) * 100}%` }} />
                <div className="bg-[hsl(var(--status-complete))]" style={{ width: `${(commissionSummary.complete / total) * 100}%` }} />
                <div className="bg-[hsl(var(--status-delivered))]" style={{ width: `${(commissionSummary.delivered / total) * 100}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ④ Bottom-Right: 최근 작업 */}
        <Card className="border-border/50">
          <CardContent className="p-5 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <History className="h-5 w-5 text-foreground" />
              <h2 className="font-display font-semibold text-sm">최근 작업</h2>
            </div>
            <div className="space-y-2.5 flex-1">
              {recentCommissions.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/commissions/${c.id}`)}
                >
                  <div>
                    <p className="font-medium text-sm">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.arrangement}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={c.status} />
                    <span className="text-[10px] text-muted-foreground">{c.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Third Row: Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="border-border/50">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Music className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-display font-bold">24</p>
              <p className="text-[11px] text-muted-foreground">보유 악보</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--status-complete))] mb-2" />
              <p className="text-2xl font-display font-bold">156</p>
              <p className="text-[11px] text-muted-foreground">누적 완료</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <TrendingUp className="h-5 w-5 text-[hsl(var(--success))] mb-2" />
              <p className="text-2xl font-display font-bold">+22%</p>
              <p className="text-[11px] text-muted-foreground">전년 대비 성장</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <DollarSign className="h-5 w-5 text-[hsl(var(--warning))] mb-2" />
              <p className="text-2xl font-display font-bold">₩14,930</p>
              <p className="text-[11px] text-muted-foreground">평균 단가</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
