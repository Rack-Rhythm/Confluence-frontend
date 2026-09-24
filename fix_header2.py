import codecs

with codecs.open("src/views/student/SubmitPitchWizard.jsx", "r", "utf-8") as f:
    content = f.read()

content = content.replace(
    "<div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>",
    "<div className=\"submit-pitch-page-header\" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>"
)

with codecs.open("src/views/student/SubmitPitchWizard.jsx", "w", "utf-8") as f:
    f.write(content)
