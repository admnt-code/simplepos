import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { healthService } from '@/lib/api/health.service'

/**
 * StatusIndicator Component
 * 
 * Zeigt Service-Status mit 2 LEDs:
 * - LED 1: Internet-Verfügbarkeit
 * - LED 2: SumUp API Status
 * 
 * Hinweis: Überwacht nur externe Services während das System läuft.
 * Wenn Backend/Frontend down sind, ist die Webseite nicht erreichbar.
 */
export const StatusIndicator: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false)

  // Query service health status every 30 seconds
  const { data: health, isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: () => healthService.getStatus(),
    refetchInterval: 30000, // 30 seconds
    retry: 3,
    staleTime: 25000, // Consider data stale after 25s
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-green-500'
      case 'mock':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getInternetStatus = () => {
    if (!health || isLoading) return 'bg-gray-400'
    return getStatusColor(health.internet)
  }

  const getSumUpStatus = () => {
    if (!health || isLoading) return 'bg-gray-400'
    return getStatusColor(health.sumup)
  }

  const getTooltipContent = () => {
    if (!health || isLoading) {
      return 'Lade Service-Status...'
    }

    return (
      <div className="space-y-1 text-xs">
        <div className="font-semibold border-b border-gray-300 pb-1 mb-1">
          Service-Status
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(health.internet)}`} />
          <span className="font-medium">Internet:</span>
          <span>{health.internet_message}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(health.sumup)}`} />
          <span className="font-medium">SumUp:</span>
          <span>{health.sumup_message}</span>
        </div>
        <div className="text-[10px] text-gray-500 mt-2 pt-1 border-t border-gray-200">
          Auto-Update alle 30s
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        className="flex items-center gap-1.5 cursor-help px-2 py-1 rounded hover:bg-gray-50 transition-colors"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Internet LED */}
        <div
          className={`w-2.5 h-2.5 rounded-full ${getInternetStatus()} transition-colors duration-300 shadow-sm`}
          title="Internet-Status"
        />
        {/* SumUp LED */}
        <div
          className={`w-2.5 h-2.5 rounded-full ${getSumUpStatus()} transition-colors duration-300 shadow-sm`}
          title="SumUp-Status"
        />
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {getTooltipContent()}
        </div>
      )}
    </div>
  )
}
