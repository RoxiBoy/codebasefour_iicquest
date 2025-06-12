"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"

const SkillRadarChart = ({ skills }) => {
  const data = skills.map((skill) => ({
    skill: skill.skillName,
    level: skill.level,
    fullMark: 100,
  }))

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Radar name="Skill Level" dataKey="level" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SkillRadarChart
