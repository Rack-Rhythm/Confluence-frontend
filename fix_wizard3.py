import codecs

with codecs.open("src/views/student/SubmitPitchWizard.jsx", "r", "utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "className: 'wizard-stepper-header'," in line:
        lines[i] = ""
    if "className: 'target-problem-box'," in line:
        lines[i] = ""
    if "        style={{" in line and "display: 'flex'," in lines[i+1] and "justifyContent: 'space-between'," in lines[i+2]:
        lines[i-1] = "      <div className=\"wizard-stepper-header\"\n"
    if "                style={{" in line and "background: '#F8FAFC'," in lines[i+1] and "padding: '1.25rem 1.5rem'," in lines[i+2]:
        lines[i-1] = "              <div className=\"target-problem-box\"\n"

with codecs.open("src/views/student/SubmitPitchWizard.jsx", "w", "utf-8") as f:
    f.writelines(lines)
