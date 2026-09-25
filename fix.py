import codecs

with codecs.open("src/views/student/OpportunitiesView.jsx", "r", "utf-8") as f:
    content = f.read()

content = content.replace("className=\"opp-grid-masonry\"", "className=\"opp-horizontal-gallery\"")
content = content.replace("let spanClass = 'opp-item-standard';", "let spanClass = 'opp-item-horizontal-standard';")
content = content.replace("const cycle = index % 7;", "")
content = content.replace("if (cycle === 1) spanClass = 'opp-item-tall';", "if (index % 5 === 0) spanClass = 'opp-item-horizontal-wide';")
content = content.replace("else if (cycle === 2 || cycle === 6) spanClass = 'opp-item-wide';", "")
content = content.replace("cycle === 1 ? 4 : 2", "2")

with codecs.open("src/views/student/OpportunitiesView.jsx", "w", "utf-8") as f:
    f.write(content)
