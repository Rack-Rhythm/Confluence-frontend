import codecs

with codecs.open("src/components/common/MobileBottomNav.jsx", "r", "utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "className={" in line and "av-item" in lines[i+1]:
        lines[i] = "            className={`nav-item ${isActive ? 'active' : ''}`}\n"
        lines[i+1] = ""

with codecs.open("src/components/common/MobileBottomNav.jsx", "w", "utf-8") as f:
    f.writelines(lines)
