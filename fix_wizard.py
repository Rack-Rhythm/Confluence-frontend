import codecs

with codecs.open("src/views/student/SubmitPitchWizard.jsx", "r", "utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "background: '#FFFFFF'," in line and "display: 'flex'," in lines[i-2] and "justifyContent: 'space-between'," in lines[i-1]:
        lines[i] = "          className: 'wizard-stepper-header',\n          background: '#FFFFFF',\n"
    if "background: '#F8FAFC'," in line and "padding: '1.25rem 1.5rem'," in lines[i+1]:
        lines[i] = "                  className: 'target-problem-box',\n                  background: '#F8FAFC',\n"
        
with codecs.open("src/views/student/SubmitPitchWizard.jsx", "w", "utf-8") as f:
    f.writelines(lines)
