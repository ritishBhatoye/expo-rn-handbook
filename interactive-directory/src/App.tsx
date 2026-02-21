import { useState, useMemo } from 'react'
import { Search, ChevronDown, ChevronUp, Terminal, Code, Layers, Palette, Compass, Zap, Activity, Ship, HelpCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { data, Entry } from './data'

const categories = [
  { name: 'Fundamentals', icon: Layers },
  { name: 'Styling', icon: Palette },
  { name: 'Navigation', icon: Compass },
  { name: 'State & Data', icon: Zap },
  { name: 'Animations', icon: Activity },
  { name: 'Performance', icon: Ship },
  { name: 'Deployment', icon: Ship },
  { name: 'Interview Q&A', icon: HelpCircle },
]

function App() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.definition.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !activeCategory || item.category === activeCategory
      const matchesTag = !activeTag || item.tags.includes(activeTag)
      return matchesSearch && matchesCategory && matchesTag
    })
  }, [search, activeCategory, activeTag])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    data.forEach(item => item.tags.forEach(tag => tags.add(tag)))
    return Array.from(tags)
  }, [])

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] p-4 md:p-8 font-mono">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Terminal size={32} className="text-green-500" />
          <h1 className="text-2xl md:text-4xl font-bold tracking-tighter">REACT-NATIVE-DAILY_DIRECTORY_V1.0</h1>
        </div>
        <p className="text-gray-500 mb-8 border-l-2 border-green-500 pl-4">
          World-class React Native architect, Expo expert, and technical educator resource.
        </p>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="SEARCH_DEFINITIONS..."
              className="w-full bg-[#161b22] border border-[#30363d] rounded-md py-3 pl-10 pr-4 focus:outline-none focus:border-green-500 transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-all whitespace-nowrap ${activeCategory === cat.name
                    ? 'bg-green-500/10 border-green-500 text-green-500'
                    : 'bg-[#161b22] border-[#30363d] hover:border-gray-500'
                  }`}
              >
                <cat.icon size={16} />
                {cat.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {activeTag && (
            <button
              onClick={() => setActiveTag(null)}
              className="bg-red-500/10 text-red-500 border border-red-500 px-2 py-0.5 rounded text-xs flex items-center gap-1"
            >
              CLEAR TAG <X size={12} />
            </button>
          )}
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-xs px-2 py-0.5 rounded border transition-colors ${activeTag === tag
                  ? 'bg-blue-500/10 border-blue-500 text-blue-500'
                  : 'bg-[#161b22] border-[#30363d] text-gray-500 hover:text-gray-300'
                }`}
            >
              {tag.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredData.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={item.id}
              className={`bg-[#161b22] border rounded-lg overflow-hidden transition-all ${expandedId === item.id ? 'border-green-500 ring-1 ring-green-500/20 col-span-full md:col-span-full lg:col-span-full' : 'border-[#30363d] hover:border-gray-600'
                }`}
            >
              <div
                className="p-5 cursor-pointer flex justify-between items-start gap-4"
                onClick={() => toggleExpand(item.id)}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-widest">{item.category}</span>
                    <div className="flex gap-1">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-[10px] text-blue-400">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors uppercase">{item.title}</h3>
                </div>
                {expandedId === item.id ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
              </div>

              <AnimatePresence>
                {expandedId === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-[#30363d]"
                  >
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <div className="mb-6">
                          <h4 className="text-xs text-green-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> DEFINITION
                          </h4>
                          <p className="text-lg leading-relaxed">{item.definition}</p>
                        </div>
                        <div>
                          <h4 className="text-xs text-green-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> WHEN_TO_USE
                          </h4>
                          <p className="text-gray-400">{item.whenToUse}</p>
                        </div>
                      </div>

                      {item.code && (
                        <div>
                          <h4 className="text-xs text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Code size={14} /> IMPLEMENTATION_SNIPPET
                          </h4>
                          <pre className="bg-[#0d1117] p-4 rounded-md border border-[#30363d] overflow-x-auto">
                            <code className="text-sm text-blue-300">{item.code}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-20 pt-8 border-t border-[#30363d] text-center text-gray-600 text-sm">
        <p>© 2026 REACT-NATIVE-DAILY // COMPREHENSIVE_DIRECTORY // BUILD_001</p>
      </footer>
    </div>
  )
}

export default App
