import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Box } from "@mui/material";

const FloatingParticles = ({
  count = 50,
  colors = ["#8B4513", "#D2691E", "#DEB887", "#F5DEB3"],
}) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.1,
    }));
  }, [count, colors]);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
            opacity: 0,
          }}
          animate={{
            x: [
              `${particle.x}vw`,
              `${(particle.x + 10) % 100}vw`,
              `${(particle.x + 20) % 100}vw`,
              `${particle.x}vw`,
            ],
            y: [
              `${particle.y}vh`,
              `${(particle.y - 10 + 100) % 100}vh`,
              `${(particle.y - 20 + 100) % 100}vh`,
              `${particle.y}vh`,
            ],
            opacity: [0, particle.opacity, particle.opacity, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            borderRadius: "50%",
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}40`,
            filter: "blur(0.5px)",
          }}
        />
      ))}

      {/* Additional larger floating elements */}
      {Array.from({ length: 5 }, (_, i) => (
        <motion.div
          key={`large-${i}`}
          initial={{
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 100}vh`,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            x: [
              `${Math.random() * 100}vw`,
              `${Math.random() * 100}vw`,
              `${Math.random() * 100}vw`,
            ],
            y: [
              `${Math.random() * 100}vh`,
              `${Math.random() * 100}vh`,
              `${Math.random() * 100}vh`,
            ],
            opacity: [0, 0.05, 0.1, 0.05, 0],
            scale: [0, 1, 1.2, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30 + Math.random() * 20,
            delay: Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            width: `${20 + Math.random() * 30}px`,
            height: `${20 + Math.random() * 30}px`,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors[Math.floor(Math.random() * colors.length)]}20, transparent)`,
            filter: "blur(2px)",
          }}
        />
      ))}

      {/* Subtle floating geometric shapes */}
      {Array.from({ length: 8 }, (_, i) => (
        <motion.div
          key={`geo-${i}`}
          initial={{
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 100}vh`,
            opacity: 0,
            rotate: 0,
          }}
          animate={{
            x: [`${Math.random() * 100}vw`, `${Math.random() * 100}vw`],
            y: [`${Math.random() * 100}vh`, `${Math.random() * 100}vh`],
            opacity: [0, 0.08, 0.08, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 40 + Math.random() * 20,
            delay: Math.random() * 15,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            width: `${8 + Math.random() * 12}px`,
            height: `${8 + Math.random() * 12}px`,
            borderRadius: i % 2 === 0 ? "50%" : "2px",
            backgroundColor: "transparent",
            border: `1px solid ${colors[Math.floor(Math.random() * colors.length)]}40`,
            filter: "blur(0.5px)",
          }}
        />
      ))}

      {/* Ambient light spots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.02, 0.04, 0.02, 0] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #8B451320, transparent)",
          filter: "blur(20px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.03, 0.06, 0.03, 0] }}
        transition={{
          duration: 12,
          delay: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          bottom: "30%",
          right: "15%",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #D2691E15, transparent)",
          filter: "blur(25px)",
        }}
      />
    </Box>
  );
};

export default FloatingParticles;
