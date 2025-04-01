import SalesStatisticOne from "./child/SalesStatisticOne";
import TotalSubscriberOne from "./child/TotalSubscriberOne";
import UnitCountOne from "./child/UnitCountOne";

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
