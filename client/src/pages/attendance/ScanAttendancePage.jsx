import React from "react";
import PageHeader from "../../components/PageHeader";
import ScanAttendanceCore from "./ScanAttendanceCore";

export default function ScanAttendancePage() {
  return (
    <div>
      <PageHeader
        title="Scan Attendance"
        subtitle="Staff ke ID card ka QR code scan karein — photo lekar attendance punch in/out ho jayegi."
      />
      <ScanAttendanceCore />
    </div>
  );
}
