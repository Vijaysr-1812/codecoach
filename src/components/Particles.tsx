import { useEffect, useRef, useState } from 'react';

const Particles = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);
  const mouseRef = useRef<{x:number;y:number}>({x:50,y:50});

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          delay: Math.random() * 6,
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      mouseRef.current = { x, y };
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="rounded-full opacity-60 transition-transform duration-500"
          style={{
            position: 'absolute',
            left: `calc(${particle.x}% + ${(mouseRef.current.x - 50) * 0.2}px)`,
            top: `calc(${particle.y}% + ${(mouseRef.current.y - 50) * 0.2}px)`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
            filter: 'blur(0.5px)'
          }}
        />
      ))}
    </div>
  );
};

export default Particles;