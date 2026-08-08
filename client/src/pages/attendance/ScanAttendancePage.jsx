import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, XCircle, LogIn, LogOut } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import CameraCapture from "../../components/CameraCapture";
import { lookupStaffByEmployeeId, submitAttendanceScan } from "../../api/attendanceScan";

const SCANNER_ID = "qr-scanner-region";

export default function ScanAttendancePage() {
  const [phase, setPhase] = useState("scanning"); // scanning | identified | submitting | done | error
  const [staff, setStaff] = useState(null);
  const [nextType, setNextType] = useState(null);
  const [capture, setCapture] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const scannerRef = useRef(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (phase !== "scanning") return;

    handledRef.current = false;
    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;
    let cancelled = false;
    let started = false;

    // html5-qrcode's stop() throws synchronously (not a rejected promise) if
    // the scanner never finished starting — guard every stop behind this.
    const safeStop = async () => {
      if (!started) return;
      started = false;
      try {
        await scanner.stop();
      } catch {
        /* not running */
      }
    };

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        async (decodedText) => {
          if (cancelled || handledRef.current) return;
          handledRef.current = true;
          await safeStop();
          try {
            const res = await lookupStaffByEmployeeId(decodedText.trim());
            if (cancelled) return;
            setStaff(res.staff);
            setNextType(res.nextType);
            setPhase("identified");
          } catch (err) {
            if (cancelled) return;
            setError(err.response?.data?.message || "Staff nahi mila is QR code se");
            setPhase("error");
          }
        },
        () => {}
      )
      .then(() => {
        started = true;
      })
      .catch(() => {
        if (!cancelled) {
          setError("Camera access nahi mila — permission allow karein");
          setPhase("error");
        }
      });

    return () => {
      cancelled = true;
      safeStop().finally(() => {
        try {
          scanner.clear();
        } catch {
          /* noop */
        }
      });
    };
  }, [phase]);

  const reset = () => {
    setStaff(null);
    setNextType(null);
    setCapture(null);
    setError("");
    setResult(null);
    setPhase("scanning");
  };

  const submit = async () => {
    setPhase("submitting");
    try {
      const data = {
        employeeId: staff.employeeId,
        latitude: capture?.geoLocation?.lat ?? "",
        longitude: capture?.geoLocation?.lng ?? "",
        address: capture?.geoLocation?.address ?? "",
      };
      const res = await submitAttendanceScan(data, capture?.file);
      setResult(res);
      setPhase("done");
    } catch (err) {
      setError(err.response?.data?.message || "Attendance capture nahi ho payi");
      setPhase("error");
    }
  };

  return (
    <div>
      <PageHeader
        title="Scan Attendance"
        subtitle="Staff ke ID card ka QR code scan karein — photo lekar attendance punch in/out ho jayegi."
      />

      <div className="max-w-md mx-auto">
        {phase === "scanning" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div id={SCANNER_ID} className="rounded-xl overflow-hidden" />
            <p className="text-xs text-subtext text-center mt-3">Staff ke ID card ka QR code camera ke saamne rakhein</p>
          </div>
        )}

        {phase === "identified" && staff && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-center gap-3">
              {staff.photo ? (
                <img src={staff.photo} alt="" className="w-14 h-14 rounded-full object-cover border border-gray-200" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200" />
              )}
              <div>
                <p className="font-semibold text-heading">{staff.name}</p>
                <p className="text-sm text-subtext">
                  {staff.designation} • {staff.siteName}
                </p>
              </div>
            </div>

            <div
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold ${
                nextType === "in" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
              }`}
            >
              {nextType === "in" ? <LogIn size={16} /> : <LogOut size={16} />}
              {nextType === "in" ? "Punch In" : "Punch Out"}
            </div>

            <CameraCapture label="Staff ki photo lein" onCapture={setCapture} />

            <div className="flex gap-2">
              <button onClick={reset} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-600">
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={!capture}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-orange-600 disabled:opacity-40"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {phase === "submitting" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-subtext text-sm">Saving...</div>
        )}

        {phase === "done" && result && staff && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-3">
            <CheckCircle2 size={48} className="text-green-600 mx-auto" />
            <p className="text-lg font-bold text-heading">Attendance Done</p>
            <p className="text-sm text-subtext">
              {staff.name} — {result.type === "in" ? "Punch In" : "Punch Out"} — {new Date(result.timestamp).toLocaleTimeString()}
            </p>
            <button onClick={reset} className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-orange-600">
              Scan Next
            </button>
          </div>
        )}

        {phase === "error" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-3">
            <XCircle size={48} className="text-red-500 mx-auto" />
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={reset} className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-orange-600">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
