import React from "react";
import ArticulosListLayer from "../../components/ArticulosListLayer";
import MasterLayout from "../../components/masterLayout";

const ArticulosSuperAdmin = () => {
  return (
    <MasterLayout role="SuperAdmin">
      <main className="main-content">
        <section className="content-wrapper py-4 px-3">
          <ArticulosListLayer />
        </section>
      </main>
    </MasterLayout>
  );
};

export default ArticulosSuperAdmin; 