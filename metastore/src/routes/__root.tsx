import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors expand={true} />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  ),
  notFoundComponent: (props) => <NotFound test={props} />,
});

interface NotFoundProps {
  test: any;
}

function NotFound({ test }: NotFoundProps): React.ReactNode {
  console.log(test);
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen text-center bg-background dark">
        <h1 className="text-7xl font-extrabold  text-foreground">404</h1>
        <p className="text-2xl text-gray-400 mt-2">Oops! Page Not Found</p>
        <Link to="/">
          <Button className=" mt-5">Go Home</Button>
        </Link>
      </div>
    </>
  );
}
