import { createLazyFileRoute } from "@tanstack/react-router";
import Dashboard from "@/features/Main/Dashboard";
import useUser from "@/hooks/useUser";
import { FormatContextType } from "@/context/FormatContext";
import { FormatProvider } from "@/context/FormatContext";

export const Route = createLazyFileRoute("/_authenticated/Dashboard/")({
  component: Dashboard,
});
