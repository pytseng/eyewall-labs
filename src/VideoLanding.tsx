import { useEffect, useRef, useState, type RefObject } from "react";

const STORM_VIDEO = "/media/typhoon.mp4";
const INNER_OFFSET_RATIO = 0.52;
const INNER_OFFSET_FALLBACK = 6.4;
const EYE_RATES = [0.35, 0.5, 0.75, 1, 1.25, 1.6, 2];

const EYE_EFFECTS = ["clear", "silver"] as const;

type EyeEffect = (typeof EYE_EFFECTS)[number];

function useStormLayer(
  ref: RefObject<HTMLVideoElement | null>,
  offset = false,
) {
  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    video.muted = true;
    video.defaultMuted = true;

    const targetOffset = () => {
      const duration = video.duration;
      if (Number.isFinite(duration) && duration > 1.5) {
        return Math.min(duration - 0.35, duration * INNER_OFFSET_RATIO);
      }
      return INNER_OFFSET_FALLBACK;
    };

    const applyOffset = () => {
      if (!offset) return;
      if (video.currentTime < 0.22) {
        video.currentTime = targetOffset();
      }
    };

    const play = () => {
      applyOffset();
      if (reduce.matches) {
        video.pause();
        return;
      }
      void video.play().catch(() => {});
    };

    const onLoaded = () => {
      if (offset) video.currentTime = targetOffset();
      play();
    };

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("canplay", play);
    if (offset) video.addEventListener("timeupdate", applyOffset);
    play();

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("canplay", play);
      video.removeEventListener("timeupdate", applyOffset);
      video.pause();
    };
  }, [offset]);
}

function pickEffect(current: EyeEffect): EyeEffect {
  return current === "clear" ? "silver" : "clear";
}

function pickRate(current: number) {
  const pool = EYE_RATES.filter((rate) => rate !== current);
  return pool[Math.floor(Math.random() * pool.length)] ?? 1;
}

function useEyeEffect() {
  const [effect, setEffect] = useState<EyeEffect>("clear");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let timeout = 0;
    let cancelled = false;
    let current: EyeEffect = "clear";

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timeout = window.setTimeout(resolve, ms);
      });

    const loop = async () => {
      await wait(1400);
      while (!cancelled) {
        current = pickEffect(current);
        setEffect(current);
        await wait(1600 + Math.random() * 1800);
        if (cancelled) return;
      }
    };

    void loop();
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  return effect;
}

function useEyePlayback(ref: RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let timeout = 0;
    let cancelled = false;
    let rate = 1;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timeout = window.setTimeout(resolve, ms);
      });

    const loop = async () => {
      await wait(900 + Math.random() * 1200);
      while (!cancelled) {
        const pause = Math.random() < 0.4;
        if (pause) {
          video.pause();
          await wait(280 + Math.random() * 900);
          if (cancelled) return;
        }
        rate = pickRate(rate);
        video.playbackRate = rate;
        if (video.paused) void video.play().catch(() => {});
        await wait(900 + Math.random() * 1600);
        if (cancelled) return;
      }
    };

    void loop();
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      video.playbackRate = 1;
    };
  }, [ref]);
}

export function VideoLanding() {
  const outerRef = useRef<HTMLVideoElement>(null);
  const innerRef = useRef<HTMLVideoElement>(null);
  const effect = useEyeEffect();

  useStormLayer(outerRef);
  useStormLayer(innerRef, true);
  useEyePlayback(innerRef);

  return (
    <div className="video-landing">
      <div className="video-landing__storm">
        <video
          ref={outerRef}
          src={STORM_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden
        />
        <div className="video-landing__wash" />
      </div>
      <div className="video-landing__cover" aria-hidden>
        <div className={`video-landing__eye is-${effect}`}>
          <video
            ref={innerRef}
            className="video-landing__feed"
            src={`${STORM_VIDEO}#inner`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
          />
          <div className="video-landing__grade" />
          <div className="video-landing__glass" />
        </div>
      </div>
    </div>
  );
}
