"use client";

import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true); 
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    const handleMouseOut = (e: MouseEvent) => {
        if (e.relatedTarget === null) {
            setIsVisible(false);
        }
    };
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [isVisible]);

    return (
        <div
            style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            width: '32px',
            height: '32px',
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            zIndex: 99999,
            display: isVisible ? 'block' : 'none', 
            }}
        >
            <div 
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)',
                mixBlendMode: 'difference',
                opacity: 0.9,
            }}
            />
            <div 
            style={{
                width: '100%',
                height: '100%',
                backgroundImage: "url('/cur.cur')",
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
            }}
            />
        </div>
    );
}
