import confetti from 'canvas-confetti';

export const triggerOrangeConfetti = () => {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#D4AF37', '#FBBF24', '#00B4FF']
    });
  } catch (_) {}
};

export const triggerAchievementConfetti = () => {
  try {
    const end = Date.now() + 1.5 * 1000;
    const colors = ['#D4AF37', '#F59E0B', '#00B4FF', '#10B981'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch (_) {}
};

export const triggerConfetti = () => {
  try {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch (_) {}
};
