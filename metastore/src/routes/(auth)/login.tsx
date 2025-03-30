import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginForm } from "@/features/Auth/login";
import { GitMerge } from "lucide-react";
import Image from "@/assets/image.png";

export const Route = createFileRoute("/(auth)/login")({
  beforeLoad: () => {
    if (localStorage.getItem("isAuthenticated")) throw redirect({ to: "/" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 ">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start text-blue-600">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
              <GitMerge className="w-6 h-6 text-blue-600" />
            </div>
            MetaLake
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src={Image}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover "
        />
      </div>
    </div>
  );
}
