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
import GCHousekeepingKpiPage from "./pages/housekeeping/GCHousekeepingKpiPage";
import GCClubPublicForm from "./pages/housekeeping/GCClubPublicForm";
import GCClubSubmissionsPage from "./pages/housekeeping/GCClubSubmissionsPage";
import GCClubDailyReportPage from "./pages/housekeeping/GCClubDailyReportPage";
import GCClubAdminReportPage from "./pages/housekeeping/GCClubAdminReportPage";
import GCClubKpiPage from "./pages/housekeeping/GCClubKpiPage";
import ReserveClubPublicForm from "./pages/housekeeping/ReserveClubPublicForm";
import ReserveClubSubmissionsPage from "./pages/housekeeping/ReserveClubSubmissionsPage";
import ReserveClubDailyReportPage from "./pages/housekeeping/ReserveClubDailyReportPage";
import ReserveClubAdminReportPage from "./pages/housekeeping/ReserveClubAdminReportPage";
import ReserveClubKpiPage from "./pages/housekeeping/ReserveClubKpiPage";
import RegalGardenClubPublicForm from "./pages/housekeeping/RegalGardenClubPublicForm";
import RegalGardenClubSubmissionsPage from "./pages/housekeeping/RegalGardenClubSubmissionsPage";
import RegalGardenClubDailyReportPage from "./pages/housekeeping/RegalGardenClubDailyReportPage";
import RegalGardenClubAdminReportPage from "./pages/housekeeping/RegalGardenClubAdminReportPage";
import RegalGardenClubKpiPage from "./pages/housekeeping/RegalGardenClubKpiPage";
import OneBusinessCenterPublicForm from "./pages/housekeeping/OneBusinessCenterPublicForm";
import OneBusinessCenterSubmissionsPage from "./pages/housekeeping/OneBusinessCenterSubmissionsPage";
import OneBusinessCenterDailyReportPage from "./pages/housekeeping/OneBusinessCenterDailyReportPage";
import OneBusinessCenterAdminReportPage from "./pages/housekeeping/OneBusinessCenterAdminReportPage";
import OneBusinessCenterKpiPage from "./pages/housekeeping/OneBusinessCenterKpiPage";
import NatureParkPublicForm from "./pages/housekeeping/NatureParkPublicForm";
import NatureParkSubmissionsPage from "./pages/housekeeping/NatureParkSubmissionsPage";
import NatureParkDailyReportPage from "./pages/housekeeping/NatureParkDailyReportPage";
import NatureParkAdminReportPage from "./pages/housekeeping/NatureParkAdminReportPage";
import NatureParkKpiPage from "./pages/housekeeping/NatureParkKpiPage";
import RegalGardenPublicForm from "./pages/housekeeping/RegalGardenPublicForm";
import RegalGardenSubmissionsPage from "./pages/housekeeping/RegalGardenSubmissionsPage";
import RegalGardenDailyReportPage from "./pages/housekeeping/RegalGardenDailyReportPage";
import RegalGardenAdminReportPage from "./pages/housekeeping/RegalGardenAdminReportPage";
import RegalGardenKpiPage from "./pages/housekeeping/RegalGardenKpiPage";
import EdenGardenPublicForm from "./pages/housekeeping/EdenGardenPublicForm";
import EdenGardenSubmissionsPage from "./pages/housekeeping/EdenGardenSubmissionsPage";
import EdenGardenDailyReportPage from "./pages/housekeeping/EdenGardenDailyReportPage";
import EdenGardenAdminReportPage from "./pages/housekeeping/EdenGardenAdminReportPage";
import EdenGardenKpiPage from "./pages/housekeeping/EdenGardenKpiPage";
import NeoMeridianPublicForm from "./pages/housekeeping/NeoMeridianPublicForm";
import NeoMeridianSubmissionsPage from "./pages/housekeeping/NeoMeridianSubmissionsPage";
import NeoMeridianDailyReportPage from "./pages/housekeeping/NeoMeridianDailyReportPage";
import NeoMeridianAdminReportPage from "./pages/housekeeping/NeoMeridianAdminReportPage";
import NeoMeridianKpiPage from "./pages/housekeeping/NeoMeridianKpiPage";
import MilestonePublicForm from "./pages/housekeeping/MilestonePublicForm";
import MilestoneSubmissionsPage from "./pages/housekeeping/MilestoneSubmissionsPage";
import MilestoneDailyReportPage from "./pages/housekeeping/MilestoneDailyReportPage";
import MilestoneAdminReportPage from "./pages/housekeeping/MilestoneAdminReportPage";
import MilestoneKpiPage from "./pages/housekeeping/MilestoneKpiPage";
import SchoolPublicForm from "./pages/housekeeping/SchoolPublicForm";
import SchoolSubmissionsPage from "./pages/housekeeping/SchoolSubmissionsPage";
import SchoolDailyReportPage from "./pages/housekeeping/SchoolDailyReportPage";
import SchoolAdminReportPage from "./pages/housekeeping/SchoolAdminReportPage";
import SchoolKpiPage from "./pages/housekeeping/SchoolKpiPage";
import WeeklyUpdatePublicForm from "./pages/housekeeping/WeeklyUpdatePublicForm";
import WeeklyUpdateSubmissionsPage from "./pages/housekeeping/WeeklyUpdateSubmissionsPage";
import WeeklyUpdateDailyReportPage from "./pages/housekeeping/WeeklyUpdateDailyReportPage";
import WeeklyUpdateAdminReportPage from "./pages/housekeeping/WeeklyUpdateAdminReportPage";
import WeeklyUpdateKpiPage from "./pages/housekeeping/WeeklyUpdateKpiPage";
import HydeParkPublicForm from "./pages/housekeeping/HydeParkPublicForm";
import HydeParkSubmissionsPage from "./pages/housekeeping/HydeParkSubmissionsPage";
import HydeParkDailyReportPage from "./pages/housekeeping/HydeParkDailyReportPage";
import HydeParkAdminReportPage from "./pages/housekeeping/HydeParkAdminReportPage";
import HydeParkKpiPage from "./pages/housekeeping/HydeParkKpiPage";
import HeadOfficePublicForm from "./pages/housekeeping/HeadOfficePublicForm";
import HeadOfficeSubmissionsPage from "./pages/housekeeping/HeadOfficeSubmissionsPage";
import HeadOfficeDailyReportPage from "./pages/housekeeping/HeadOfficeDailyReportPage";
import HeadOfficeAdminReportPage from "./pages/housekeeping/HeadOfficeAdminReportPage";
import HeadOfficeKpiPage from "./pages/housekeeping/HeadOfficeKpiPage";
import PropertyManagementFormEntry from "./pages/housekeeping/PropertyManagementFormEntry";
import PmRegalGardenPublicForm from "./pages/housekeeping/PmRegalGardenPublicForm";
import PmRegalGardenSubmissionsPage from "./pages/housekeeping/PmRegalGardenSubmissionsPage";
import PmRegalGardenDailyReportPage from "./pages/housekeeping/PmRegalGardenDailyReportPage";
import PmRegalGardenAdminReportPage from "./pages/housekeeping/PmRegalGardenAdminReportPage";
import PmRegalGardenKpiPage from "./pages/housekeeping/PmRegalGardenKpiPage";
import PmEdenGardenPublicForm from "./pages/housekeeping/PmEdenGardenPublicForm";
import PmEdenGardenSubmissionsPage from "./pages/housekeeping/PmEdenGardenSubmissionsPage";
import PmEdenGardenDailyReportPage from "./pages/housekeeping/PmEdenGardenDailyReportPage";
import PmEdenGardenAdminReportPage from "./pages/housekeeping/PmEdenGardenAdminReportPage";
import PmEdenGardenKpiPage from "./pages/housekeeping/PmEdenGardenKpiPage";
import PmGardenCityPublicForm from "./pages/housekeeping/PmGardenCityPublicForm";
import PmGardenCitySubmissionsPage from "./pages/housekeeping/PmGardenCitySubmissionsPage";
import PmGardenCityDailyReportPage from "./pages/housekeeping/PmGardenCityDailyReportPage";
import PmGardenCityAdminReportPage from "./pages/housekeeping/PmGardenCityAdminReportPage";
import PmGardenCityKpiPage from "./pages/housekeeping/PmGardenCityKpiPage";
import MaintenanceUniformPublicForm from "./pages/admin/MaintenanceUniformPublicForm";
import MaintenanceUniformSubmissionsPage from "./pages/admin/MaintenanceUniformSubmissionsPage";
import MaintenanceUniformDailyReportPage from "./pages/admin/MaintenanceUniformDailyReportPage";
import MaintenanceUniformAdminReportPage from "./pages/admin/MaintenanceUniformAdminReportPage";
import MaintenanceUniformStaffListPage from "./pages/admin/MaintenanceUniformStaffListPage";
import MaintenanceUniformKpiPage from "./pages/admin/MaintenanceUniformKpiPage";

