'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

/** Altura fixa em px; evita width/height -1 do Recharts quando o pai ainda não tem layout (mobile/flex). */
const CHART_HEIGHT = 288

interface MetricsChartProps {
  totalRevenue: number
  totalPayments: number
  totalUsers: number
  totalTickets: number
}

const METRIC_COLORS = [
  { fill: '#059669', light: '#d1fae5' },  // Arrecadado - esmeralda
  { fill: '#ea580c', light: '#ffedd5' },  // Pedidos - laranja
  { fill: '#2563eb', light: '#dbeafe' },  // Usuários - azul
  { fill: '#7c3aed', light: '#ede9fe' },  // Ticket médio - violeta
  { fill: '#ca8a04', light: '#fef9c3' },  // Bilhetes - âmbar
]

export default function MetricsChart({
  totalRevenue,
  totalPayments,
  totalUsers,
  totalTickets,
}: MetricsChartProps) {
  const ticketMedio = totalPayments > 0 ? totalRevenue / totalPayments : 0

  const rawValues = [totalRevenue, totalPayments, totalUsers, ticketMedio, totalTickets]
  const maxVal = Math.max(...rawValues, 1)
  const data = [
    { name: 'Arrecadado', value: totalRevenue, display: totalRevenue / maxVal, format: 'currency' as const },
    { name: 'Pedidos', value: totalPayments, display: totalPayments / maxVal, format: 'number' as const },
    { name: 'Usuários únicos', value: totalUsers, display: totalUsers / maxVal, format: 'number' as const },
    { name: 'Ticket médio', value: ticketMedio, display: ticketMedio / maxVal, format: 'currency' as const },
    { name: 'Bilhetes', value: totalTickets, display: totalTickets / maxVal, format: 'number' as const },
  ]

  const formatValue = (value: number, format: string) =>
    format === 'currency' ? formatCurrency(value) : value.toLocaleString('pt-BR')

  const [ready, setReady] = useState(false)
  useEffect(() => {
    // Um tick após montagem para o container ter largura/altura definida (evita -1 no ResizeObserver).
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-w-0 w-full">
      <div className="px-6 pt-6 pb-2">
        <h3 className="text-lg font-semibold text-gray-900">Métricas</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Visão geral da arrecadação, pedidos e bilhetes
        </p>
      </div>
      <div className="px-4 pb-6 pt-2 min-w-0">
        <div
          className="w-full min-w-0 min-h-[288px]"
          style={{ height: CHART_HEIGHT }}
        >
          {ready ? (
          <ResponsiveContainer width="100%" height={CHART_HEIGHT} minWidth={0} debounce={32}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 100, bottom: 8 }}
            >
              <XAxis
                type="number"
                domain={[0, 1]}
                hide
                tickFormatter={() => ''}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={96}
                tick={{ fontSize: 13, fill: '#4b5563', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.04)', radius: 8 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const item = payload[0].payload
                  return (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 min-w-[180px]">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        {item.name}
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatValue(item.value, item.format)}
                      </p>
                    </div>
                  )
                }}
              />
              <Bar
                dataKey="display"
                radius={[0, 8, 8, 0]}
                maxBarSize={32}
                label={(props: unknown) => {
                  const p = props as { x?: number; y?: number; width?: number; height?: number; value?: number; payload?: { value: number; format: string } }
                  const x = Number(p.x) || 0
                  const y = Number(p.y) || 0
                  const width = Number(p.width) || 0
                  const height = Number(p.height) || 0
                  const value = Number(p.value) || 0
                  const payload = p.payload
                  return value > 0.05 && payload ? (
                    <text
                      x={x + width + 10}
                      y={y + height / 2}
                      dy={4}
                      fill="#374151"
                      fontSize={12}
                      fontWeight={600}
                    >
                      {formatValue(payload.value, payload.format)}
                    </text>
                  ) : null
                }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={METRIC_COLORS[index].fill}
                    strokeWidth={0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          ) : (
            <div className="h-full w-full animate-pulse rounded-lg bg-gray-100" aria-hidden />
          )}
        </div>
        <div className="flex flex-wrap gap-4 justify-center mt-4 pt-4 border-t border-gray-100">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: METRIC_COLORS[i].fill }}
              />
              <span className="text-sm text-gray-600">{item.name}</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatValue(item.value, item.format)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
