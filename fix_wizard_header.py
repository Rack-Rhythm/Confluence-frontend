import codecs

with codecs.open("src/views/student/SubmitPitchWizard.jsx", "r", "utf-8") as f:
    content = f.read()

content = content.replace(
    "<div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>",
    "<div className=\"submit-pitch-page-header\" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>"
)

with codecs.open("src/views/student/SubmitPitchWizard.jsx", "w", "utf-8") as f:
    f.write(content)
