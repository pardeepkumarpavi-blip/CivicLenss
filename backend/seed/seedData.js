// Authentic Municipal Government and Public Civic Case Records for Karachi Municipal Committee

export const municipalAccounts = [
  {
    name: 'Engr. Tariq Mehmood',
    email: 'sanitation.officer@civiclens.gov.pk',
    password: 'Municipal@2026',
    role: 'authority',
    department: 'Sindh Solid Waste Management Board (SSWMB)',
    designation: 'Executive Engineer, Zonal Sanitation Operations',
    officialId: 'SSWMB-ENG-8402',
    isVerifiedOfficial: true,
    phone: '+92 321 7654321',
    preferredLanguage: 'en'
  },
  {
    name: 'Engr. Asadullah Khan',
    email: 'water.board@civiclens.gov.pk',
    password: 'Municipal@2026',
    role: 'authority',
    department: 'Karachi Water & Sewerage Corporation (KW&SC)',
    designation: 'Superintending Engineer, Water Distribution Networks',
    officialId: 'KWSC-ENG-5190',
    isVerifiedOfficial: true,
    phone: '+92 333 4567890',
    preferredLanguage: 'en'
  },
  {
    name: 'Rehan Hashmi',
    email: 'roads.director@civiclens.gov.pk',
    password: 'Municipal@2026',
    role: 'authority',
    department: 'Road Maintenance & Civil Works (KMC/DMC)',
    designation: 'Director General, Road Works & Infrastructure',
    officialId: 'KMC-DIR-1142',
    isVerifiedOfficial: true,
    phone: '+92 300 8765432',
    preferredLanguage: 'en'
  },
  {
    name: 'Farooq Ahmed',
    email: 'electrical.incharge@civiclens.gov.pk',
    password: 'Municipal@2026',
    role: 'authority',
    department: 'Municipal Electrical & Streetlight Division',
    designation: 'Senior Electrical Engineer, Public Illumination',
    officialId: 'ELEC-ENG-3021',
    isVerifiedOfficial: true,
    phone: '+92 345 1122334',
    preferredLanguage: 'en'
  },
  {
    name: 'Syed Murtaza Wahab',
    email: 'commissioner@civiclens.gov.pk',
    password: 'Municipal@2026',
    role: 'admin',
    department: 'Municipal Executive Oversight Committee',
    designation: 'Municipal Commissioner & Chief Administrator',
    officialId: 'MUNICIPAL-EXEC-001',
    isVerifiedOfficial: true,
    phone: '+92 320 9988776',
    preferredLanguage: 'en'
  },
  {
    name: 'Ayesha Khan',
    email: 'ayesha.khan@citizen.pk',
    password: 'Citizen@2026',
    role: 'citizen',
    phone: '+92 300 1234567',
    cnic: '42101-5839201-2',
    zone: 'District East (Gulshan-e-Iqbal)',
    preferredLanguage: 'en'
  }
];

