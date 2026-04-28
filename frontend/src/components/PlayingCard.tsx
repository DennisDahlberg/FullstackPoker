import { motion } from "framer-motion";

interface PlayingCardProps {
  value?: string;
  hidden?: boolean;
  dealDelay?: number;
  initialOffsetX?: number;
  initialOffsetY?: number;
}

export default function PlayingCard({
  value,
  hidden,
  dealDelay = 0,
  initialOffsetX = 0,
  initialOffsetY = -80,
}: PlayingCardProps) {
  return (
    <motion.img
      src={
        hidden ? `/images/cards/blue_back.png` : `/images/cards/${value}.png`
      }
      className="w-9 sm:w-12 md:w-16"
      alt=""
      initial={{
        opacity: 0,
        x: initialOffsetX,
        y: initialOffsetY,
        rotate: -10,
        scale: 0.7,
      }}
      animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: dealDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
    />
  );
}
