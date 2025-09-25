import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import Dashboard from "../pages/Dashboard";
import Works from "../pages/Works";
import WorkDetail from "../pages/works/detail/index";
import WorkCreate from "../pages/works/create/index";
import WorkEdit from "../pages/works/edit/index";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import NotFound from "../pages/NotFound";
import { ScrollToTop } from "../components/ScrollToTop";
import { RouterProgress } from "../components/RouterProgress";
import AuthLayout from "../components/AuthLayout";
import GuestLayout from "../components/GuestLayout";
import Media from "../pages/Media/index";
import VideoBanner from "../pages/VideoBanner";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <>
        <RouterProgress />
        <ScrollToTop>
          <GuestLayout>
            <Login />
          </GuestLayout>
        </ScrollToTop>
      </>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <>
        <RouterProgress />
        <ScrollToTop>
          <GuestLayout>
            <ForgotPassword />
          </GuestLayout>
        </ScrollToTop>
      </>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <>
        <RouterProgress />
        <ScrollToTop>
          <GuestLayout>
            <ResetPassword />
          </GuestLayout>
        </ScrollToTop>
      </>
    ),
  },
  {
    path: "/",
    element: (
      <>
        <RouterProgress />
        <ScrollToTop>
          <AuthLayout>
            <Layout />
          </AuthLayout>
        </ScrollToTop>
      </>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
        loader: () => null,
      },
      {
        path: "works",
        element: <Works />,
        loader: () => null,
      },
       {
        path: "works/create",
        element: <WorkCreate />,
        loader: () => null,
      },
      {
        path: "works/detail/:id",
        element: <WorkDetail />,
        loader: () => null,
      },
       {
        path: "works/edit/:id",
        element: <WorkEdit />,
        loader: () => null,
      },
      {
        path: "media",
        element: <Media />,
        loader: () => null,
      },
      {
        path: "video-banner",
        element: <VideoBanner />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
