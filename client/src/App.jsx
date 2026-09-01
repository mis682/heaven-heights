import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import RequireAuth from "./components/RequireAuth";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ComingSoon from "./pages/ComingSoon";

import GCHousekeepingPublicForm from "./pages/housekeeping/GCHousekeepingPublicForm";
import GCHousekeepingSubmissionsPage from "./pages/housekeeping/GCHousekeepingSubmissionsPage";
import GCHousekeepingDailyReportPage from "./pages/housekeeping/GCHousekeepingDailyReportPage";
import GCHousekeepingAdminReportPage from "./pages/housekeeping/GCHousekeepingAdminReportPage";
import GCClubPublicForm from "./pages/housekeeping/GCClubPublicForm";
import GCClubSubmissionsPage from "./pages/housekeeping/GCClubSubmissionsPage";
import GCClubDailyReportPage from "./pages/housekeeping/GCClubDailyReportPage";
import GCClubAdminReportPage from "./pages/housekeeping/GCClubAdminReportPage";
import ReserveClubPublicForm from "./pages/housekeeping/ReserveClubPublicForm";
import ReserveClubSubmissionsPage from "./pages/housekeeping/ReserveClubSubmissionsPage";
import ReserveClubDailyReportPage from "./pages/housekeeping/ReserveClubDailyReportPage";
import ReserveClubAdminReportPage from "./pages/housekeeping/ReserveClubAdminReportPage";

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
import PrintIdCardsPage from "./pages/admin/PrintIdCardsPage";
import UserManagementPage from "./pages/admin/UserManagementPage";

export default function App() {
  return (
    <Routes>
      {/* Public, no-login guard forms */}
      <Route path="/patrol-form/:project" element={<PatrolPublicForm />} />
      <Route path="/night-guard-form" element={<NightGuardPublicForm />} />
      <Route path="/fire-mock-drill-form" element={<FireMockDrillPublicForm />} />
      <Route path="/scan-attendance-form" element={<PublicScanAttendancePage />} />
      <Route path="/site-location-form" element={<PublicSiteLocationsPage />} />
      <Route path="/gc-housekeeping-form/:formNumber" element={<GCHousekeepingPublicForm />} />
      <Route path="/gc-club-form/:formNumber" element={<GCClubPublicForm />} />
      <Route path="/reserve-club-form/:formNumber" element={<ReserveClubPublicForm />} />

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
          path="/housekeeping/garden-city/submissions"
          element={
            <RequireAuth permission={{ module: "gcHousekeeping", action: "view" }}>
              <GCHousekeepingSubmissionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/garden-city/daily-report"
          element={
            <RequireAuth permission={{ module: "gcHousekeeping", action: "edit" }}>
              <GCHousekeepingDailyReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/garden-city/admin-report"
          element={
            <RequireAuth permission={{ module: "gcHousekeeping", action: "view" }}>
              <GCHousekeepingAdminReportPage />
            </RequireAuth>
          }
        />

        <Route
          path="/housekeeping/garden-city-club/submissions"
          element={
            <RequireAuth permission={{ module: "gcClub", action: "view" }}>
              <GCClubSubmissionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/garden-city-club/daily-report"
          element={
            <RequireAuth permission={{ module: "gcClub", action: "edit" }}>
              <GCClubDailyReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/garden-city-club/admin-report"
          element={
            <RequireAuth permission={{ module: "gcClub", action: "view" }}>
              <GCClubAdminReportPage />
            </RequireAuth>
          }
        />

        <Route
          path="/housekeeping/reserve-club/submissions"
          element={
            <RequireAuth permission={{ module: "reserveClub", action: "view" }}>
              <ReserveClubSubmissionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/reserve-club/daily-report"
          element={
            <RequireAuth permission={{ module: "reserveClub", action: "edit" }}>
              <ReserveClubDailyReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/reserve-club/admin-report"
          element={
            <RequireAuth permission={{ module: "reserveClub", action: "view" }}>
              <ReserveClubAdminReportPage />
            </RequireAuth>
          }
        />

        <Route path="/security/patrol/:project/submissions" element={<PatrolSitePage />} />
        {/* Garden City uses a fixed checkpoint+time schedule report format; every
            other patrol site keeps the generic hourly-slot builder below. */}
        <Route
          path="/security/patrol/garden-city/daily-report"
          element={
            <RequireAuth permission={{ module: "patrol", action: "edit" }}>
              <GardenCityDailyReportPage />
            </RequireAuth>
          }
        />
        <Route path="/security/patrol/garden-city/admin-report" element={<GardenCityAdminReportPage />} />
        <Route
          path="/security/patrol/:project/daily-report"
          element={
            <RequireAuth permission={{ module: "patrol", action: "edit" }}>
              <PatrolDailyReportBuilderPage />
            </RequireAuth>
          }
        />
        <Route path="/security/patrol/:project/admin-report" element={<PatrolAdminReportPage />} />

        <Route path="/security/night-guard/submissions" element={<NightGuardSubmissionsPage />} />
        <Route
          path="/security/night-guard/daily-report"
          element={
            <RequireAuth permission={{ module: "nightGuard", action: "edit" }}>
              <NightGuardDailyReportPage />
            </RequireAuth>
          }
        />
        <Route path="/security/night-guard/admin-report" element={<NightGuardAdminReportPage />} />

        <Route path="/security/fire-mock-drill/submissions" element={<FireMockDrillSubmissionsPage />} />

        <Route
          path="/attendance"
          element={
            <RequireAuth permission={{ module: "attendance", action: "edit" }}>
              <AttendancePage />
            </RequireAuth>
          }
        />
        <Route
          path="/attendance/scan"
          element={
            <RequireAuth permission={{ module: "attendance", action: "edit" }}>
              <ScanAttendancePage />
            </RequireAuth>
          }
        />
        <Route
          path="/attendance/records"
          element={
            <RequireAuth permission={{ module: "attendance", action: "view" }}>
              <AttendanceRecordsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/attendance/sites"
          element={
            <RequireAuth permission={{ module: "siteLocations", action: "edit" }}>
              <SiteLocationsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/attendance/team"
          element={
            <RequireAuth permission={{ module: "attendance", action: "view" }}>
              <TeamAttendancePage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/maintenance-staff"
          element={
            <RequireAuth permission={{ module: "maintenanceStaff", action: "view" }}>
              <MaintenanceStaffPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/print-id-cards"
          element={
            <RequireAuth permission={{ module: "guards", action: "edit" }}>
              <PrintIdCardsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/guards"
          element={
            <RequireAuth permission={{ module: "guards", action: "view" }}>
              <GuardMasterDataPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAuth permission={{ module: "users", action: "view" }}>
              <UserManagementPage />
            </RequireAuth>
          }
        />
      </Route>

      <Route path="*" element={<ComingSoon title="Page not found" />} />
    </Routes>
  );
}
