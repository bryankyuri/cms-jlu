import React from "react";
import { Link, useLocation } from "react-router-dom";

const Breadcrumb = () => {
  const location = useLocation();
  
  // Skip rendering breadcrumbs on the home page
  if (location.pathname === "/") {
    return null;
  }

  // Create breadcrumb items based on the current path
  const pathSegments = location.pathname.split("/").filter(segment => segment);
  
  const breadcrumbItems = [
    { path: "/", label: "Home" },
    ...pathSegments.map((segment, index) => {
      const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
      // Capitalize first letter and replace hyphens with spaces
      const label = segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
      
      return { path, label };
    })
  ];

  return (
    <nav className="px-4 py-2 lg:px-6" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center text-[12px]">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.path}>
            {index > 0 && (
              <li className="mx-2 text-xs text-gray-400" aria-hidden="true">
                /
              </li>
            )}
            <li className={index === breadcrumbItems.length - 1 ? "text-primary" : "text-secondary"}>
              {index === breadcrumbItems.length - 1 ? (
                <span aria-current="page">{item.label}</span>
              ) : (
                <Link 
                  to={item.path}
                  className="hover:underline transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;