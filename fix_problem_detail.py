import codecs
import re

with codecs.open("src/views/student/ProblemDetailStudent.jsx", "r", "utf-8") as f:
    content = f.read()

# 1. File attachment box
content = re.sub(
    r"(<div style=\{\{\s*display:\s*'flex',\s*alignItems:\s*'center',\s*gap:\s*'0\.75rem',\s*padding:\s*'0\.75rem',\s*background:\s*'#F8FAFC')",
    r'<div className="attachment-box-student" style={{ display: \'flex\', alignItems: \'center\', gap: \'0.75rem\', padding: \'0.75rem\', background: \'#F8FAFC\'',
    content
)

# 2. Pitching Locked Alert Box
content = re.sub(
    r"(<div\s+style=\{\{[^}]*background:\s*'#FFFBEB'[^}]*color:\s*'#92400E'[^}]*\}\})",
    r'<div className="alert-warning-student" style={{ padding: \'0.85rem 1rem\', borderRadius: \'12px\', background: \'#FFFBEB\', border: \'1px solid #FDE68A\', color: \'#92400E\', fontSize: \'0.8rem\', lineHeight: 1.5, display: \'flex\', flexDirection: \'column\', gap: \'6px\' }}',
    content
)

# 3. Nominated Alert Box
content = re.sub(
    r"(<div\s+style=\{\{[^}]*background:\s*'#EFF6FF'[^}]*color:\s*'#1E40AF'[^}]*\}\})",
    r'<div className="alert-info-student" style={{ padding: \'1rem\', borderRadius: \'12px\', background: \'#EFF6FF\', border: \'1px solid #BFDBFE\', color: \'#1E40AF\', fontSize: \'0.8rem\', fontWeight: 600, display: \'flex\', alignItems: \'center\', gap: \'8px\' }}',
    content
)

with codecs.open("src/views/student/ProblemDetailStudent.jsx", "w", "utf-8") as f:
    f.write(content)
