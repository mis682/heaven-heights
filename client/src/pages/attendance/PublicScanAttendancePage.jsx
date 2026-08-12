import React from "react";
import { Building2 } from "lucide-react";
import ScanAttendanceCore from "./ScanAttendanceCore";

// No-login link guards can be given directly, so they can mark staff
// attendance without needing access to the rest of the admin app.
export default function PublicScanAttendancePage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-8">
      <div className="max-w-md mx-auto mb-6 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Building2 size={20} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-heading text-lg">Scan Attendance</p>
          <p className="text-sm text-subtext">Staff ke ID card ka QR code scan karein.</p>
        </div>
      </div>
      <ScanAttendanceCore />
    </div>
  );
}
