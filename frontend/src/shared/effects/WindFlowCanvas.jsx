import React, { useEffect, useRef } from "react";

const LINE_COUNT = 50;
const COLORS_DARK = ["#00FFFF", "#0099FF", "#9D00FF", "#FFFFFF"];
const COLORS_LIGHT = ["#1e40af", "#172554", "#2563eb"];

function createLine(canvas, paletteSize, initial = false) {
  return {
    x: initial ? Math.random() * canvas.width : -200,
    y: Math.random() * canvas.height,
    length: Math.random() * 200 + 50,
    speed: Math.random() * 1.5 + 0.5,
    width: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.4 + 0.1,
    colorIndex: Math.floor(Math.random() * paletteSize),
  };
}

function resetLine(line, canvas, paletteSize, initial = false) {
  line.x = initial ? Math.random() * canvas.width : -200;
  line.y = Math.random() * canvas.height;
  line.length = Math.random() * 200 + 50;
  line.speed = Math.random() * 1.5 + 0.5;
  line.width = Math.random() * 2 + 0.5;
  line.opacity = Math.random() * 0.4 + 0.1;
  line.colorIndex = Math.floor(Math.random() * paletteSize);
}

const WindSense = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    const lines = Array.from({ length: LINE_COUNT }, () => createLine(canvas, COLORS_DARK.length, true));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.classList.contains("dark");
      const palette = isDark ? COLORS_DARK : COLORS_LIGHT;

      lines.forEach((line) => {
        line.x += line.speed;
        if (line.x > canvas.width + line.length) {
          resetLine(line, canvas, palette.length);
        }

        const color = palette[line.colorIndex % palette.length];
        const gradient = ctx.createLinearGradient(
          line.x,
          line.y,
          line.x + line.length,
          line.y,
        );

        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = line.width;
        ctx.lineCap = "round";

        if (isDark) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = line.opacity;
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x + line.length, line.y);
        ctx.stroke();

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 transition-opacity duration-1000 pointer-events-none"
      style={{
        mixBlendMode: document.documentElement.classList.contains("dark") ? "screen" : "multiply",
        opacity: 0.6,
      }}
    />
  );
};

export default WindSense;
