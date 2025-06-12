"use client"

import { useEffect, useState } from "react"
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js"
import { Radar } from "react-chartjs-2"
import { RefreshCw, Info } from "lucide-react"

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const BehavioralSpiderGraph = ({ behavioralData, onRefresh, isLoading }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  })
  const [showConfidence, setShowConfidence] = useState(false)

  useEffect(() => {
    if (behavioralData && behavioralData.length > 0) {
      formatChartData(behavioralData)
    }
  }, [behavioralData, showConfidence])

  const formatChartData = (data) => {
    const labels = data.map((item) =>
      item.skillName
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    )

    const scores = data.map((item) => (item.score || 0)*100)
    const confidenceValues = data.map((item) => (item.confidence || 0) * 100)

    const datasets = [
      {
        label: "Skill Score",
        data: scores,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(75, 192, 192, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(75, 192, 192, 1)",
        pointRadius: 4,
      },
    ]

    // Add confidence overlay if enabled
    if (showConfidence) {
      datasets.push({
        label: "Confidence Level",
        data: confidenceValues,
        backgroundColor: "rgba(255, 99, 132, 0.1)",
        borderColor: "rgba(255, 99, 132, 0.6)",
        borderWidth: 1,
        borderDash: [5, 5],
        pointBackgroundColor: "rgba(255, 99, 132, 0.8)",
        pointBorderColor: "#fff",
        pointRadius: 3,
      })
    }

    setChartData({
      labels,
      datasets,
    })
  }

  const options = {
    scales: {
      r: {
        angleLines: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          backdropColor: "transparent",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        pointLabels: {
          font: {
            size: 12,
            weight: "bold",
          },
          color: "#666",
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const datasetLabel = context.dataset.label
            const value = context.raw
            const dataIndex = context.dataIndex

            if (datasetLabel === "Skill Score") {
              const skill = behavioralData[dataIndex]
              const confidence = skill?.confidence ? `${Math.round(skill.confidence * 100)}%` : "N/A"
              return [`${datasetLabel}: ${value}%`, `Confidence: ${confidence}`]
            } else {
              return `${datasetLabel}: ${value}%`
            }
          },
        },
      },
    },
    maintainAspectRatio: false,
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowConfidence(!showConfidence)}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              showConfidence
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-gray-100 text-gray-700 border border-gray-300"
            }`}
          >
            {showConfidence ? "Hide Confidence" : "Show Confidence"}
          </button>
          <button
            onClick={() => window.location.replace("/improve")}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 bg-gray-100 text-gray-700 border border-gray-300
            }`}
          >
           Improve 
          </button>
        </div>
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading assessment data...</span>
            </div>
          </div>
        )}

        <div className="w-full h-[300px] bg-white rounded-lg p-4">
          {behavioralData && behavioralData.length > 0 ? (
            <Radar data={chartData} options={options} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No behavioral data available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BehavioralSpiderGraph
