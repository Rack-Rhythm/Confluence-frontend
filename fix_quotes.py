import codecs

with codecs.open("src/views/student/ProblemDetailStudent.jsx", "r", "utf-8") as f:
    content = f.read()

content = content.replace(r"\'", "'")

with codecs.open("src/views/student/ProblemDetailStudent.jsx", "w", "utf-8") as f:
    f.write(content)
