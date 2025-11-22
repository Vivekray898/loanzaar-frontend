'use client'

import { useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function EMIDonutChart({ principal = 0, interest = 0, size = 360 }) {
  const data = useMemo(() => ({
    labels: ['Principal Amount', 'Interest Amount'],
    datasets: [
      {
        data: [Math.max(0, principal), Math.max(0, interest)],
        backgroundColor: ['#60A5FA', '#93C5FD'],
        borderWidth: 0,
        hoverOffset: 6,
      }
    ]
  }), [principal, interest])

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 14,
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = ctx.raw || 0
            return ` ₹${new Intl.NumberFormat('en-IN').format(Math.round(v))}`
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 900,
      easing: 'easeInOutQuart'
    }
  }), [])

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* subtle 3D feel with drop shadow */}
      <div className="absolute inset-0 translate-y-2 blur-[6px] bg-linear-to-b from-slate-300/30 to-transparent rounded-full" aria-hidden />
      <div className="relative h-full w-full">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  )
}
