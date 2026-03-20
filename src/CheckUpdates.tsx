import { useEffect, useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

const CheckUpdates = () => {
  const [ready, setReady] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    async function handleUpdates() {
      try {
        const update = await check();
        if (!update) return;

        const storedVersion = localStorage.getItem('updateVersion');
        const isReady = localStorage.getItem('updateReady') === 'true';

        // 🟢 CASO 1: ya descargada ESTA versión → instalar
        if (isReady && storedVersion === update.version) {
          setInstalling(true);

          await update.install();

          // limpiar estado
          localStorage.removeItem('updateReady');
          localStorage.removeItem('updateVersion');

          return;
        }

        // 🟡 CASO 2: hay nueva versión distinta → resetear estado
        if (storedVersion && storedVersion !== update.version) {
          localStorage.removeItem('updateReady');
          localStorage.removeItem('updateVersion');
        }

        // 🔵 CASO 3: no descargada → descargar en silencio
        if (!isReady) {
          await update.download();

          localStorage.setItem('updateReady', 'true');
          localStorage.setItem('updateVersion', update.version);

          setReady(true);
        }

      } catch (err) {
        console.error('Updater error:', err);
      }
    }

    handleUpdates();
  }, []);

  // 🔄 Instalando
  if (installing) {
    return (
      <div style={styles.container}>
        ⚙️ Instalando actualización...
      </div>
    );
  }

  // ✅ Update lista
  if (!ready) return null;

  return (
    <div style={styles.container}>
      <span>✅ Actualización lista</span>
      <button
        style={styles.button}
        onClick={async () => {
          setInstalling(true);
          await relaunch();
        }}
      >
        Reiniciar ahora
      </button>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed' as const,
    bottom: 20,
    right: 20,
    background: '#111827',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: 12,
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
    border: '1px solid #ffffff15',
    zIndex: 9999
  },
  button: {
    background: '#2563eb',
    border: 'none',
    color: '#fff',
    padding: '6px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 12
  }
};

export default CheckUpdates;