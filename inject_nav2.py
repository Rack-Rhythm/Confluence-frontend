import codecs

with codecs.open("src/App.jsx", "r", "utf-8") as f:
    content = f.read()

content = content.replace(
    "        </div>\n      )}\n    </div>\n  );\n}\n\nexport default function App()",
    "        </div>\n      )}\n      <MobileBottomNav />\n    </div>\n  );\n}\n\nexport default function App()"
)

with codecs.open("src/App.jsx", "w", "utf-8") as f:
    f.write(content)
