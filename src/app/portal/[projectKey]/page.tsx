"use client";

import { useEffect, useState, use } from "react";
import CustomerPortalPage from "../page";

export default function ProjectSpecificPortalPage({
  params,
}: {
  params: Promise<{ projectKey: string }>;
}) {
  const resolvedParams = use(params);

  return <CustomerPortalPage initialProjectKey={resolvedParams.projectKey} />;
}