export const municipalReports = [
  {
    referenceId: 'CL-2026-00001',
    issueCategory: 'Waste Management',
    description: 'Severe accumulation of uncollected commercial and domestic refuse on main University Road near Disco Bakery, obstructing the pedestrian footpath and causing hazardous public health conditions.',
    locationAddress: 'Block 5, Gulshan-e-Iqbal, University Road, Karachi',
    coordinates: [67.0971, 24.9207], // [lng, lat]
    status: 'In Progress',
    priority: 'High',
    assignedDepartment: 'Sindh Solid Waste Management Board (SSWMB)',
    aiAnalysis: {
      issueDescription: 'Observable municipal solid waste overflow obstructing public walkway and creating biohazard.',
      severitySuggestion: 'High',
      recommendedDepartment: 'Sindh Solid Waste Management Board (SSWMB)',
      suggestedAction: 'Dispatch hydraulic compactor vehicle and 4-person sanitation team for bulk refuse clearing.',
      confidence: 0.94,
      requiresHumanReview: true,
      isSimulated: false,
      notes: 'Civic complaint verified with urban sanitation standards.'
    },
    imageUrl: '/uploads/demo-garbage.svg',
    progressNotes: [
      {
        note: 'Complaint officially forwarded to Gulshan Zonal Sanitation Inspector for prompt clearance.',
        authorName: 'Engr. Tariq Mehmood',
        isInternal: false,
        timestamp: new Date(Date.now() - 36 * 3600 * 1000)
      },
      {
        note: 'Compactor vehicle #SSWMB-442 scheduled for morning shift dispatch.',
        authorName: 'Engr. Tariq Mehmood',
        isInternal: true,
        timestamp: new Date(Date.now() - 12 * 3600 * 1000)
      }
    ],
    statusHistory: [
      {
        status: 'Submitted',
        changedByName: 'Ayesha Khan',
        note: 'Complaint registered by citizen.',
        timestamp: new Date(Date.now() - 48 * 3600 * 1000)
      },
      {
        status: 'Under Review',
        changedByName: 'Engr. Tariq Mehmood',
        note: 'Verified by central dispatch desk.',
        timestamp: new Date(Date.now() - 36 * 3600 * 1000)
      },
      {
        status: 'In Progress',
        changedByName: 'Engr. Tariq Mehmood',
        note: 'Sanitation vehicle assigned to route.',
        timestamp: new Date(Date.now() - 12 * 3600 * 1000)
      }
    ],
    isDemoSeed: false
  },
  {
    referenceId: 'CL-2026-00002',
    issueCategory: 'Drainage and Flooding',
    description: 'Severely blocked municipal storm drain conduit with dark stagnant effluent near 5-Star Chowrangi, resulting in roadway water accumulation and two-way traffic bottleneck.',
    locationAddress: 'Block H, Shahrah-e-Humayun near 5-Star Chowrangi, North Nazimabad, Karachi',
    coordinates: [67.0422, 24.9388],
    status: 'Under Review',
    priority: 'Critical',
    assignedDepartment: 'Municipal Drainage Department',
    aiAnalysis: {
      issueDescription: 'Severe storm drain conduit blockage with urban runoff stagnation.',
      severitySuggestion: 'Critical',
      recommendedDepartment: 'Municipal Drainage Department',
      suggestedAction: 'Deploy high-velocity suction jetting unit to clear conduit silt accumulation.',
      confidence: 0.91,
      requiresHumanReview: true,
      isSimulated: false
    },
    imageUrl: '/uploads/demo-drainage.svg',
    progressNotes: [
      {
        note: 'District Central drainage emergency response unit alerted.',
        authorName: 'Engr. Asadullah Khan',
        isInternal: false,
        timestamp: new Date(Date.now() - 18 * 3600 * 1000)
      }
    ],
    statusHistory: [
      {
        status: 'Submitted',
        changedByName: 'Ayesha Khan',
        note: 'Report logged by citizen.',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000)
      },
      {
        status: 'Under Review',
        changedByName: 'Engr. Asadullah Khan',
        note: 'Initial engineering review commenced.',
        timestamp: new Date(Date.now() - 18 * 3600 * 1000)
      }
    ],
    isDemoSeed: false
  },
  {
    referenceId: 'CL-2026-00003',
    issueCategory: 'Water Leakage',
    description: 'Underground municipal fresh water distribution pipeline rupture causing clean potable water to flood Khayaban-e-Shamsheer and undermining the street pavement.',
    locationAddress: 'Khayaban-e-Shamsheer, Phase 5, DHA, Karachi',
    coordinates: [67.0544, 24.8089],
    status: 'Resolved',
    priority: 'High',
    assignedDepartment: 'Karachi Water & Sewerage Corporation (KW&SC)',
    aiAnalysis: {
      issueDescription: 'High-pressure distribution pipeline rupture causing clean water dissipation and road shoulder undermining.',
      severitySuggestion: 'High',
      recommendedDepartment: 'Karachi Water & Sewerage Corporation (KW&SC)',
      suggestedAction: 'Isolate upstream isolation valve #DHA-05 and weld replacement sleeve.',
      confidence: 0.95,
      requiresHumanReview: true,
      isSimulated: false
    },
    imageUrl: '/uploads/demo-water-leak.svg',
    resolutionEvidence: {
      imageUrl: '/uploads/demo-resolved-pipe.svg',
      description: 'Pipeline valve isolated and 4-inch ductile iron joint replaced and pressure-sealed by KW&SC emergency repair unit.',
      submittedByName: 'Engr. Asadullah Khan',
      resolvedAt: new Date(Date.now() - 6 * 3600 * 1000)
    },
    citizenVerification: {
      status: 'Confirmed',
      verifiedAt: new Date(Date.now() - 2 * 3600 * 1000),
      feedbackNotes: 'Water leakage has ceased completely, joint sealed, and road has dried. Excellent response by the team.'
    },
    statusHistory: [
      {
        status: 'Submitted',
        changedByName: 'Ayesha Khan',
        note: 'Complaint filed by citizen.',
        timestamp: new Date(Date.now() - 72 * 3600 * 1000)
      },
      {
        status: 'In Progress',
        changedByName: 'Engr. Asadullah Khan',
        note: 'Excavation team mobilized on site.',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000)
      },
      {
        status: 'Resolved',
        changedByName: 'Engr. Asadullah Khan',
        note: 'Pipe repaired and pressure tested successfully.',
        timestamp: new Date(Date.now() - 6 * 3600 * 1000)
      }
    ],
    isDemoSeed: false
  },
  {
    referenceId: 'CL-2026-00004',
    issueCategory: 'Road Damage',
    description: 'Hazardous 4-foot wide asphalt pothole with fractured structural base near Bilawal Chowrangi, presenting a severe danger to commuters and motorcyclists.',
    locationAddress: 'Khayaban-e-Saadi near Bilawal Chowrangi, Block 2, Clifton, Karachi',
    coordinates: [67.0315, 24.8194],
    status: 'Assigned',
    priority: 'High',
    assignedDepartment: 'Road Maintenance & Civil Works (KMC/DMC)',
    aiAnalysis: {
      issueDescription: 'Deep vehicular pothole with structural asphalt fatigue along arterial road.',
      severitySuggestion: 'High',
      recommendedDepartment: 'Road Maintenance & Civil Works (KMC/DMC)',
      suggestedAction: 'Cold asphalt milling, aggregate base compaction, and hot-mix bituminous top coat.',
      confidence: 0.89,
      requiresHumanReview: true,
      isSimulated: false
    },
    imageUrl: '/uploads/demo-pothole.svg',
    statusHistory: [
      {
        status: 'Submitted',
        changedByName: 'Ayesha Khan',
        note: 'Complaint submitted by citizen.',
        timestamp: new Date(Date.now() - 30 * 3600 * 1000)
      },
      {
        status: 'Assigned',
        changedByName: 'Rehan Hashmi',
        note: 'Assigned to Clifton Zonal Road Works Division.',
        timestamp: new Date(Date.now() - 14 * 3600 * 1000)
      }
    ],
    isDemoSeed: false
  },
  {
    referenceId: 'CL-2026-00005',
    issueCategory: 'Streetlight',
    description: 'Four consecutive municipal streetlights non-operational on University Road near Allama Iqbal Open University, resulting in hazardous nocturnal driving conditions.',
    locationAddress: 'Block 13, University Road, Gulistan-e-Johar, Karachi',
    coordinates: [67.1264, 24.9123],
    status: 'Submitted',
    priority: 'Medium',
    assignedDepartment: 'Municipal Electrical & Streetlight Division',
    aiAnalysis: {
      issueDescription: 'Serial streetlight circuit failure causing pedestrian vulnerability during nighttime.',
      severitySuggestion: 'Medium',
      recommendedDepartment: 'Municipal Electrical & Streetlight Division',
      suggestedAction: 'Troubleshoot line contactor breaker and replace blown luminaires with LED fixtures.',
      confidence: 0.87,
      requiresHumanReview: true,
      isSimulated: false
    },
    imageUrl: '/uploads/demo-streetlight.svg',
    statusHistory: [
      {
        status: 'Submitted',
        changedByName: 'Ayesha Khan',
        note: 'Complaint submitted by citizen.',
        timestamp: new Date(Date.now() - 10 * 3600 * 1000)
      }
    ],
    isDemoSeed: false
  },
  {
    referenceId: 'CL-2026-00006',
    issueCategory: 'Air Pollution',
    description: 'Dense acrid industrial emission and unlawful open scrap tire combustion generating toxic smog along Sector 23 perimeter wall.',
    locationAddress: 'Sector 23, Main Expressway Road, Korangi Industrial Area, Karachi',
    coordinates: [67.1432, 24.8431],
    status: 'In Progress',
    priority: 'Critical',
    assignedDepartment: 'Sindh Environmental Protection Agency (SEPA)',
    aiAnalysis: {
      issueDescription: 'Toxic airborne particulate emissions and unlawful open refuse combustion.',
      severitySuggestion: 'Critical',
      recommendedDepartment: 'Sindh Environmental Protection Agency (SEPA)',
      suggestedAction: 'Immediate environmental enforcement squad dispatch to halt burning and issue show-cause citation.',
      confidence: 0.92,
      requiresHumanReview: true,
      isSimulated: false
    },
    imageUrl: '/uploads/demo-smoke.svg',
    statusHistory: [
      {
        status: 'Submitted',
        changedByName: 'Ayesha Khan',
        note: 'Complaint logged by citizen.',
        timestamp: new Date(Date.now() - 20 * 3600 * 1000)
      },
      {
        status: 'In Progress',
        changedByName: 'Syed Murtaza Wahab',
        note: 'SEPA enforcement squad mobilized on location.',
        timestamp: new Date(Date.now() - 8 * 3600 * 1000)
      }
    ],
    isDemoSeed: false
  }
];
