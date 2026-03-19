// FloatingNotification.jsx
import { useState, useEffect} from 'react';
import './App.css';
import CheckUpdates from "./CheckUpdates";

const FloatingNotification = ({
  message = "¡Nueva notificación!",
  icon = "success",
  type = "warning", // info, success, warning, error
  duration = 4000,
  
}) => { 
  const [phase, setPhase] = useState('enter');
  // Fases: enter → float → reveal → visible → exit → gone

  useEffect(() => {
    const timers: (number | undefined)[] = []; 

    // Fase 1: Entrada con giro (0ms)
    timers.push(setTimeout(() => setPhase('float'), 600));

    // Fase 2: Flotando + giro suave (600ms)
    timers.push(setTimeout(() => setPhase('reveal'), 1200));

    // Fase 3: Revela contenido (1200ms)
    timers.push(setTimeout(() => setPhase('visible'), 1800));

    // Fase 4: Visible completa, luego se esconde
    timers.push(setTimeout(() => setPhase('exit'), duration));
 
    // Fase 5: Se fue
    timers.push(setTimeout(() => {
      setPhase('gone');

    }, duration + 800));

    return () => timers.forEach(clearTimeout);
  }, [duration]);

  if (phase === 'gone') return null;

  return (
    <>
      <CheckUpdates />
      <div className={`floating-notification ${type} phase-${phase}`}>
        {/* Partículas decorativas */}
        <div className="particles">
          <span className="particle p1">✦</span>
          <span className="particle p2">✧</span>
          <span className="particle p3">•</span>
        </div>

        {/* Ícono con giro */}
        <div className="notif-icon">
          <span className="icon-inner">{icon}</span>
        </div>

        {/* Contenido que se revela */}
        <div className="notif-content">
          <p className="notif-message">{message}</p>
        </div>

        {/* Barra de progreso */}
        <div
          className="notif-progress"
          style={{ animationDuration: `${duration}ms` }}
        />

        {/* Botón cerrar */}
        <button className="notif-close" onClick={() => setPhase('exit')}>
          ✕
        </button>
      </div>
    </>
  );
};

export default FloatingNotification;