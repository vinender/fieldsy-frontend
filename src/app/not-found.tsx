'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
            <p className="text-gray-600">Could not find requested resource</p>
            <Button
                onClick={() => window.location.href = '/'}
                variant="default"
            >
                Return Home
            </Button>
        </div>
    )
}
