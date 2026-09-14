import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { subscribeWakeup } from "../api/wakeupStatus";

export default function ServerWakingBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => subscribeWakeup(setVisible), []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[100] bg-primary text-white text-sm font-medium py-2 px-4 flex items-center justify-center gap-2 shadow-md">
      <Loader2 size={16} className="animate-spin" />
      Waking up the server — this can take up to a minute on the first request today.
    </div>
  );
}
