import React, { useEffect, useRef } from 'react';

const WindSense = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const lines = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      width: Math.random() * 100 + 50,
      speed: Math.random() * 0.6 + 0.2,
      opacity: Math.random() * 0.4 + 0.2
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.classList.contains('dark');
      
      lines.forEach(l => {
        l.x += l.speed;
        if (l.x > canvas.width) l.x = -l.width;
        
        ctx.beginPath();
        const grad = ctx.createLinearGradient(l.x, l.y, l.x + l.width, l.y);
        grad.addColorStop(0, 'transparent');
        // Azul Royal no Light para visibilidade / Azul Neon no Dark
        grad.addColorStop(0.5, isDark ? `rgba(59, 130, 246, ${l.opacity})` : `rgba(29, 78, 216, ${l.opacity})`);
        grad.addColorStop(1, 'transparent');
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x + l.width, l.y);
        ctx.stroke();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize(); animate();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 transition-opacity duration-500 pointer-events-none wind-canvas"
      style={{ 
        // No escuro brilha (screen), no claro pinta o fundo (multiply)
        mixBlendMode: document.documentElement.classList.contains('dark') ? 'screen' : 'multiply' 
      }}
    />
  );
};

export default WindSense;