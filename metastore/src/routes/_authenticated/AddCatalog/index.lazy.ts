import { createLazyFileRoute } from "@tanstack/react-router";
import AddCatalogScreen from "@/features/Main/Add Catalog";

export const Route = createLazyFileRoute("/_authenticated/AddCatalog/")({
  component: AddCatalogScreen,
});
