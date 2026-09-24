import codecs

with codecs.open("src/components/common/MobileBottomNav.jsx", "r", "utf-8") as f:
    content = f.read()

content = content.replace(
    "className={`mobile-bottom-nav ${isStudent ? 'student-theme' : '}`}>",
    "className={`mobile-bottom-nav ${isStudent ? 'student-theme' : ''}`}>"
)
# Also fix the nav-item class if it was broken
content = content.replace(
    "className={nav-item }",
    "className={`nav-item ${isActive ? 'active' : ''}`}"
)

with codecs.open("src/components/common/MobileBottomNav.jsx", "w", "utf-8") as f:
    f.write(content)
