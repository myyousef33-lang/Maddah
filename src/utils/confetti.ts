import confetti from 'canvas-confetti';

export const triggerOrangeConfetti = () => {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#F97316', '#FBBF24', '#FDBA74']
    });
  } catch (_) {}
};

export const triggerAchievementConfetti = () => {
  try {
    const end = Date.now() + 1.5 * 1000;
    const colors = ['#F97316', '#F59E0B', '#FDBA74', '#10B981'];

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
