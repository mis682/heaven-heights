import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import RequireAuth from "./components/RequireAuth";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ComingSoon from "./pages/ComingSoon";

import HousekeepingPage from "./pages/housekeeping/HousekeepingPage";

import PatrolPublicForm from "./pages/security/patrol/PatrolPublicForm";
import PatrolSitePage from "./pages/security/patrol/PatrolSitePage";
import PatrolDailyReportBuilderPage from "./pages/security/patrol/PatrolDailyReportBuilderPage";
import PatrolAdminReportPage from "./pages/security/patrol/PatrolAdminReportPage";
import GardenCityDailyReportPage from "./pages/security/patrol/GardenCityDailyReportPage";
import GardenCityAdminReportPage from "./pages/security/patrol/GardenCityAdminReportPage";

import NightGuardPublicForm from "./pages/security/nightguard/NightGuardPublicForm";
import NightGuardSubmissionsPage from "./pages/security/nightguard/NightGuardSubmissionsPage";
import NightGuardDailyReportPage from "./pages/security/nightguard/NightGuardDailyReportPage";
import NightGuardAdminReportPage from "./pages/security/nightguard/NightGuardAdminReportPage";

import FireMockDrillPublicForm from "./pages/security/firemockdrill/FireMockDrillPublicForm";
import FireMockDrillSubmissionsPage from "./pages/security/firemockdrill/FireMockDrillSubmissionsPage";

import AttendancePage from "./pages/attendance/AttendancePage";
import ScanAttendancePage from "./pages/attendance/ScanAttendancePage";
import PublicScanAttendancePage from "./pages/attendance/PublicScanAttendancePage";
import AttendanceRecordsPage from "./pages/attendance/AttendanceRecordsPage";
import SiteLocationsPage from "./pages/attendance/SiteLocationsPage";
import PublicSiteLocationsPage from "./pages/attendance/PublicSiteLocationsPage";
import TeamAttendancePage from "./pages/attendance/TeamAttendancePage";

import GuardMasterDataPage from "./pages/admin/GuardMasterDataPage";
import MaintenanceStaffPage from "./pages/admin/MaintenanceStaffPage";
import { ADMIN_ONLY_ROLES, DAILY_REPORT_ROLES } from "./layouts/navConfig";

export default function App() {
  return (
    <Routes>
      {/* Public, no-login guard forms */}
      <Route path="/patrol-form/:project" element={<PatrolPublicForm />} />
      <Route path="/night-guard-form" element={<NightGuardPublicForm />} />
      <Route path="/fire-mock-drill-form" element={<FireMockDrillPublicForm />} />
      <Route path="/scan-attendance-form" element={<PublicScanAttendancePage />} />
      <Route path="/site-location-form" element={<PublicSiteLocationsPage />} />

      <Route path="/login" element={<Login />} />

      <Route
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Home />} />

        <Route
          path="/housekeeping"
          element={
            <RequireAuth roles={ADMIN_ONLY_ROLES}>
              <HousekeepingPage />
            </RequireAuth>
          }
        />

        <Route path="/security/patrol/:project/submissions" element={<PatrolSitePage />} />
        {/* Garden City uses a fixed checkpoint+time schedule report format; every
            other patrol site keeps the generic hourly-slot builder below. */}
        <Route
          path="/security/patrol/garden-city/daily-report"
          element={
            <RequireAuth roles={DAILY_REPORT_ROLES}>
              <GardenCityDailyReportPage />
            </RequireAuth>
          }
        />
        <Route path="/security/patrol/garden-city/admin-report" element={<GardenCityAdminReportPage />} />
        <Route
          path="/security/patrol/:project/daily-report"
          element={
            <RequireAuth roles={DAILY_REPORT_ROLES}>
              <PatrolDailyReportBuilderPage />
            </RequireAuth>
          }
        />
        <Route path="/security/patrol/:project/admin-report" element={<PatrolAdminReportPage />} />

        <Route path="/security/night-guard/submissions" element={<NightGuardSubmissionsPage />} />
        <Route
          path="/security/night-guard/daily-report"
          element={
            <RequireAuth roles={DAILY_REPORT_ROLES}>
              <NightGuardDailyReportPage />
            </RequireAuth>
          }
        />
        <Route path="/security/night-guard/admin-report" element={<NightGuardAdminReportPage />} />

        <Route path="/security/fire-mock-drill/submissions" element={<FireMockDrillSubmissionsPage />} />

        <Route
          path="/attendance"
          element={
            <RequireAuth roles={ADMIN_ONLY_ROLES}>
              <AttendancePage />
            </RequireAuth>
          }
        />
        <Route
          path="/attendance/scan"
          element={
            <RequireAuth roles={ADMIN_ONLY_ROLES}>
              <ScanAttendancePage />
            </RequireAuth>
          }
        />
        <Route
          path="/attendance/records"
          element={
            <RequireAuth roles={ADMIN_ONLY_ROLES}>
              <AttendanceRecordsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/attendance/sites"
          element={
            <RequireAuth roles={ADMIN_ONLY_ROLES}>
              <SiteLocationsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/attendance/team"
          element={
            <RequireAuth roles={ADMIN_ONLY_ROLES}>
              <TeamAttendancePage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/maintenance-staff"
          element={
            <RequireAuth roles={ADMIN_ONLY_ROLES}>
              <MaintenanceStaffPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/guards"
          element={
            <RequireAuth roles={ADMIN_ONLY_ROLES}>
              <GuardMasterDataPage />
            </RequireAuth>
          }
        />
      </Route>

      <Route path="*" element={<ComingSoon title="Page not found" />} />
    </Routes>
  );
}
