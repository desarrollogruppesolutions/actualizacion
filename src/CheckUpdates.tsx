import { useEffect, useState } from 'react';
import { check, Update } from '@tauri-apps/plugin-updater';
import { getCurrentWindow } from '@tauri-apps/api/window';

type Phase = 'enter' | 'visible' | 'exit' | 'gone';

const CheckUpdates = () => {
  const [phase, setPhase] = useState<Phase>('enter');
  const [update, setUpdate] = useState<Update | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function checkForUpdates() {
      try {
        const result = await check();
        if (!result?.available) return;

        setUpdate(result);
        setTimeout(() => setPhase('visible'), 100);

        let totalSize = 0;
        let downloadedSize = 0;

        await result.download((event) => {
          if (event.event === 'Started' && event.data.contentLength) {
            totalSize = event.data.contentLength;
          } else if (event.event === 'Progress') {
            downloadedSize += event.data.chunkLength;
            if (totalSize > 0) {
              setProgress(Math.round((downloadedSize / totalSize) * 100));
            }
          }
        });

        setDownloaded(true);
        setProgress(100);
      } catch (err) {
        console.error('Error buscando actualizaciones:', err);
      }
    }

    checkForUpdates();
  }, []);

  useEffect(() => {
    if (!downloaded || !update) return;

    const appWindow = getCurrentWindow();
    const unlisten = appWindow.onCloseRequested(async (event) => {
      event.preventDefault();
      await appWindow.hide();

      try {
        await update.install();
      } catch (err) {
        console.error('Error instalando:', err);
      }

      await appWindow.destroy();
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, [downloaded, update]);

  const handleDismiss = () => {
    setPhase('exit');
    setTimeout(() => setPhase('gone'), 500);
  };

  if (!update || phase === 'gone') return null;

  return (
    <div
      className={`
        fixed top-5 left-1/2 -translate-x-1/2 z-50
        transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${phase === 'enter' ? 'opacity-0 -translate-y-6 scale-95' : ''}
        ${phase === 'visible' ? 'opacity-100 translate-y-0 scale-100' : ''}
        ${phase === 'exit' ? 'opacity-0 -translate-y-6 scale-95' : ''}
      `}
    >
      <div className="relative flex items-center gap-4 pl-4 pr-3 py-3 rounded-xl
                      bg-zinc-900/95 backdrop-blur-md border border-white/[0.08]
                      shadow-[0_8px_32px_rgba(0,0,0,0.4)] min-w-[340px]">

        {/* Icono */}
        <div className={`
          flex items-center justify-center w-9 h-9 rounded-lg shrink-0
          ${downloaded
            ? 'bg-emerald-500/15 text-emerald-400'
            : 'bg-blue-500/15 text-blue-400'}
          transition-colors duration-500
        `}>
          {downloaded ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 animate-pulse">
              <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
              <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
            </svg>
          )}
        </div>

        {/* Texto */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-medium text-[13px] text-white/90 leading-tight">
            {downloaded
              ? `Versión ${update.version} lista`
              : `Descargando v${update.version}`}
          </span>
          <span className="text-[11px] text-white/40 leading-tight">
            {downloaded
              ? 'Se aplicará automáticamente al cerrar'
              : `${progress}% completado...`}
          </span>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={handleDismiss}
          className="ml-auto p-1.5 rounded-lg text-white/20 hover:text-white/60
                     hover:bg-white/[0.06] transition-all duration-200 shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
          </svg>
        </button>

        {/* Barra de progreso */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-xl overflow-hidden bg-white/[0.04]">
          <div
            className={`
              h-full transition-all duration-700 ease-out rounded-full
              ${downloaded
                ? 'bg-emerald-500/60 w-full'
                : 'bg-blue-500/60'}
            `}
            style={!downloaded ? { width: `${progress}%` } : undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckUpdates;