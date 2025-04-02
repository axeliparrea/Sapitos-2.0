import { NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";

const SidebarButton = ({ to, icon, label }) => {
  return (
    <li>
      <NavLink to={to} className={(navData) => (navData.isActive ? "active-page" : "")}>
        <Icon icon={icon} className='menu-icon' />
        <span>{label}</span>
      </NavLink>
    </li>
  );
};

export default SidebarButton;
