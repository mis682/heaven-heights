import React from "react";
import { MapPin } from "lucide-react";
import SiteLocationsCore from "./SiteLocationsCore";

// No-login link a site supervisor can be given directly, so they can set
// their site's GPS location without needing access to the rest of the admin app.
export default function PublicSiteLocationsPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-8">
      <div className="max-w-3xl mx-auto mb-6 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <MapPin size={20} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-heading text-lg">Site Locations</p>
          <p className="text-sm text-subtext">Apni site ka GPS location set karein.</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto">
        <SiteLocationsCore />
      </div>
    </div>
  );
}
