import React, { useEffect, useRef } from 'react';
import { mountScrollWorld } from '../../engine/scrub-engine';

// Helper to generate rich 3D isometric SVG diorama scene visuals matching each step
function createDioramaSVG({ title, subtitle, themeColor, secondaryColor, type }) {
  let innerGraphic = '';

  if (type === 'report') {
    // 1. Report: Citizen Community Reporting Diorama
    innerGraphic = `
      <g transform="translate(960, 500)">
        <!-- Isometric Ground Base -->
        <polygon points="0,-180 380,0 0,180 -380,0" fill="#1E293B" stroke="${themeColor}" stroke-width="3" opacity="0.95" />
        <polygon points="0,180 380,0 380,45 0,225" fill="#0F172A" />
        <polygon points="0,180 -380,0 -380,45 0,225" fill="#090D16" />
        
        <!-- Grid pathways & Roads -->
        <path d="M-200,-95 L200,95 M-200,95 L200,-95" stroke="${themeColor}" stroke-width="4" stroke-dasharray="8,6" opacity="0.65" />
        <ellipse cx="0" cy="0" rx="160" ry="75" fill="none" stroke="${themeColor}" stroke-width="2" stroke-dasharray="10,6" opacity="0.5"/>
        
        <!-- Community Homes / Civic Buildings -->
        <g transform="translate(-120, -30)">
          <polygon points="0,-65 55,-35 0,-5 -55,-35" fill="${themeColor}" opacity="0.9"/>
          <polygon points="0,-5 55,-35 55,25 0,55" fill="#1D4ED8"/>
          <polygon points="0,-5 -55,-35 -55,25 0,55" fill="#1E40AF"/>
        </g>
        <g transform="translate(110, -20)">
          <polygon points="0,-85 60,-50 0,-15 -60,-50" fill="${secondaryColor}" opacity="0.9"/>
          <polygon points="0,-15 60,-50 60,30 0,65" fill="#059669"/>
          <polygon points="0,-15 -60,-50 -60,30 0,65" fill="#047857"/>
        </g>
        <g transform="translate(0, 45)">
          <polygon points="0,-55 45,-30 0,-5 -45,-30" fill="#F59E0B" opacity="0.9"/>
          <polygon points="0,-5 45,-30 45,20 0,45" fill="#D97706"/>
          <polygon points="0,-5 -45,-30 -45,20 0,45" fill="#B45309"/>
        </g>

        <!-- Floating Civic Issue Marker / Geotag Beacon -->
        <g transform="translate(0, -115)">
          <!-- Pulse rings -->
          <circle cx="0" cy="0" r="38" fill="${themeColor}" opacity="0.25"/>
          <circle cx="0" cy="0" r="24" fill="${themeColor}" opacity="0.45"/>
          <circle cx="0" cy="0" r="14" fill="${themeColor}"/>
          <circle cx="0" cy="0" r="6" fill="#FFFFFF"/>
          
          <!-- Marker pin stalk -->
          <path d="M0,14 L0,48" stroke="${themeColor}" stroke-width="4" stroke-linecap="round"/>
          <circle cx="0" cy="48" r="4" fill="${themeColor}"/>
          
          <!-- Broadcast signals -->
          <path d="M-36,-24 Q0,-60 36,-24" fill="none" stroke="${themeColor}" stroke-width="3" opacity="0.8"/>
          <path d="M-54,-38 Q0,-85 54,-38" fill="none" stroke="${themeColor}" stroke-width="2" opacity="0.5"/>
        </g>
      </g>
    `;
  } else if (type === 'validate') {
    // 2. Validate: University Review & Academic Scope Diorama
    innerGraphic = `
      <g transform="translate(960, 500)">
        <polygon points="0,-190 390,0 0,190 -390,0" fill="#0F172A" stroke="${themeColor}" stroke-width="3" opacity="0.95" />
        <polygon points="0,190 390,0 390,45 0,235" fill="#020617" />
        <polygon points="0,190 -390,0 -390,45 0,235" fill="#020617" />

        <!-- Academic Campus & Pillars -->
        <g transform="translate(0, -35)">
          <polygon points="0,-110 90,-60 0,-10 -90,-60" fill="${themeColor}" opacity="0.9"/>
          <polygon points="0,-10 90,-60 90,40 0,90" fill="#059669"/>
          <polygon points="0,-10 -90,-60 -90,40 0,90" fill="#047857"/>
        </g>
        
        <!-- Validation Shield & Holographic Verification Rings -->
        <g transform="translate(0, -125)">
          <ellipse cx="0" cy="0" rx="95" ry="38" fill="none" stroke="${secondaryColor}" stroke-width="3" stroke-dasharray="10,6" opacity="0.8"/>
          <ellipse cx="0" cy="-25" rx="65" ry="25" fill="none" stroke="${themeColor}" stroke-width="2" opacity="0.6"/>
          
          <!-- Shield Badge -->
          <polygon points="0,-35 24,-20 24,15 0,35 -24,15 -24,-20" fill="${themeColor}" opacity="0.95"/>
          <path d="M-8,0 L-2,6 L10,-6" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        </g>

        <!-- Department Pods -->
        <g transform="translate(-140, 20)">
          <polygon points="0,-45 40,-25 0,-5 -40,-25" fill="#06B6D4"/>
          <polygon points="0,-5 40,-25 40,15 0,35" fill="#0891B2"/>
          <polygon points="0,-5 -40,-25 -40,15 0,35" fill="#0E7490"/>
        </g>
        <g transform="translate(140, 20)">
          <polygon points="0,-45 40,-25 0,-5 -40,-25" fill="#3B82F6"/>
          <polygon points="0,-5 40,-25 40,15 0,35" fill="#2563EB"/>
          <polygon points="0,-5 -40,-25 -40,15 0,35" fill="#1D4ED8"/>
        </g>
      </g>
    `;
  } else if (type === 'innovate') {
    // 3. Innovate: Student Innovation, Pitches & Prototypes Diorama
    innerGraphic = `
      <g transform="translate(960, 500)">
        <polygon points="0,-190 390,0 0,190 -390,0" fill="#1E1B4B" stroke="${themeColor}" stroke-width="3" opacity="0.95" />
        <polygon points="0,190 390,0 390,45 0,235" fill="#0F0D2E" />
        <polygon points="0,190 -390,0 -390,45 0,235" fill="#0A081F" />

        <!-- Innovation Amphitheater / Circuit Stage -->
        <polygon points="0,-75 130,0 0,75 -130,0" fill="#6D28D9" stroke="${themeColor}" stroke-width="2"/>
        
        <!-- Glowing Idea Lightbulb / Prototype Drone in Center -->
        <g transform="translate(0, -95)">
          <circle cx="0" cy="-20" r="35" fill="${themeColor}" opacity="0.3"/>
          <circle cx="0" cy="-20" r="22" fill="#FBBF24"/>
          <!-- Lightbulb filament / Sparkle -->
          <path d="M-8,-20 L8,-20 M0,-28 L0,-12" stroke="#B45309" stroke-width="3" stroke-linecap="round"/>
          <polygon points="-12,4 12,4 6,18 -6,18" fill="#D97706"/>
          
          <!-- Radiating Idea Beams -->
          <path d="M-38,-35 L-48,-45 M38,-35 L48,-45 M0,-52 L0,-66" stroke="#FDE047" stroke-width="3" stroke-linecap="round"/>
        </g>

        <!-- Student Workstations / Circuit Lines -->
        <path d="M-150,-40 L-60,5 L-90,55" stroke="${themeColor}" stroke-width="3.5" fill="none" opacity="0.85"/>
        <path d="M150,-40 L60,5 L90,55" stroke="${secondaryColor}" stroke-width="3.5" fill="none" opacity="0.85"/>
        <circle cx="-150" cy="-40" r="6" fill="${themeColor}"/>
        <circle cx="150" cy="-40" r="6" fill="${secondaryColor}"/>
      </g>
    `;
  } else if (type === 'partner') {
    // 4. Partner: Industry Corporate Mentorship & CSR Scaling Diorama
    innerGraphic = `
      <g transform="translate(960, 500)">
        <polygon points="0,-190 390,0 0,190 -390,0" fill="#451A03" stroke="${themeColor}" stroke-width="3" opacity="0.95" />
        <polygon points="0,190 390,0 390,45 0,235" fill="#1C1917" />
        <polygon points="0,190 -390,0 -390,45 0,235" fill="#0C0A09" />

        <!-- High-Rise Enterprise Towers -->
        <g transform="translate(-70, -35)">
          <polygon points="0,-140 55,-100 0,-60 -55,-100" fill="${themeColor}"/>
          <polygon points="0,-60 55,-100 55,40 0,80" fill="#D97706"/>
          <polygon points="0,-60 -55,-100 -55,40 0,80" fill="#B45309"/>
        </g>
        <g transform="translate(70, -15)">
          <polygon points="0,-165 55,-125 0,-85 -55,-125" fill="${secondaryColor}"/>
          <polygon points="0,-85 55,-125 55,30 0,70" fill="#2563EB"/>
          <polygon points="0,-85 -55,-125 -55,30 0,70" fill="#1D4ED8"/>
        </g>
        
        <!-- Corporate Partnership Briefcase & CSR Fund Orbital Conduits -->
        <g transform="translate(0, -60)">
          <ellipse cx="0" cy="0" rx="150" ry="65" fill="none" stroke="${themeColor}" stroke-width="3" stroke-dasharray="14,10" opacity="0.85"/>
          <circle cx="130" cy="-15" r="14" fill="${themeColor}"/>
          <circle cx="-130" cy="15" r="12" fill="${secondaryColor}"/>
        </g>
      </g>
    `;
  } else {
    // 5. Implement: Grassroots District Deployment & Transforming Bharat
    innerGraphic = `
      <g transform="translate(960, 500)">
        <polygon points="0,-200 410,0 0,200 -410,0" fill="#064E3B" stroke="${themeColor}" stroke-width="3" opacity="0.95" />
        <polygon points="0,200 410,0 410,50 0,250" fill="#022C22" />
        <polygon points="0,200 -410,0 -410,50 0,250" fill="#011F18" />

        <!-- Deployment Milestone Seal & Ashoka Chakra Inspired Centerpiece -->
        <g transform="translate(0, -55)">
          <!-- Glowing Aura -->
          <circle cx="0" cy="-60" r="85" fill="${themeColor}" opacity="0.2"/>
          <circle cx="0" cy="-60" r="70" fill="none" stroke="${themeColor}" stroke-width="3.5" opacity="0.9"/>
          <circle cx="0" cy="-60" r="48" fill="none" stroke="${secondaryColor}" stroke-width="2.5" stroke-dasharray="8,6" opacity="0.8"/>
          <circle cx="0" cy="-60" r="18" fill="${themeColor}"/>

          <!-- 3-Tier Saffron, White, Green Impact Pillars -->
          <g transform="translate(0, 30)">
            <polygon points="-80,0 -40,-25 -80,-50 -120,-25" fill="#FF9933" opacity="0.95"/>
            <polygon points="0,20 40,-5 0,-30 -40,-5" fill="#FFFFFF" opacity="0.95"/>
            <polygon points="80,0 120,-25 80,-50 40,-25" fill="#138808" opacity="0.95"/>
          </g>
        </g>
      </g>
    `;
  }

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stop-color="#141B2D" />
          <stop offset="60%" stop-color="#0B0F19" />
          <stop offset="100%" stop-color="#050810" />
        </radialGradient>
        <radialGradient id="glowSpot" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${themeColor}" stop-opacity="0.28" />
          <stop offset="100%" stop-color="${themeColor}" stop-opacity="0" />
        </radialGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1920" height="1080" fill="url(#bgGrad)"/>
      <ellipse cx="960" cy="520" rx="680" ry="400" fill="url(#glowSpot)"/>
      
      <!-- Diorama Graphic -->
      ${innerGraphic}
      
      <!-- Atmospheric Backdrop Particles -->
      <circle cx="320" cy="210" r="4" fill="${themeColor}" opacity="0.6"/>
      <circle cx="1600" cy="290" r="6" fill="${secondaryColor}" opacity="0.5"/>
      <circle cx="1420" cy="790" r="5" fill="${themeColor}" opacity="0.7"/>
      <circle cx="460" cy="860" r="3" fill="#FFFFFF" opacity="0.4"/>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

export const ScrollWorld = ({ onBack, onOpenAuth, onNavigateTab }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Confluence 5-Step Process matching "How Confluence Works"
    const config = {
      brand: {
        name: 'How Confluence Works',
        href: '#',
        onBack: () => onNavigateTab && onNavigateTab('landing'),
      },
      hint: 'Scroll to explore the 5-step process',
      nav: true,
      atmosphere: true,
      diveScroll: 1.4,
      connScroll: 1.0,
      cta: {
        label: 'Back to Home',
        onClick: () => onNavigateTab && onNavigateTab('landing'),
      },
      sections: [
        {
          id: 'report',
          label: '1. Report',
          still: createDioramaSVG({
            title: '1. Report',
            subtitle: 'Citizen reports a real problem',
            themeColor: '#2563EB',
            secondaryColor: '#10B981',
            type: 'report',
          }),
          accent: '#2563EB',
          scroll: 1.5,
          linger: 0.45,
          eyebrow: 'Step 01 • Citizen Reporting',
          title: '1. Report',
          body: 'Citizen reports a real problem in their community with geo-tagging, category classification, and photo evidence.',
          tags: ['Citizen Grievance', 'Geo-Tagging', 'Community Voting', 'Public Priority'],
          cta: {
            primary: { label: 'Report a Problem', onClick: () => onOpenAuth && onOpenAuth('register') },
            secondary: { label: 'Explore Problems', onClick: () => onNavigateTab && onNavigateTab('problems') },
          },
        },
        {
          id: 'validate',
          label: '2. Validate',
          still: createDioramaSVG({
            title: '2. Validate',
            subtitle: 'Universities review & adopt',
            themeColor: '#10B981',
            secondaryColor: '#06B6D4',
            type: 'validate',
          }),
          accent: '#10B981',
          scroll: 1.5,
          linger: 0.45,
          eyebrow: 'Step 02 • Academic Review',
          title: '2. Validate',
          body: 'Universities review, validate, and adopt the problem, assigning faculty mentors and framing academic scope for student research.',
          tags: ['University Review', 'Academic Scope', 'Faculty Mentors', 'Problem Adoption'],
          cta: {
            primary: { label: 'University Portal', onClick: () => onOpenAuth && onOpenAuth('login') },
            secondary: { label: 'View Open Calls', onClick: () => onNavigateTab && onNavigateTab('problems') },
          },
        },
        {
          id: 'innovate',
          label: '3. Innovate',
          still: createDioramaSVG({
            title: '3. Innovate',
            subtitle: 'Students develop solutions',
            themeColor: '#8B5CF6',
            secondaryColor: '#F59E0B',
            type: 'innovate',
          }),
          accent: '#8B5CF6',
          scroll: 1.5,
          linger: 0.45,
          eyebrow: 'Step 03 • Student Innovation',
          title: '3. Innovate',
          body: 'Students develop solutions with faculty mentorship, submitting technical architectures, software pitches, and working hardware prototypes.',
          tags: ['Student Pitches', 'Technical Architecture', 'Working Prototype', 'Sprint Tracking'],
          cta: {
            primary: { label: 'Submit Pitch', onClick: () => onOpenAuth && onOpenAuth('login') },
            secondary: { label: 'Explore Solutions', onClick: () => onNavigateTab && onNavigateTab('solutions') },
          },
        },
        {
          id: 'partner',
          label: '4. Partner',
          still: createDioramaSVG({
            title: '4. Partner',
            subtitle: 'Industry supports & funds',
            themeColor: '#F59E0B',
            secondaryColor: '#2563EB',
            type: 'partner',
          }),
          accent: '#F59E0B',
          scroll: 1.5,
          linger: 0.45,
          eyebrow: 'Step 04 • Industry Mentorship',
          title: '4. Partner',
          body: 'Industry supports with funding and technical guidance, providing CSR grants, technical review boards, and corporate advisory.',
          tags: ['CSR Grants', 'Industry Mentorship', 'Code & Safety Review', 'Corporate Pilots'],
          cta: {
            primary: { label: 'Partner with Us', onClick: () => onOpenAuth && onOpenAuth('register') },
            secondary: { label: 'Success Stories', onClick: () => onNavigateTab && onNavigateTab('success_stories') },
          },
        },
        {
          id: 'implement',
          label: '5. Implement',
          still: createDioramaSVG({
            title: '5. Implement',
            subtitle: 'Grassroots impact deployed',
            themeColor: '#059669',
            secondaryColor: '#10B981',
            type: 'implement',
          }),
          accent: '#059669',
          scroll: 1.6,
          linger: 0.5,
          eyebrow: 'Step 05 • Grassroots Impact',
          title: '5. Implement',
          body: 'Solutions are deployed to create real grassroots impact, adopted by district administrations and government officers across Bharat.',
          tags: ['District Rollout', 'Real Grassroots Impact', 'Citizen Feedback', 'Viksit Bharat'],
          cta: {
            primary: { label: 'Explore Problems', onClick: () => onNavigateTab && onNavigateTab('problems') },
            secondary: { label: 'Back to Home', onClick: () => onNavigateTab && onNavigateTab('landing') },
          },
        },
      ],
      connectors: [],
    };

    const cleanup = mountScrollWorld(containerRef.current, config);

    return () => {
      if (cleanup) cleanup();
    };
  }, [onBack, onOpenAuth, onNavigateTab]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#0B0F19',
      }}
    />
  );
};
