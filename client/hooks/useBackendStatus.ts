"use client";

import { useBackendStatus as useBackendStatusFromContext } from "@/context/BackendStatusProvider";

export const useBackendStatus = useBackendStatusFromContext;
export default useBackendStatus;
