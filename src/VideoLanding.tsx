import { useEffect, useRef } from "react";

const STORM_VIDEO = "/media/typhoon.mp4";

export function VideoLanding() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    video.muted = true;
    video.defaultMuted = true;

    const play = () => {
      if (reduce.matches) {
        video.pause();
        return;
      }
      void video.play().catch(() => {});
    };

    video.addEventListener("loadedmetadata", play);
    video.addEventListener("canplay", play);
    play();

    return () => {
      video.removeEventListener("loadedmetadata", play);
      video.removeEventListener("canplay", play);
      video.pause();
    };
  }, []);

  return (
    <div className="video-landing">
      <video
        ref={videoRef}
        src={STORM_VIDEO}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden
      />
    </div>
  );
}
