import codecs

with codecs.open("src/views/student/SubmitPitchWizard.jsx", "r", "utf-8") as f:
    content = f.read()

# Fix the className inside style
content = content.replace(
    "<div\n        style={{\n          display: 'flex',\n          justifyContent: 'space-between',\n          className: 'wizard-stepper-header',\n          background: '#FFFFFF',",
    "<div\n        className=\"wizard-stepper-header\"\n        style={{\n          display: 'flex',\n          justifyContent: 'space-between',\n          background: '#FFFFFF',"
)

content = content.replace(
    "<div\n                style={{\n                  className: 'target-problem-box',\n                  background: '#F8FAFC',",
    "<div\n                className=\"target-problem-box\"\n                style={{\n                  background: '#F8FAFC',"
)

with codecs.open("src/views/student/SubmitPitchWizard.jsx", "w", "utf-8") as f:
    f.write(content)
