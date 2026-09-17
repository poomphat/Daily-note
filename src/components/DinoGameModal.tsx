import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Dino, X } from "./icons";

interface Props {
  onClose: () => void;
}

const HIGH_SCORE_KEY = "daily-note-dino-highscore";
const GAME_W = 600;
const GAME_H = 180;
const GROUND_Y = 148;
const GRAVITY = 0.65;
const JUMP_V = -11.5;
const BASE_SPEED = 5.2;
const MAX_SPEED = 11;

type Phase = "ready" | "running" | "over";

interface Obstacle {
  x: number;
  w: number;
  h: number;
}

function readHighScore(): number {
  try {
    const raw = localStorage.getItem(HIGH_SCORE_KEY);
    const n = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeHighScore(score: number) {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    /* ignore quota / private mode */
  }
}

function cssVar(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

export default function DinoGameModal({ onClose }: Props) {
  const titleId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => readHighScore());

  const phaseRef = useRef<Phase>("ready");
  const scoreRef = useRef(0);
  const highRef = useRef(highScore);
  const dinoY = useRef(0);
  const dinoVy = useRef(0);
  const grounded = useRef(true);
  const obstacles = useRef<Obstacle[]>([]);
  const spawnTimer = useRef(0);
  const speed = useRef(BASE_SPEED);
  const distance = useRef(0);
  const frame = useRef(0);
  const raf = useRef(0);
  const colors = useRef({ ink: "#23232a", faint: "#7c7c86", line: "#e7e5dd", brand: "#4f46e5" });

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    highRef.current = highScore;
  }, [highScore]);

  const refreshColors = () => {
    colors.current = {
      ink: cssVar("--color-ink", "#23232a"),
      faint: cssVar("--color-ink-faint", "#7c7c86"),
      line: cssVar("--color-line", "#e7e5dd"),
      brand: cssVar("--color-brand", "#4f46e5"),
    };
  };

  const resetRun = () => {
    dinoY.current = 0;
    dinoVy.current = 0;
    grounded.current = true;
    obstacles.current = [];
    spawnTimer.current = 60;
    speed.current = BASE_SPEED;
    distance.current = 0;
    frame.current = 0;
    scoreRef.current = 0;
    setScore(0);
  };

  const startGame = () => {
    resetRun();
    phaseRef.current = "running";
    setPhase("running");
  };

  const jump = () => {
    if (phaseRef.current === "ready") {
      startGame();
      if (grounded.current) {
        grounded.current = false;
        dinoVy.current = JUMP_V;
      }
      return;
    }
    if (phaseRef.current === "over") {
      startGame();
      return;
    }
    if (phaseRef.current === "running" && grounded.current) {
      grounded.current = false;
      dinoVy.current = JUMP_V;
    }
  };

  useEffect(() => {
    refreshColors();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = wrap.clientWidth;
      const cssH = Math.round((cssW / GAME_W) * GAME_H);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr * (cssW / GAME_W), 0, 0, dpr * (cssH / GAME_H), 0, 0);
    };

    resize();
    refreshColors();
    const ro = new ResizeObserver(resize);
    if (wrapRef.current) ro.observe(wrapRef.current);

    const drawDino = (x: number, y: number, runFrame: number) => {
      const { ink } = colors.current;
      ctx.fillStyle = ink;
      // body
      ctx.fillRect(x + 8, y - 28, 28, 22);
      // head
      ctx.fillRect(x + 28, y - 40, 22, 16);
      // snout
      ctx.fillRect(x + 46, y - 36, 8, 8);
      // eye
      ctx.clearRect(x + 42, y - 36, 3, 3);
      // tail
      ctx.fillRect(x, y - 20, 10, 8);
      // legs (simple run cycle)
      if (runFrame % 2 === 0) {
        ctx.fillRect(x + 12, y - 8, 6, 10);
        ctx.fillRect(x + 26, y - 6, 6, 8);
      } else {
        ctx.fillRect(x + 12, y - 6, 6, 8);
        ctx.fillRect(x + 26, y - 8, 6, 10);
      }
      // arm
      ctx.fillRect(x + 30, y - 22, 8, 4);
    };

    const drawCactus = (o: Obstacle) => {
      const { ink } = colors.current;
      ctx.fillStyle = ink;
      const baseX = o.x;
      const top = GROUND_Y - o.h;
      ctx.fillRect(baseX + o.w * 0.35, top, o.w * 0.3, o.h);
      if (o.h > 28) {
        ctx.fillRect(baseX, top + 8, o.w * 0.35, 6);
        ctx.fillRect(baseX, top + 8, 5, 14);
        ctx.fillRect(baseX + o.w * 0.65, top + 14, o.w * 0.35, 6);
        ctx.fillRect(baseX + o.w - 5, top + 14, 5, 12);
      }
    };

    const hitTest = (o: Obstacle): boolean => {
      const dinoX = 48;
      const dinoW = 40;
      const dinoH = 42;
      const dinoTop = GROUND_Y - dinoH + dinoY.current;
      const pad = 4;
      return !(
        dinoX + dinoW - pad < o.x + pad ||
        dinoX + pad > o.x + o.w - pad ||
        dinoTop + dinoH - pad < GROUND_Y - o.h + pad ||
        dinoTop + pad > GROUND_Y - pad
      );
    };

    const endGame = () => {
      phaseRef.current = "over";
      setPhase("over");
      const s = Math.floor(scoreRef.current);
      if (s > highRef.current) {
        highRef.current = s;
        setHighScore(s);
        writeHighScore(s);
      }
    };

    const tick = () => {
      raf.current = requestAnimationFrame(tick);
      frame.current += 1;
      refreshColors();

      const { faint, line, brand } = colors.current;
      ctx.clearRect(0, 0, GAME_W, GAME_H);

      // ground
      ctx.strokeStyle = line;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(GAME_W, GROUND_Y);
      ctx.stroke();

      // ground speckles scroll with distance
      ctx.fillStyle = line;
      const scroll = distance.current % GAME_W;
      for (let i = 0; i < 12; i++) {
        const gx = ((i * 55 - scroll * 0.8) % GAME_W + GAME_W) % GAME_W;
        ctx.fillRect(gx, GROUND_Y + 4 + (i % 3) * 3, 8 + (i % 4), 2);
      }

      if (phaseRef.current === "running") {
        // physics
        dinoVy.current += GRAVITY;
        dinoY.current += dinoVy.current;
        if (dinoY.current >= 0) {
          dinoY.current = 0;
          dinoVy.current = 0;
          grounded.current = true;
        }

        speed.current = Math.min(MAX_SPEED, BASE_SPEED + distance.current / 1800);
        distance.current += speed.current;
        scoreRef.current = distance.current / 10;
        if (frame.current % 6 === 0) {
          setScore(Math.floor(scoreRef.current));
        }

        spawnTimer.current -= 1;
        if (spawnTimer.current <= 0) {
          const tall = Math.random() > 0.55;
          obstacles.current.push({
            x: GAME_W + 10,
            w: tall ? 22 : 16,
            h: tall ? 38 + Math.floor(Math.random() * 10) : 24 + Math.floor(Math.random() * 8),
          });
          spawnTimer.current =
            48 + Math.floor(Math.random() * 50) - Math.floor(speed.current * 2);
        }

        for (const o of obstacles.current) {
          o.x -= speed.current;
        }
        obstacles.current = obstacles.current.filter((o) => o.x + o.w > -20);

        for (const o of obstacles.current) {
          if (hitTest(o)) {
            endGame();
            break;
          }
        }
      }

      for (const o of obstacles.current) {
        drawCactus(o);
      }

      const runFrame =
        phaseRef.current === "running" && grounded.current
          ? Math.floor(frame.current / 6)
          : 0;
      drawDino(48, GROUND_Y + dinoY.current, runFrame);

      // HUD on canvas (subtle) — main scores are outside
      if (phaseRef.current === "ready") {
        ctx.fillStyle = faint;
        ctx.font = "600 14px Sora, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("แตะหรือกด Space เพื่อเริ่ม", GAME_W / 2, GAME_H / 2 - 8);
      }

      if (phaseRef.current === "over") {
        ctx.fillStyle = brand;
        ctx.font = "700 16px Sora, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("เกมโอเวอร์", GAME_W / 2, GAME_H / 2 - 14);
        ctx.fillStyle = faint;
        ctx.font = "500 13px IBM Plex Sans Thai, sans-serif";
        ctx.fillText("กด Space หรือแตะเพื่อเล่นใหม่", GAME_W / 2, GAME_H / 2 + 8);
      }
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf.current);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        jump();
      }
    };
    // capture so App day-nav / page scroll do not receive Space / ArrowUp
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  const onPointer = (e: ReactPointerEvent) => {
    e.preventDefault();
    jump();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="animate-rise surface relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2
            id={titleId}
            className="flex min-w-0 items-center gap-2 font-display text-lg font-semibold leading-snug text-ink"
          >
            <Dino className="h-5 w-5 shrink-0 text-brand" />
            <span>ไดโนเสาร์โดด</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="tap-target grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-soft transition hover:bg-elevated"
            aria-label="ปิด"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 text-sm">
          <p className="tabular-nums text-ink">
            คะแนน{" "}
            <span className="font-display text-base font-semibold">
              {Math.floor(score).toString().padStart(4, "0")}
            </span>
          </p>
          <p className="tabular-nums text-ink-soft">
            สูงสุด{" "}
            <span className="font-medium text-ink">
              {highScore.toString().padStart(4, "0")}
            </span>
          </p>
        </div>

        <div
          ref={wrapRef}
          className="select-none overflow-hidden rounded-xl bg-paper-2/60 ring-1 ring-line touch-manipulation"
          onPointerDown={onPointer}
          role="application"
          aria-label="พื้นที่เล่นเกมไดโนเสาร์โดด กดหรือแตะเพื่อกระโดด"
        >
          <canvas ref={canvasRef} className="block w-full" />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-ink-faint">
          {phase === "ready" && "Space / ↑ / แตะเพื่อเริ่มและกระโดด · Esc ปิด"}
          {phase === "running" && "กระโดดหลบกระบอง · Space / ↑ / แตะ"}
          {phase === "over" && "เกมโอเวอร์ — กด Space หรือแตะเพื่อเล่นใหม่"}
        </p>
      </div>
    </div>
  );
}
