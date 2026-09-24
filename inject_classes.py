import codecs
import re

with codecs.open("src/views/student/SubmitPitchWizard.jsx", "r", "utf-8") as f:
    content = f.read()

# 1. Wizard Header wrapper
# It has: display: 'flex', justifyContent: 'space-between', background: '#FFFFFF', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '1.5rem',
content = content.replace(
    "          display: 'flex',\n          justifyContent: 'space-between',\n          background: '#FFFFFF',",
    "          display: 'flex',\n          justifyContent: 'space-between',\n          className: 'wizard-stepper-header',\n          background: '#FFFFFF',"
)
# Wait, it's inside style={{...}}. I should add className outside the style block.
content = re.sub(
    r"(<div\s+)(style={{[^}]*?background:\s*'#FFFFFF'[^}]*?justifyContent:\s*'space-between'[^}]*?}})",
    r'\1className="wizard-stepper-header" \2',
    content
)

# 2. Target Problem Box
content = re.sub(
    r"(<div\s+)(style={{[^}]*?background:\s*'#F8FAFC'[^}]*?}}[^>]*?>\s*<div[^>]*?>\s*TARGET PROBLEM)",
    r'\1className="target-problem-box" \2',
    content
)

# 3. Wizard Step Active Circle
# background: s.num === step ? '#2563EB' : s.num < step ? '#10B981' : '#F1F5F9',
content = re.sub(
    r"(<div\s+)(style={{[^}]*?borderRadius:\s*'50%'[^}]*?background:\s*s\.num\s*===\s*step)",
    r'\1className="wizard-step-circle" \2',
    content
)

# 4. Back button circle
content = re.sub(
    r"(<button\s+onClick=\{\(\) => navigate\(-1\)\}\s+)(style=\{\{\s*width:\s*'36px',\s*height:\s*'36px',\s*borderRadius:\s*'50%')",
    r'\1className="btn-back-circle" \2',
    content
)

with codecs.open("src/views/student/SubmitPitchWizard.jsx", "w", "utf-8") as f:
    f.write(content)
