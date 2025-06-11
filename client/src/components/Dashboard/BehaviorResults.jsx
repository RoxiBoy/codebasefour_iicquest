const behaviorDescriptions = {
  cognitive_style: {
    analytical: "You approach problems systematically, breaking them down into logical components.",
    holistic: "You see the big picture and understand how different elements connect and interact.",
  },
  learning_mode: {
    active: "You learn best through hands-on experience and practical application.",
    reflective: "You prefer to observe, think, and analyze before taking action.",
  },
  communication: {
    direct: "You communicate clearly and straightforwardly, valuing efficiency and clarity.",
    nuanced: "You communicate with subtlety and consideration for context and relationships.",
  },
  motivation: {
    intrinsic: "You're driven by internal satisfaction, personal growth, and meaningful work.",
    extrinsic: "You're motivated by external rewards, recognition, and tangible achievements.",
  },
  dominant_trait: {
    leader: "You naturally take charge and guide others toward common goals.",
    collaborator: "You excel at working with others and building consensus.",
    independent: "You work best autonomously and take ownership of your responsibilities.",
  },
}

export default function BehaviorResults({ behaviorVector }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Cognitive Style</h4>
          <p className="text-lg font-bold text-blue-700 capitalize mb-2">{behaviorVector.cognitive_style}</p>
          <p className="text-sm text-blue-800">
            {behaviorDescriptions.cognitive_style[behaviorVector.cognitive_style]}
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-900 mb-2">Learning Mode</h4>
          <p className="text-lg font-bold text-green-700 capitalize mb-2">{behaviorVector.learning_mode}</p>
          <p className="text-sm text-green-800">{behaviorDescriptions.learning_mode[behaviorVector.learning_mode]}</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-2">Communication Style</h4>
          <p className="text-lg font-bold text-purple-700 capitalize mb-2">{behaviorVector.communication}</p>
          <p className="text-sm text-purple-800">{behaviorDescriptions.communication[behaviorVector.communication]}</p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h4 className="font-semibold text-orange-900 mb-2">Motivation Type</h4>
          <p className="text-lg font-bold text-orange-700 capitalize mb-2">{behaviorVector.motivation}</p>
          <p className="text-sm text-orange-800">{behaviorDescriptions.motivation[behaviorVector.motivation]}</p>
        </div>
      </div>

      <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
        <h4 className="font-semibold text-indigo-900 mb-2">Dominant Trait</h4>
        <p className="text-2xl font-bold text-indigo-700 capitalize mb-3">{behaviorVector.dominant_trait}</p>
        <p className="text-indigo-800">{behaviorDescriptions.dominant_trait[behaviorVector.dominant_trait]}</p>
      </div>
    </div>
  )
}
