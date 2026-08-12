import React from "react";
import PageHeader from "../../components/PageHeader";
import SiteLocationsCore from "./SiteLocationsCore";

export default function SiteLocationsPage() {
  return (
    <div>
      <PageHeader
        title="Site Locations"
        subtitle="Har site ka GPS location set karein — QR attendance scan sirf is location ke tay radius ke andar hi accept hogi."
      />
      <SiteLocationsCore />
    </div>
  );
}