import PatrolPublicForm from "./pages/security/patrol/PatrolPublicForm";
import PatrolSitePage from "./pages/security/patrol/PatrolSitePage";
import PatrolDailyReportBuilderPage from "./pages/security/patrol/PatrolDailyReportBuilderPage";
import PatrolAdminReportPage from "./pages/security/patrol/PatrolAdminReportPage";
import GardenCityDailyReportPage from "./pages/security/patrol/GardenCityDailyReportPage";
import GardenCityAdminReportPage from "./pages/security/patrol/GardenCityAdminReportPage";
import GardenCityGuardKpiPage from "./pages/security/patrol/GardenCityGuardKpiPage";
import PatrolGuardKpiPage from "./pages/security/patrol/PatrolGuardKpiPage";

import NightGuardPublicForm from "./pages/security/nightguard/NightGuardPublicForm";
import NightGuardSubmissionsPage from "./pages/security/nightguard/NightGuardSubmissionsPage";
import NightGuardDailyReportPage from "./pages/security/nightguard/NightGuardDailyReportPage";
import NightGuardAdminReportPage from "./pages/security/nightguard/NightGuardAdminReportPage";
import NightGuardGuardKpiPage from "./pages/security/nightguard/NightGuardGuardKpiPage";

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
      <Route path="/regal-garden-club-form/:formNumber" element={<RegalGardenClubPublicForm />} />
      <Route path="/one-business-center-form/:formNumber" element={<OneBusinessCenterPublicForm />} />
      <Route path="/nature-park-form/:formNumber" element={<NatureParkPublicForm />} />
      <Route path="/regal-garden-form/:formNumber" element={<RegalGardenPublicForm />} />
      <Route path="/eden-garden-form/:formNumber" element={<EdenGardenPublicForm />} />
      <Route path="/neo-meridian-form/:formNumber" element={<NeoMeridianPublicForm />} />
      <Route path="/head-office-form/:formNumber" element={<HeadOfficePublicForm />} />
      <Route path="/milestone-form/:formNumber" element={<MilestonePublicForm />} />
      <Route path="/school-form/:formNumber" element={<SchoolPublicForm />} />
      <Route path="/weekly-update-form/:formNumber" element={<WeeklyUpdatePublicForm />} />
      <Route path="/hyde-park-form/:formNumber" element={<HydeParkPublicForm />} />
      <Route path="/property-management-form" element={<PropertyManagementFormEntry />} />
      <Route path="/pm-regal-garden-form/:formNumber" element={<PmRegalGardenPublicForm />} />
      <Route path="/pm-eden-garden-form/:formNumber" element={<PmEdenGardenPublicForm />} />
      <Route path="/pm-garden-city-form/:formNumber" element={<PmGardenCityPublicForm />} />
      <Route path="/maintenance-uniform-form" element={<MaintenanceUniformPublicForm />} />

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
          path="/housekeeping/garden-city/kpi"
          element={
            <RequireAuth permission={{ module: "gcHousekeeping", action: "view" }}>
              <GCHousekeepingKpiPage />
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
          path="/housekeeping/garden-city-club/kpi"
          element={
            <RequireAuth permission={{ module: "gcClub", action: "view" }}>
              <GCClubKpiPage />
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
        <Route
          path="/housekeeping/reserve-club/kpi"
          element={
            <RequireAuth permission={{ module: "reserveClub", action: "view" }}>
              <ReserveClubKpiPage />
            </RequireAuth>
          }
        />

        <Route
          path="/housekeeping/regal-garden-club/submissions"
          element={
            <RequireAuth permission={{ module: "regalGardenClub", action: "view" }}>
              <RegalGardenClubSubmissionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/regal-garden-club/daily-report"
          element={
            <RequireAuth permission={{ module: "regalGardenClub", action: "edit" }}>
              <RegalGardenClubDailyReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/regal-garden-club/admin-report"
          element={
            <RequireAuth permission={{ module: "regalGardenClub", action: "view" }}>
              <RegalGardenClubAdminReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/regal-garden-club/kpi"
          element={
            <RequireAuth permission={{ module: "regalGardenClub", action: "view" }}>
              <RegalGardenClubKpiPage />
            </RequireAuth>
          }
        />

        <Route
          path="/housekeeping/one-business-center/submissions"
          element={
            <RequireAuth permission={{ module: "oneBusinessCenter", action: "view" }}>
              <OneBusinessCenterSubmissionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/one-business-center/daily-report"
          element={
            <RequireAuth permission={{ module: "oneBusinessCenter", action: "edit" }}>
              <OneBusinessCenterDailyReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/one-business-center/admin-report"
          element={
            <RequireAuth permission={{ module: "oneBusinessCenter", action: "view" }}>
              <OneBusinessCenterAdminReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/one-business-center/kpi"
          element={
            <RequireAuth permission={{ module: "oneBusinessCenter", action: "view" }}>
              <OneBusinessCenterKpiPage />
            </RequireAuth>
          }
        />

        <Route
          path="/housekeeping/nature-park/submissions"
          element={
            <RequireAuth permission={{ module: "naturePark", action: "view" }}>
              <NatureParkSubmissionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/nature-park/daily-report"
          element={
            <RequireAuth permission={{ module: "naturePark", action: "edit" }}>
              <NatureParkDailyReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/nature-park/admin-report"
          element={
            <RequireAuth permission={{ module: "naturePark", action: "view" }}>
              <NatureParkAdminReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/nature-park/kpi"
          element={
            <RequireAuth permission={{ module: "naturePark", action: "view" }}>
              <NatureParkKpiPage />
            </RequireAuth>
          }
        />

        <Route
          path="/housekeeping/regal-garden/submissions"
          element={
            <RequireAuth permission={{ module: "regalGarden", action: "view" }}>
              <RegalGardenSubmissionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/regal-garden/daily-report"
          element={
            <RequireAuth permission={{ module: "regalGarden", action: "edit" }}>
              <RegalGardenDailyReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/regal-garden/admin-report"
          element={
            <RequireAuth permission={{ module: "regalGarden", action: "view" }}>
              <RegalGardenAdminReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/regal-garden/kpi"
          element={
            <RequireAuth permission={{ module: "regalGarden", action: "view" }}>
              <RegalGardenKpiPage />
            </RequireAuth>
          }
        />

        <Route
          path="/housekeeping/eden-garden/submissions"
          element={
            <RequireAuth permission={{ module: "edenGarden", action: "view" }}>
              <EdenGardenSubmissionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/eden-garden/daily-report"
          element={
            <RequireAuth permission={{ module: "edenGarden", action: "edit" }}>
              <EdenGardenDailyReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/eden-garden/admin-report"
          element={
            <RequireAuth permission={{ module: "edenGarden", action: "view" }}>
              <EdenGardenAdminReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/eden-garden/kpi"
          element={
            <RequireAuth permission={{ module: "edenGarden", action: "view" }}>
              <EdenGardenKpiPage />
            </RequireAuth>
          }
        />

        <Route
          path="/housekeeping/neo-meridian/submissions"
          element={
            <RequireAuth permission={{ module: "neoMeridian", action: "view" }}>
              <NeoMeridianSubmissionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/neo-meridian/daily-report"
          element={
            <RequireAuth permission={{ module: "neoMeridian", action: "edit" }}>
              <NeoMeridianDailyReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/neo-meridian/admin-report"
          element={
            <RequireAuth permission={{ module: "neoMeridian", action: "view" }}>
              <NeoMeridianAdminReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/neo-meridian/kpi"
          element={
            <RequireAuth permission={{ module: "neoMeridian", action: "view" }}>
              <NeoMeridianKpiPage />
            </RequireAuth>
          }
        />

        <Route
          path="/housekeeping/head-office/submissions"
          element={
            <RequireAuth permission={{ module: "headOffice", action: "view" }}>
              <HeadOfficeSubmissionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/head-office/daily-report"
          element={
            <RequireAuth permission={{ module: "headOffice", action: "edit" }}>
              <HeadOfficeDailyReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/head-office/admin-report"
          element={
            <RequireAuth permission={{ module: "headOffice", action: "view" }}>
              <HeadOfficeAdminReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/head-office/kpi"
          element={
            <RequireAuth permission={{ module: "headOffice", action: "view" }}>
              <HeadOfficeKpiPage />
            </RequireAuth>
          }
        />

        <Route
          path="/housekeeping/milestone/submissions"
          element={
            <RequireAuth permission={{ module: "milestone", action: "view" }}>
              <MilestoneSubmissionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/milestone/daily-report"
          element={
            <RequireAuth permission={{ module: "milestone", action: "edit" }}>
              <MilestoneDailyReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/milestone/admin-report"
          element={
            <RequireAuth permission={{ module: "milestone", action: "view" }}>
              <MilestoneAdminReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/milestone/kpi"
          element={
            <RequireAuth permission={{ module: "milestone", action: "view" }}>
              <MilestoneKpiPage />
            </RequireAuth>
          }
        />

        <Route
          path="/housekeeping/school/submissions"
          element={
            <RequireAuth permission={{ module: "school", action: "view" }}>
              <SchoolSubmissionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/school/daily-report"
          element={
            <RequireAuth permission={{ module: "school", action: "edit" }}>
              <SchoolDailyReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/school/admin-report"
          element={
            <RequireAuth permission={{ module: "school", action: "view" }}>
              <SchoolAdminReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/school/kpi"
          element={
            <RequireAuth permission={{ module: "school", action: "view" }}>
              <SchoolKpiPage />
            </RequireAuth>
          }
        />

        <Route
          path="/housekeeping/weekly-update/submissions"
          element={
            <RequireAuth permission={{ module: "weeklyUpdate", action: "view" }}>
              <WeeklyUpdateSubmissionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/weekly-update/daily-report"
          element={
            <RequireAuth permission={{ module: "weeklyUpdate", action: "edit" }}>
              <WeeklyUpdateDailyReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/weekly-update/admin-report"
          element={
            <RequireAuth permission={{ module: "weeklyUpdate", action: "view" }}>
              <WeeklyUpdateAdminReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/weekly-update/kpi"
          element={
            <RequireAuth permission={{ module: "weeklyUpdate", action: "view" }}>
              <WeeklyUpdateKpiPage />
            </RequireAuth>
          }
        />

        <Route
          path="/housekeeping/hyde-park/submissions"
          element={
            <RequireAuth permission={{ module: "hydePark", action: "view" }}>
              <HydeParkSubmissionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/hyde-park/daily-report"
          element={
            <RequireAuth permission={{ module: "hydePark", action: "edit" }}>
              <HydeParkDailyReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/hyde-park/admin-report"
          element={
            <RequireAuth permission={{ module: "hydePark", action: "view" }}>
              <HydeParkAdminReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/housekeeping/hyde-park/kpi"
          element={
            <RequireAuth permission={{ module: "hydePark", action: "view" }}>
              <HydeParkKpiPage />
            </RequireAuth>
          }
        />

        <Route
          path="/property-management/pm-regal-garden/submissions"
          element={
            <RequireAuth permission={{ module: "pmRegalGarden", action: "view" }}>
              <PmRegalGardenSubmissionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/property-management/pm-regal-garden/daily-report"
          element={
            <RequireAuth permission={{ module: "pmRegalGarden", action: "edit" }}>
              <PmRegalGardenDailyReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/property-management/pm-regal-garden/admin-report"
          element={
            <RequireAuth permission={{ module: "pmRegalGarden", action: "view" }}>
              <PmRegalGardenAdminReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/property-management/pm-regal-garden/kpi"
          element={
            <RequireAuth permission={{ module: "pmRegalGarden", action: "view" }}>
              <PmRegalGardenKpiPage />
            </RequireAuth>
          }
        />

        <Route
          path="/property-management/pm-eden-garden/submissions"
          element={
            <RequireAuth permission={{ module: "pmEdenGarden", action: "view" }}>
              <PmEdenGardenSubmissionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/property-management/pm-eden-garden/daily-report"
          element={
            <RequireAuth permission={{ module: "pmEdenGarden", action: "edit" }}>
              <PmEdenGardenDailyReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/property-management/pm-eden-garden/admin-report"
          element={
            <RequireAuth permission={{ module: "pmEdenGarden", action: "view" }}>
              <PmEdenGardenAdminReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/property-management/pm-eden-garden/kpi"
          element={
            <RequireAuth permission={{ module: "pmEdenGarden", action: "view" }}>
              <PmEdenGardenKpiPage />
            </RequireAuth>
          }
        />

        <Route
          path="/property-management/pm-garden-city/submissions"
          element={
            <RequireAuth permission={{ module: "pmGardenCity", action: "view" }}>
              <PmGardenCitySubmissionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/property-management/pm-garden-city/daily-report"
          element={
            <RequireAuth permission={{ module: "pmGardenCity", action: "edit" }}>
              <PmGardenCityDailyReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/property-management/pm-garden-city/admin-report"
          element={
            <RequireAuth permission={{ module: "pmGardenCity", action: "view" }}>
              <PmGardenCityAdminReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/property-management/pm-garden-city/kpi"
          element={
            <RequireAuth permission={{ module: "pmGardenCity", action: "view" }}>
              <PmGardenCityKpiPage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/maintenance-uniform/submissions"
          element={
            <RequireAuth permission={{ module: "maintenanceUniform", action: "view" }}>
              <MaintenanceUniformSubmissionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/maintenance-uniform/daily-report"
          element={
            <RequireAuth permission={{ module: "maintenanceUniform", action: "edit" }}>
              <MaintenanceUniformDailyReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/maintenance-uniform/admin-report"
          element={
            <RequireAuth permission={{ module: "maintenanceUniform", action: "view" }}>
              <MaintenanceUniformAdminReportPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/maintenance-uniform/kpi"
          element={
            <RequireAuth permission={{ module: "maintenanceUniform", action: "view" }}>
              <MaintenanceUniformKpiPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/maintenance-uniform/staff-list"
          element={
            <RequireAuth permission={{ module: "maintenanceUniform", action: "view" }}>
              <MaintenanceUniformStaffListPage />
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
        <Route path="/security/patrol/garden-city/guard-kpi" element={<GardenCityGuardKpiPage />} />
        <Route path="/security/patrol/:project/guard-kpi" element={<PatrolGuardKpiPage />} />
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
        <Route path="/security/night-guard/guard-kpi" element={<NightGuardGuardKpiPage />} />

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
