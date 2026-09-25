import codecs
import re

with codecs.open("src/App.jsx", "r", "utf-8") as f:
    content = f.read()

if "MobileBottomNav" not in content:
    content = content.replace(
        "import { Sidebar, getViewPath } from './components/common/Sidebar';",
        "import { Sidebar, getViewPath } from './components/common/Sidebar';\nimport { MobileBottomNav } from './components/common/MobileBottomNav';"
    )
    content = content.replace(
        "        </div>\n      )}\n    </div>\n  );\n}\n\nexport default function App()",
        "        </div>\n      )}\n      <MobileBottomNav />\n    </div>\n  );\n}\n\nexport default function App()"
    )
    with codecs.open("src/App.jsx", "w", "utf-8") as f:
        f.write(content)
