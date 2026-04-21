export const getDynamicOffsets = (): Record<number, [number, number]> => {
  if (typeof window === "undefined") return {};

  const w = Math.min(window.innerWidth * 0.85, 1000);
  const h = window.innerHeight * 0.7; 

  const rx = w / 2 - 40; 
  const ry = h / 2 - 40; 
  const dx = rx * 0.75;
  const dy = ry * 0.75;

  return {
    0: [0, -ry],      
    1: [dx, -dy],     
    2: [rx, 0],      
    3: [dx, dy],     
    4: [0, ry],      
    5: [-dx, dy],    
    6: [-rx, 0],      
    7: [-dx, -dy],  
  };
};