import { Loader2 } from "lucide-react";

export default function FullScreenLoader() {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <Loader2 className="h-20 w-20 animate-spin text-primary" />
    </div>
  );
}