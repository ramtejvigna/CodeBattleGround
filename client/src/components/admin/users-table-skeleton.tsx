export default function UsersTableSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <div className="h-10 bg-muted rounded-md"></div>
                </div>
            </div>

            <div className="rounded-md border">
                <div className="h-12 bg-muted/50 rounded-t-md"></div>
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="h-16 border-t bg-muted/20"></div>
                ))}
            </div>

            <div className="flex justify-center">
                <div className="h-10 bg-muted/30 rounded-md w-64"></div>
            </div>
        </div>
    )
}

