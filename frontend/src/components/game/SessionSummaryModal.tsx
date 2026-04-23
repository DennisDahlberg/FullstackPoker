interface Props {
  isOpen: boolean;
  onClose: () => void;
  sessionSummary: any; 
  startingPoints?: number; 
  earnedPoints?: number; 
}

const RANK_THRESHOLDS = [
  { name: "Beginner", min: 0, max: 499, color: "text-gray-400", bg: "bg-gray-400" },
  { name: "Amateur", min: 500, max: 2499, color: "text-green-500", bg: "bg-green-500" },
  { name: "Intermediate", min: 2500, max: 9999, color: "text-emerald-400", bg: "bg-emerald-400" },
  { name: "Advanced", min: 10000, max: 24999, color: "text-teal-400", bg: "bg-teal-400" },
  { name: "Veteran", min: 25000, max: 49999, color: "text-cyan-400", bg: "bg-cyan-400" },
  { name: "Expert", min: 50000, max: 99999, color: "text-blue-500", bg: "bg-blue-500" },
  { name: "Pro", min: 100000, max: 249999, color: "text-indigo-400", bg: "bg-indigo-400" },
  { name: "Master", min: 250000, max: 499999, color: "text-purple-500", bg: "bg-purple-500" },
  { name: "Elite", min: 500000, max: 999999, color: "text-red-500", bg: "bg-red-500" },
  { name: "Legend", min: 1000000, max: Infinity, color: "text-amber-400", bg: "bg-amber-400" },
];

function getRankData(points: number) {
  return RANK_THRESHOLDS.find(r => points >= r.min && points <= r.max) || RANK_THRESHOLDS[0];
}

export default function SessionSummaryModal({isOpen, onClose, sessionSummary, startingPoints = 2400, earnedPoints = 150}: Props)