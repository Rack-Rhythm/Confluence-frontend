import codecs

with codecs.open("src/views/student/MyPitches.jsx", "r", "utf-8") as f:
    content = f.read()

content = content.replace(
    "<div\n          style={{\n            textAlign: 'center',\n            padding: '3.5rem 1rem',\n            background: '#FFFFFF',\n            borderRadius: '16px',\n            border: '1px solid #E2E8F0',\n            color: '#64748B',\n          }}\n        >",
    "<div\n          className=\"card\"\n          style={{\n            textAlign: 'center',\n            padding: '3.5rem 1rem',\n            color: '#64748B',\n          }}\n        >"
)

with codecs.open("src/views/student/MyPitches.jsx", "w", "utf-8") as f:
    f.write(content)
