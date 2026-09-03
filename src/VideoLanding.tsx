import { useEffect, useRef } from "react";

const VIDEO_SRC = "/media/typhoon.mp4";

export function VideoLanding() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) {
      video.pause();
      return;
    }
    video.muted = true;
    video.defaultMuted = true;
    const play = () => {
      void video.play().catch(() => {});
    };
    play();
    video.addEventListener("canplay", play);
    return () => {
      video.removeEventListener("canplay", play);
      video.pause();
    };
  }, []);

  return (
    <div className="video-landing fixed inset-0 overflow-hidden bg-neutral-950">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden
      />
      <div className="video-landing__vignette" />
      <h1 className="video-landing__wordmark">Eyewall Labs</h1>
    </div>
  );
}
