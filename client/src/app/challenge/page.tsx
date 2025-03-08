"use client"

import { Suspense } from "react"
import ChallengesPage from "@/components/Challenge-Page"
import Loader from "@/components/Loader" // Assuming your Loader component path

export default function Page() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader /></div>}>
            <ChallengesPage />
        </Suspense>
    )
}