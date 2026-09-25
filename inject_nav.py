import codecs

with codecs.open("src/App.jsx", "r", "utf-8") as f:
    content = f.read()

# Add import
import_stmt = "import { MobileBottomNav } from './components/common/MobileBottomNav';\n"
if "MobileBottomNav" not in content:
    content = content.replace("import { Sidebar, getViewPath } from './components/common/Sidebar';", 
                              "import { Sidebar, getViewPath } from './components/common/Sidebar';\n" + import_stmt)

# Add component right before the closing </div> of the main return block
# The main return block ends with:
#       </AuthContext.Provider>
#     </Router>
#   );
# }

if "<MobileBottomNav />" not in content:
    content = content.replace("</AuthContext.Provider>", "  <MobileBottomNav />\n      </AuthContext.Provider>")

with codecs.open("src/App.jsx", "w", "utf-8") as f:
    f.write(content)
