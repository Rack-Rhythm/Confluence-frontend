css = '''
/* FIXES FOR GUILD THEME */
body.theme-student-guild .dashboard-sidebar button[style*="background: #EFF6FF"],
body.theme-student-guild .dashboard-sidebar button[style*="background: rgb(239, 246, 255)"],
body.theme-student-guild .dashboard-sidebar button[style*="background: #EFF6FF;"] {
  background: rgba(230, 195, 113, 0.2) !important;
  border-left: 4px solid #E6C371 !important;
}
body.theme-student-guild .dashboard-sidebar h2, body.theme-student-guild .dashboard-sidebar h2 span {
  color: #E6C371 !important;
  font-family: 'Playfair Display', serif !important;
}
body.theme-student-guild .top-header .search-container,
body.theme-student-guild .top-header > div:first-child {
  opacity: 0;
  pointer-events: none;
}
body.theme-student-guild .desktop-profile-pill div {
  color: #DFD3B6 !important;
}
body.theme-student-guild .top-header > button {
  background: rgba(230, 195, 113, 0.1) !important;
  border: 1px solid rgba(230, 195, 113, 0.3) !important;
}
body.theme-student-guild {
  background-color: #0A0F0A !important;
  background-image: none !important;
}
body.theme-student-guild::before {
  content: "";
  position: fixed;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background: url('/dashboard-global-bg.png') no-repeat center center;
  background-size: cover;
  filter: brightness(0.6) sepia(0.35) contrast(1.15) blur(3px);
  z-index: -1;
}
body.theme-student-guild .desktop-profile-pill > div:first-child {
  background: rgba(230, 195, 113, 0.2) !important;
  color: #E6C371 !important;
  border: 1px solid #E6C371 !important;
}
'''
with open('src/index.css', 'a') as f:
    f.write(css)
