import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import Footer from "./Footer";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";
import { PageTransition } from "./PageTransition";
// import ThemeToggle from "./ThemeToggle";
import Breadcrumb from "./Breadcrumb";

const Layout = () => {
  const { deviceType } = useContext(AppContext);
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation deviceType={deviceType} />
      <main className="flex-1 mt-[66px] lg:mt-[62px]">
        <Breadcrumb />
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer deviceType={deviceType} />
      {/* <ThemeToggle /> */}
    </div>
  );
};

export default Layout;
