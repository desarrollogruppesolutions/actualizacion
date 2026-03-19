import { useEffect, useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';


const CheckUpdates = () => {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function checkForUpdates() {
      try {
        const update = await check();
        if (!update) return;

        setStatus(`Nueva versión ${update.version} encontrada. Descargando...`);

        await update.downloadAndInstall((progress) => {
          if (progress.event === 'Finished') {
            setStatus('Instalando... la app se reiniciará.');
          }
        });

        await relaunch();
      } catch (err) {
        console.error('Error al verificar actualizaciones:', err);
      }
    }

    checkForUpdates();
  }, []);

  if (!status) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      left: 16,
      background: '#1a1a2e',
      color: '#fff',
      padding: '10px 18px',
      borderRadius: 10,
      fontSize: 13,
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      border: '1px solid #ffffff22'
    }}>
      🔄 {status}
    </div>
  );
};

export default CheckUpdates;