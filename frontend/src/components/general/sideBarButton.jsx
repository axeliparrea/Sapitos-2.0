import { NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";

const SidebarButton = ({ to, icon, label }) => {
  return (
    <li>
      <NavLink
        to={to}
        id={`sidebarButton-${label.toLowerCase().replace(/\s+/g, '')}`} // <-- ID agregado aquí
        className={(navData) => (navData.isActive ? "active-page" : "")}
      >
        <Icon icon={icon} className='menu-icon' />
        <span>{label}</span>
      </NavLink>
    </li>
  );
};

export default SidebarButton;
