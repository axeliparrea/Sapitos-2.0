import SalesStatisticOne from "./general/child/SalesStatisticOne";
import TotalSubscriberOne from "./general/child/TotalSubscriberOne";
import UnitCountOne from "./general/child/UnitCountOne";

const DashBoardLayerOne = () => {
  return (
    <>
      {/* UnitCountOne */}
      <UnitCountOne />

      <section className='row gy-4 mt-1'>
        {/* SalesStatisticOne */}
        <SalesStatisticOne />

        {/* TotalSubscriberOne */}
        <TotalSubscriberOne />

      </section>
    </>
  );
};

export default DashBoardLayerOne;
