import { createLazyFileRoute } from "@tanstack/react-router";
import OnboardingScreen from "@/features/Main/Onboading";

export const Route = createLazyFileRoute("/_authenticated/Onboarding/")({
  component: OnboardingScreen,
});
