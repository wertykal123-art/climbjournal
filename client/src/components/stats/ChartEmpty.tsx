import { BarChart3 } from 'lucide-react'

export default function ChartEmpty({ height = 300, message = 'No data yet' }: { height?: number; message?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 text-rock-400 text-sm"
      style={{ height }}
    >
      <BarChart3 className="w-8 h-8" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}
