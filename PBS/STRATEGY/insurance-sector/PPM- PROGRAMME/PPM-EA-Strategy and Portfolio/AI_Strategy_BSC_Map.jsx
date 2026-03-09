import React from 'react';

const BSCStrategyMap = () => {
  const objectives = {
    financial: [
      { id: 'F1', name: 'Increase Revenue Growth', metrics: ['+15% conversion', '95% renewal', '+10% revenue/client'], color: '#2E7D32' },
      { id: 'F2', name: 'Improve Operating Margin', metrics: ['-25% cost/trans', '60% automation', '-40% rework'], color: '#2E7D32' }
    ],
    customer: [
      { id: 'C1', name: 'Improve Client Retention', metrics: ['90% early warning', '100% prep', '80% green'], color: '#1565C0' },
      { id: 'C2', name: 'Enhance Client Experience', metrics: ['5+ AI agents', '85% FCR', '<4hr response'], color: '#1565C0' }
    ],
    process: [
      { id: 'P1', name: 'Automate Processes', metrics: ['15+ processes', '70% STP', '-50% touchpoints'], color: '#EF6C00' },
      { id: 'P2', name: 'Optimise Sales Pipeline', metrics: ['+25% conversion', '+30% velocity', '+15% wins'], color: '#EF6C00' },
      { id: 'P3', name: 'Streamline Compliance', metrics: ['90% automated', '-70% audit prep', '-40% findings'], color: '#EF6C00' }
    ],
    learning: [
      { id: 'L1', name: 'AI-Ready Workforce', metrics: ['100% trained', '80% proficient', '90% active'], color: '#7B1FA2' },
      { id: 'L2', name: 'Data Foundation', metrics: ['100% clients', '95% quality', 'Full governance'], color: '#C62828', critical: true },
      { id: 'L3', name: 'AI Platform', metrics: ['20+ models', '99.5% uptime', '99% API'], color: '#7B1FA2' }
    ]
  };

  const ObjectiveCard = ({ obj }) => (
    <div className={`bg-white rounded-lg shadow-md p-3 border-l-4 ${obj.critical ? 'border-red-600' : ''}`} 
         style={{ borderLeftColor: obj.color, minWidth: '180px' }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-white text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: obj.color }}>
          {obj.id}
        </span>
        {obj.critical && <span className="text-red-600 text-xs font-bold">CRITICAL</span>}
      </div>
      <h4 className="text-sm font-semibold text-gray-800 mb-2">{obj.name}</h4>
      <div className="space-y-1">
        {obj.metrics.map((m, i) => (
          <div key={i} className="text-xs text-gray-600 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: obj.color }}></span>
            {m}
          </div>
        ))}
      </div>
    </div>
  );

  const Perspective = ({ title, question, bgColor, borderColor, children }) => (
    <div className={`rounded-lg p-4 mb-4`} style={{ backgroundColor: bgColor, borderLeft: `4px solid ${borderColor}` }}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <span className="text-xs text-gray-600 italic">{question}</span>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        {children}
      </div>
    </div>
  );

  const CauseEffectArrow = ({ from, to, label }) => (
    <div className="flex items-center justify-center text-gray-500 text-xs py-1">
      <span className="font-medium">{from}</span>
      <span className="mx-2">→</span>
      <span className="text-gray-400">{label}</span>
      <span className="mx-2">→</span>
      <span className="font-medium">{to}</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-blue-900">AI Strategy Programme</h1>
        <h2 className="text-lg text-blue-700">Balanced Scorecard Strategy Map</h2>
        <p className="text-sm text-gray-500 mt-1">EA-PPM-AIS-2026-001 | Phase 2: Feb-May 2026 | Horizon: 24 months</p>
      </div>

      {/* Vision */}
      <div className="bg-blue-900 text-white rounded-lg p-4 mb-6 text-center">
        <h3 className="font-bold mb-2">STRATEGIC VISION</h3>
        <p className="text-sm">To become a leading AI-augmented professional services organisation delivering superior mission outcomes through intelligent automation, data-driven decision making, and knowledge-enabled advisory services.</p>
      </div>

      {/* Financial Perspective */}
      <Perspective title="FINANCIAL PERSPECTIVE" question="How do we create enterprise value?" bgColor="#C8E6C9" borderColor="#2E7D32">
        {objectives.financial.map(obj => <ObjectiveCard key={obj.id} obj={obj} />)}
      </Perspective>

      {/* Cause-Effect Arrows */}
      <div className="bg-white rounded p-2 mb-2 text-center">
        <CauseEffectArrow from="C1, C2" to="F1" label="increases revenue" />
        <CauseEffectArrow from="P1, P3" to="F2" label="reduces costs" />
      </div>

      {/* Customer Perspective */}
      <Perspective title="CUSTOMER PERSPECTIVE" question="How do clients see us?" bgColor="#BBDEFB" borderColor="#1565C0">
        {objectives.customer.map(obj => <ObjectiveCard key={obj.id} obj={obj} />)}
      </Perspective>

      {/* Cause-Effect Arrows */}
      <div className="bg-white rounded p-2 mb-2 text-center">
        <CauseEffectArrow from="P1" to="C2" label="improves experience" />
        <CauseEffectArrow from="P2, P3" to="C1" label="protects retention" />
      </div>

      {/* Process Perspective */}
      <Perspective title="INTERNAL PROCESS PERSPECTIVE" question="What must we excel at?" bgColor="#FFE0B2" borderColor="#EF6C00">
        {objectives.process.map(obj => <ObjectiveCard key={obj.id} obj={obj} />)}
      </Perspective>

      {/* Cause-Effect Arrows */}
      <div className="bg-white rounded p-2 mb-2 text-center">
        <CauseEffectArrow from="L1" to="P1, C2" label="enables automation" />
        <CauseEffectArrow from="L2" to="P1, P2, P3, C1" label="enables all AI" />
        <CauseEffectArrow from="L3" to="P1, P2, C2" label="enables platform" />
      </div>

      {/* Learning & Growth Perspective */}
      <Perspective title="LEARNING & GROWTH PERSPECTIVE" question="How do we build capability?" bgColor="#E1BEE7" borderColor="#7B1FA2">
        {objectives.learning.map(obj => <ObjectiveCard key={obj.id} obj={obj} />)}
      </Perspective>

      {/* Legend */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow">
        <h4 className="font-bold text-gray-700 mb-3">Cause-Effect Chain Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold text-purple-700">L2 (Data Foundation)</span>
            <span className="text-gray-600"> → Enables 80% of all AI initiatives</span>
          </div>
          <div>
            <span className="font-semibold text-purple-700">L1 (AI Workforce)</span>
            <span className="text-gray-600"> → Drives adoption and experience</span>
          </div>
          <div>
            <span className="font-semibold text-orange-600">P1 (Automation)</span>
            <span className="text-gray-600"> → Reduces costs, improves experience</span>
          </div>
          <div>
            <span className="font-semibold text-orange-600">P2 (Sales Pipeline)</span>
            <span className="text-gray-600"> → Directly drives revenue growth</span>
          </div>
          <div>
            <span className="font-semibold text-blue-600">C1 (Retention)</span>
            <span className="text-gray-600"> → Protects and grows revenue base</span>
          </div>
          <div>
            <span className="font-semibold text-blue-600">C2 (Experience)</span>
            <span className="text-gray-600"> → Differentiates and retains clients</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center text-xs text-gray-400">
        Enterprise Architecture PPM Portfolio Review | Document: EA-PPM-AIS-2026-001 v3.0
      </div>
    </div>
  );
};

export default BSCStrategyMap;
