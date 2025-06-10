import React from "react";
import MasterLayout from "../../components/masterLayout";
import LocationListLayer from "../../components/LocationListLayer";

const LocationSuperAdmin = () => {
  return (
    <MasterLayout role="SuperAdmin">
      <LocationListLayer />
    </MasterLayout>
  );
};

export default LocationSuperAdmin; 