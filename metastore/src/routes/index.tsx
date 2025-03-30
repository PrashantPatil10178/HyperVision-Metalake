import { createFileRoute, useNavigate } from "@tanstack/react-router";
import useUser from "@/hooks/useUser";
import { useEffect, useState } from "react";
import LoadingSkeleton from "@/features/Main/Dashboard/loading";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: userData, isLoading, isError, isSuccess } = useUser();
  const navigate = useNavigate();
  const [hasS3Credentials, setHasS3Credentials] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    if (isError) {
      navigate({ to: "/login" });
    }
  }, [isError, navigate]);

  useEffect(() => {
    if (!userData || isLoading) return;
    if (isSuccess) {
      localStorage.setItem("userID", userData.id);
    }

    const checkS3Credentials = async () => {
      console.log("Fetching S3 credentials...", userData);
      setHasS3Credentials(userData.credentials.length > 0);
    };

    checkS3Credentials();
  }, [userData, isLoading]);

  useEffect(() => {
    if (hasS3Credentials !== null) {
      navigate({ to: hasS3Credentials ? "/Dashboard" : "/Onboarding" });
    }
  }, [hasS3Credentials, navigate]);

  if (isLoading || hasS3Credentials === null) {
    return <LoadingSkeleton />;
  }

  return null;
}
