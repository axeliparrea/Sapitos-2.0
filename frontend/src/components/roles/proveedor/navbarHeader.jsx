import { Icon } from "@iconify/react";
import UserMenu from "../../general/userMenu";

const NavbarHeader = ({ sidebarActive, sidebarControl, mobileMenuControl }) => {
  return (
    <div className="navbar-header">
      <div className="row align-items-center justify-content-between">
        {/* Botones del navbar */}
        <div className="col-auto">
          <div className="d-flex flex-wrap align-items-center gap-4">
            <button type="button" className="sidebar-toggle" onClick={sidebarControl}>
              <Icon
                icon={sidebarActive ? "iconoir:arrow-right" : "heroicons:bars-3-solid"}
                className="icon text-2xl non-active"
              />
            </button>
            <button onClick={mobileMenuControl} type="button" className="sidebar-mobile-toggle">
              <Icon icon="heroicons:bars-3-solid" className="icon" />
            </button>
            {/*<form className="navbar-search">
              <input type="text" name="search" placeholder="Search" />
              <Icon icon="ion:search-outline" className="icon" />
            </form> */}
          </div>
        </div>

        <UserMenu
          name="Sheccid Leija"
          role="Admin"
          profileImage="assets/images/user.png"
          onClose={() => console.log("Cerrar menú")}
        />
      </div>
    </div>
  );
};

export default NavbarHeader;
