export default function AdminDashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-6 bg-card rounded-lg border">
                        <div className="flex justify-between items-center mb-4">
                            <div className="h-4 bg-muted rounded w-24"></div>
                            <div className="h-4 w-4 bg-muted rounded-full"></div>
                        </div>
                        <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-20"></div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="lg:col-span-4 p-6 bg-card rounded-lg border">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <div className="h-5 bg-muted rounded w-32 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-48"></div>
                        </div>
                        <div className="flex gap-2">
                            <div className="h-8 bg-muted rounded w-20"></div>
                            <div className="h-8 bg-muted rounded w-8"></div>
                        </div>
                    </div>
                    <div className="h-[350px] bg-muted/50 rounded"></div>
                </div>
                <div className="lg:col-span-3 p-6 bg-card rounded-lg border">
                    <div className="mb-4">
                        <div className="h-5 bg-muted rounded w-32 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-48"></div>
                    </div>
                    <div className="h-[350px] bg-muted/50 rounded"></div>
                </div>
            </div>

            {/* More Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-6 bg-card rounded-lg border">
                        <div className="mb-4">
                            <div className="h-5 bg-muted rounded w-32 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-48"></div>
                        </div>
                        <div className="h-[300px] bg-muted/50 rounded"></div>
                    </div>
                ))}
            </div>

            {/* Tables Section */}
            <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="p-6 bg-card rounded-lg border">
                        <div className="mb-4">
                            <div className="h-5 bg-muted rounded w-32 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-48"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-10 bg-muted/50 rounded"></div>
                            {Array.from({ length: 5 }).map((_, j) => (
                                <div key={j} className="h-16 bg-muted/30 rounded"></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

