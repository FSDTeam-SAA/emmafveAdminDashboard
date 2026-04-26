import React, { useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import { Outlet } from "react-router-dom";
import { socket } from "../context/SocketContect";
import { toast } from "react-toastify";

const DashboardLayout = React.memo(() => {
  useEffect(() => {
    const token = localStorage.getItem("adminAccessToken");
    if (!token) return;

    socket.auth = { token };
    socket.connect();

    const onConnect = () => {
      console.log("Connected to socket server");
    };

    const onDisconnect = () => {
      console.log("Disconnected from socket server");
    };

    const onNewNotification = (data) => {
      console.log("New live notification:", data);
      toast.info(
        <div>
          <strong className="block text-sm">{data?.title || "New Alert"}</strong>
          <span className="text-xs">{data?.description || "You have a new notification"}</span>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          icon: "🔔",
        }
      );
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("notification:new", onNewNotification);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("notification:new", onNewNotification);
      socket.disconnect();
    };
  }, []);
  return (
    <div className="flex min-h-screen bg-[#f5f0e8]">
      <Sidebar />
      <div className="ml-52 flex-1 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
});

export default DashboardLayout;
