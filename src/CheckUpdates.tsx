import { useEffect, useState } from 'react';
import { check, Update } from '@tauri-apps/plugin-updater';
import { getCurrentWindow } from '@tauri-apps/api/window';

type Phase = 'enter' | 'visible' | 'exit' | 'gone';

const CheckUpdates = () => {
  const [phase, setPhase] = useState<Phase>('enter');
  const [update, setUpdate] = useState<Update | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    async function checkForUpdates() {
      try {
        const result = await check();

        if (!result) {
          // Temporal para debug: muestra notificacion aunque no haya update
          setUpdate({ version: 'TEST - sin actualizacion' } as any);
          setTimeout(() => setPhase('visible'), 100);
          return;
        }

        setUpdate(result);
        await result.download((progress) => {
          console.log('descargando', progress);
        });
        setDownloaded(true);
        setTimeout(() => setPhase('visible'), 100)

      } catch (err) {
        // Muestra el error visualmente en la notificacion
        setUpdate({ version: `ERROR: ${err}` } as any);
        setTimeout(() => setPhase('visible'), 100);
      }
    }

    checkForUpdates();
  }, []); // Solo corre una vez al montar

  // Instala al cerrar la app
  useEffect(() => {
    if (!downloaded || !update) return;

    const appWindow = getCurrentWindow();
    const unlisten = appWindow.onCloseRequested(async (event) => {
      event.preventDefault();
      try {
        await update.install();
        await appWindow.destroy();
      } catch (err) {
        // Si falla el install, cierra igual
        await appWindow.destroy();
      }
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, [downloaded, update]);


  const handleDismiss = () => {
    setPhase('exit');
    setTimeout(() => setPhase('gone'), 600);
  };

  if (!update || phase === 'gone') return null;

  return (
    <div
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        transition-all duration-500 ease-in-out
        ${phase === 'enter' ? 'opacity-0 -translate-y-4' : ''}
        ${phase === 'visible' ? 'opacity-100 translate-y-0' : ''}
        ${phase === 'exit' ? 'opacity-0 -translate-y-4' : ''}
      `}
    >
      <div className="relative flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl
                      bg-[#1a1a2e] border border-white/10 text-white min-w-[320px]">

        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <span className="absolute top-1 left-3 text-xs opacity-40 animate-pulse">✦</span>
          <span className="absolute top-2 right-6 text-xs opacity-30 animate-pulse delay-150">✧</span>
          <span className="absolute bottom-1 left-1/2 text-xs opacity-20 animate-pulse delay-300">•</span>
        </div>

        <div className="text-2xl animate-bounce">🔄</div>

        <div className="flex flex-col">
          <span className="font-semibold text-sm">
            {update.version}
          </span>
          <span className="text-xs text-white/50">
            {downloaded
              ? 'Se instalará cuando cierres la app.'
              : 'Descargando en segundo plano...'}
          </span>
        </div>

        <div className="ml-auto">
          {downloaded
            ? <span className="text-green-400 text-lg">✅</span>
            : <span className="text-white/40 text-xs animate-spin inline-block">⏳</span>
          }
        </div>

        <button
          onClick={handleDismiss}
          className="ml-2 text-white/30 hover:text-white/80 transition-colors text-sm"
        >
          ✕
        </button>

        <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl overflow-hidden">
          <div className={`h-full bg-gradient-to-r from-blue-500 to-purple-500
                          ${downloaded ? 'w-full' : 'w-1/3 animate-pulse'} 
                          transition-all duration-1000`}
          />
        </div>
      </div>
    </div>
  ); 
};

export default CheckUpdates;