export const getDynamicOffsets = (): Record<number, [number, number]> => {
  if (typeof window === "undefined") return {};

  const isMobile = window.innerWidth < 640;
  const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
  
  let widthMultiplier = 0.85;
  let heightMultiplier = 0.7;
  let maxWidth = 1000;
  
  if (isMobile) {
    widthMultiplier = 0.88;
    heightMultiplier = 0.8;
    maxWidth = 500;
  } else if (isTablet) {
    widthMultiplier = 0.9;
    heightMultiplier = 0.72;
    maxWidth = 750;
  }

  const w = Math.min(window.innerWidth * widthMultiplier, maxWidth);
  const h = window.innerHeight * heightMultiplier; 

  const rx = w / 2 - (isMobile ? 20 : 40); 
  const ry = h / 2 - (isMobile ? 20 : 40); 
  const dx = rx * (isMobile ? 0.7 : 0.75);
  const dy = ry * (isMobile ? 0.65 : 0.75);

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