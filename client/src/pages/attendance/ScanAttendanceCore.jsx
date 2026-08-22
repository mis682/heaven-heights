import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, XCircle, LogIn, LogOut, Sun, Moon } from "lucide-react";
import CameraCapture from "../../components/CameraCapture";
import { lookupStaffByEmployeeId, submitAttendanceScan } from "../../api/attendanceScan";

const SCANNER_ID = "qr-scanner-region";

function isSecurityGuard(designation) {
  return (designation || "").toLowerCase().replace(/\s+/g, "") === "securityguard";
}

const OFFLINE_MESSAGE = "Internet connection nahi hai — check karke phir try karein";

// A request that never reached the server (no err.response) almost always
// means the device has no connectivity, not that anything about the
// request itself was wrong — showing the generic per-action failure
// message in that case is misleading, since the guard's real problem is
// their internet, not the QR code/photo/whatever they just did.
function friendlyError(err, fallback) {
  if (!navigator.onLine || !err?.response) return OFFLINE_MESSAGE;
  return err.response?.data?.message || fallback;
}

// Holds all the scan/capture/submit logic and UI, with no page chrome of its
// own — used both inside the admin dashboard (ScanAttendancePage) and on the
// public, no-login link guards can be given directly (PublicScanAttendancePage).
export default function ScanAttendanceCore() {
  const [phase, setPhase] = useState("scanning"); // scanning | identified | submitting | done | error
  const [staff, setStaff] = useState(null);
  const [nextType, setNextType] = useState(null);
  const [capture, setCapture] = useState(null);
  const [shift, setShift] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const scannerRef = useRef(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (phase !== "scanning") return;

    // No point starting the camera if there's no connectivity — the lookup
    // right after a successful scan would fail anyway, and starting the
    // camera regardless just leads to the confusing "camera access denied"
    // message this is meant to replace.
    if (!navigator.onLine) {
      setError(OFFLINE_MESSAGE);
      setPhase("error");
      return;
    }

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
        // Capped resolution — QR detection doesn't need a high-res stream,
        // but without a cap the browser defaults to the camera's max
        // resolution, which crashes low-RAM Android phones ("Unable to
        // complete previous operation due to low memory") once the
        // continuous per-frame scanning kicks in. `ideal` only (no `max`) —
        // `max` is a hard constraint and throws OverconstrainedError on
        // devices whose back camera can't hit that exact range, killing the
        // scan before the permission prompt even shows.
        { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
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
            setError(friendlyError(err, "Staff nahi mila is QR code se"));
            setPhase("error");
          }
        },
        () => {}
      )
      .then(() => {
        started = true;
      })
      .catch((err) => {
        if (!cancelled) {
          // Temporary: surface the raw browser error (e.g. NotAllowedError,
          // OverconstrainedError, NotReadableError) instead of a generic
          // message, to pin down why camera start is failing on-site.
          const detail = err?.name || err?.message || String(err);
          setError(
            navigator.onLine
              ? `Camera access nahi mila — permission allow karein (${detail})`
              : OFFLINE_MESSAGE
          );
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
    setShift(null);
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
        shift: shift ?? "",
      };
      const res = await submitAttendanceScan(data, capture?.file);
      setResult(res);
      setPhase("done");
    } catch (err) {
      setError(friendlyError(err, "Attendance capture nahi ho payi"));
      setPhase("error");
    }
  };

  return (
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

          {isSecurityGuard(staff.designation) && (
            <div className="space-y-2">
              <p className="text-xs text-center text-subtext">
                Guards ke liye location check nahi hota — site rotation ke karan.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 text-center">Shift</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShift("day")}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      shift === "day" ? "border-primary bg-primary-light text-primary" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Sun size={15} /> Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setShift("night")}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      shift === "night" ? "border-primary bg-primary-light text-primary" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Moon size={15} /> Night
                  </button>
                </div>
              </div>
            </div>
          )}

          <CameraCapture label="Staff ki photo lein" onCapture={setCapture} />

          <div className="flex gap-2">
            <button onClick={reset} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-600">
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={!capture || (isSecurityGuard(staff.designation) && !shift)}
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
  );
}
