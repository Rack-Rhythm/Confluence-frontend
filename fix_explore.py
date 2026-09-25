import codecs
import re

with codecs.open("src/views/student/ExploreProblems.jsx", "r", "utf-8") as f:
    content = f.read()

content = content.replace(
    "<div\n          style={{\n            background: '#FFFFFF',",
    "<div\n          className=\"explore-filter-bar-mobile\"\n          style={{\n            background: '#FFFFFF',"
)

with codecs.open("src/views/student/ExploreProblems.jsx", "w", "utf-8") as f:
    f.write(content)
