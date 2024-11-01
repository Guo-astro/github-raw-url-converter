import * as React from "react";
import {
  Link,
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Spinner } from "../components/Spinner";
import type { QueryClient } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Home, Inbox } from "lucide-react";

// function RouterSpinner() {
//   const isLoading = useRouterState({ select: (s) => s.status === "pending" });
//   return <Spinner show={isLoading} />;
// }

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
});
const items = [
  {
    title: "Github raw link converter",
    url: "/github-raw-link-converter",
    icon: Home,
  },
  {
    title: "Datetime converter",
    url: "/datetime-converter",
    icon: Inbox,
  },
];

function RootComponent() {
  return (
    <>
      <div className={`min-h-screen flex flex-col`}>
        <SidebarProvider>
          <Sidebar className="h-full">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>ToolBox</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link
                            to={item.url}
                            preload="intent"
                            className="block py-2 px-3 text-blue-700 flex items-center gap-2"
                            activeProps={{ className: "font-bold" }}
                            activeOptions={{
                              // If the route points to the root of its parent,
                              // make sure it's only active if it's exact
                              exact: item.url === ".",
                            }}
                          >
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <main>
            <SidebarTrigger />
            <Outlet />
          </main>
        </SidebarProvider>
      </div>
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
