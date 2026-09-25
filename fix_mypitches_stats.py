import codecs
import re

with codecs.open("src/views/student/MyPitches.jsx", "r", "utf-8") as f:
    content = f.read()

# 1. Add class to the wrapper
content = content.replace(
    "<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>",
    "<div className=\"pitches-stats-grid\" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>"
)

# 2. Add class to the stat card div
# The div looks like: <div\n              key={tab.id}\n              onClick={() => setActiveTab(tab.id)}\n              style={{...
content = re.sub(
    r"(<div\s+key=\{tab\.id\}\s+onClick=\{[^}]+\}\s+)style=\{\{",
    r'\1className={`pitch-stat-card ${isActive ? "active" : ""}`} style={{',
    content
)

with codecs.open("src/views/student/MyPitches.jsx", "w", "utf-8") as f:
    f.write(content)
