import { EyewallRadar } from "@/components/eyewall-radar";

const ticker =
  "EYEWALL LABS  ·  OFFICIAL CHANNEL  ·  SCOPE CALIBRATING  ·  STANDBY FOR TRANSMISSION  ·  THE EYE IS CALM  ·  THE WALL IS FORMING  ·  ";

export default function Home() {
  return (
    <div className="crt-shell crt-flicker flex min-h-dvh flex-col text-phosphor">
      <header className="relative z-20 flex items-start justify-between gap-4 px-4 pt-5 sm:px-8 sm:pt-7">
        <div>
          <p className="text-[10px] tracking-[0.42em] text-phosphor-mid sm:text-[11px]">
            STATION EWL-01
          </p>
          <h1 className="wordmark phosphor-glow mt-2 text-[1.35rem] font-normal leading-none sm:text-3xl md:text-4xl">
            EYEWALL LABS
          </h1>
        </div>
        <div className="text-right text-[10px] leading-4 tracking-[0.18em] text-fog sm:text-[11px] sm:leading-5">
          <p>LAT 25.76 N</p>
          <p>LON 80.19 W</p>
          <p className="text-amber">YR 2026</p>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-4 sm:px-8">
        <div className="grid w-full items-center gap-6 lg:grid-cols-[1fr_minmax(0,1.15fr)_1fr] lg:gap-4">
          <aside className="hidden text-[11px] leading-5 tracking-[0.16em] text-fog lg:block">
            <p className="text-phosphor-mid">SCOPE</p>
            <p>MODE / WX PPI</p>
            <p>RANGE / 120 NM</p>
            <p>PRF / 04.20</p>
            <p className="mt-5 text-phosphor-mid">WALL</p>
            <p>INNER  18 KM</p>
            <p>OUTER  42 KM</p>
          </aside>

          <section className="relative mx-auto w-full max-w-[34rem]">
            <EyewallRadar />
          </section>

          <aside className="hidden text-right text-[11px] leading-5 tracking-[0.16em] text-fog lg:block">
            <p className="text-phosphor-mid">SIGNAL</p>
            <p>CARRIER / LOCK</p>
            <p>NOISE  / -18dB</p>
            <p>SYNC   / HOLD</p>
            <p className="mt-5 text-phosphor-mid">TASK</p>
            <p>BUILD THE FIRM</p>
            <p>HOLD THE LINE</p>
          </aside>
        </div>

        <section className="mt-2 max-w-xl text-center sm:mt-4">
          <p className="text-[10px] tracking-[0.38em] text-amber sm:text-[11px]">
            OFFICIAL FREQUENCY
          </p>
          <p className="phosphor-glow mt-3 text-sm leading-6 tracking-[0.12em] text-phosphor sm:text-base">
            Independent studio. The channel is live, the archive is empty.
            Work will transmit from this scope.
          </p>
          <p className="status-cursor mt-4 text-[11px] tracking-[0.28em] text-phosphor-mid">
            STATUS  STANDBY
          </p>
        </section>
      </main>

      <footer className="relative z-20 pb-5 pt-2">
        <div className="ticker overflow-hidden border-y border-phosphor/15 py-2 text-[10px] tracking-[0.28em] text-phosphor-mid sm:text-[11px]">
          <div className="ticker-track">
            <span className="px-4">{ticker}</span>
            <span className="px-4">{ticker}</span>
          </div>
        </div>
        <p className="mt-3 px-4 text-center text-[10px] tracking-[0.22em] text-fog sm:px-8">
          EYEWALL LABS  ·  ALL RIGHTS RESERVED
        </p>
      </footer>
    </div>
  );
}
