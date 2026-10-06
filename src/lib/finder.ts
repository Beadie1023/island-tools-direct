// Guided "Help me choose" finder. Edit the questions and where each answer leads here.
// Every answer either goes to another question (next) or to a section of the shop (go):
//   category = section slug, sub = exact subcategory name, q = extra search words.
export type FinderGo = { category: string; sub?: string; q?: string };
export type FinderOption = { label: string; hint?: string; next?: string; go?: FinderGo };
export type FinderNode = { question: string; options: FinderOption[]; contact?: boolean };

export const FINDER_START = "start";

export const FINDER: Record<string, FinderNode> = {
  "start": {
    "question": "What are you working on?",
    "options": [
      {
        "label": "Wood, decking or furniture",
        "next": "wood"
      },
      {
        "label": "Metal, machines or vehicles",
        "next": "metal"
      },
      {
        "label": "Concrete, brick or block walls",
        "next": "concrete"
      },
      {
        "label": "Plumbing and water",
        "next": "plumb"
      },
      {
        "label": "Electrical",
        "next": "elec"
      },
      {
        "label": "Lawn, garden or engines",
        "next": "lawn"
      },
      {
        "label": "Drilling holes",
        "next": "drill"
      },
      {
        "label": "Hand tools",
        "next": "tools"
      },
      {
        "label": "Painting, glue or sealing",
        "next": "paint"
      },
      {
        "label": "I'm not sure",
        "next": "unsure"
      }
    ]
  },
  "wood": {
    "question": "What do you need to do?",
    "options": [
      {
        "label": "Screw wood together (indoors)",
        "go": {
          "category": "screws",
          "sub": "Wood Screws"
        }
      },
      {
        "label": "Build a deck or fence outside",
        "go": {
          "category": "screws",
          "q": "deck"
        }
      },
      {
        "label": "Outdoors near the sea (won't rust)",
        "go": {
          "category": "stainless-steel-hardware",
          "sub": "Stainless Steel Screws"
        },
        "hint": "Stainless steel"
      },
      {
        "label": "Join heavy timber with lag screws",
        "go": {
          "category": "screws",
          "q": "lag"
        }
      },
      {
        "label": "Bolt wood with carriage bolts",
        "go": {
          "category": "bolts",
          "sub": "Carriage Bolts"
        }
      },
      {
        "label": "Hang drywall (sheetrock)",
        "go": {
          "category": "screws",
          "sub": "Sheet Rock Screws"
        }
      },
      {
        "label": "Repair furniture",
        "go": {
          "category": "safety-household-and-other",
          "sub": "Furniture Repair"
        }
      },
      {
        "label": "Drill into wood",
        "go": {
          "category": "drill-bits-and-hole-saws",
          "sub": "Wood Bits"
        }
      },
      {
        "label": "Sand or cut wood",
        "go": {
          "category": "power-tools-blades-and-abrasives"
        }
      }
    ]
  },
  "metal": {
    "question": "What are you fixing?",
    "options": [
      {
        "label": "A machine or equipment (bolts)",
        "next": "bolts"
      },
      {
        "label": "Nuts",
        "go": {
          "category": "nuts"
        }
      },
      {
        "label": "Washers",
        "go": {
          "category": "washers"
        }
      },
      {
        "label": "A car, truck or bike",
        "go": {
          "category": "automotive-and-bicycle"
        }
      },
      {
        "label": "Thin sheet metal or roofing",
        "go": {
          "category": "screws",
          "sub": "Sheet Metal Screws"
        }
      },
      {
        "label": "Self-drilling screws",
        "go": {
          "category": "screws",
          "sub": "Self-Drilling"
        }
      }
    ]
  },
  "bolts": {
    "question": "What kind of bolt?",
    "options": [
      {
        "label": "Standard (inch) hex bolts",
        "go": {
          "category": "bolts",
          "sub": "Hex Bolts"
        }
      },
      {
        "label": "Metric bolts",
        "go": {
          "category": "bolts",
          "q": "metric"
        }
      },
      {
        "label": "Extra strong (Grade 8)",
        "go": {
          "category": "bolts",
          "q": "grade 8"
        }
      },
      {
        "label": "Stainless steel (rust-proof)",
        "go": {
          "category": "stainless-steel-hardware",
          "sub": "Stainless Steel Bolts"
        }
      },
      {
        "label": "Not sure, show me all bolts",
        "go": {
          "category": "bolts"
        }
      }
    ]
  },
  "concrete": {
    "question": "What do you need to do?",
    "options": [
      {
        "label": "Hang something light (shelf, picture)",
        "go": {
          "category": "anchors-rivets-and-misc-fasteners",
          "sub": "Wall Plugs"
        }
      },
      {
        "label": "Hang something on a hollow wall",
        "go": {
          "category": "anchors-rivets-and-misc-fasteners",
          "sub": "Toggle Bolts"
        }
      },
      {
        "label": "Anchor something heavy",
        "go": {
          "category": "anchors-rivets-and-misc-fasteners",
          "q": "anchor"
        }
      },
      {
        "label": "Screw straight into concrete (Tapcon)",
        "go": {
          "category": "anchors-rivets-and-misc-fasteners",
          "q": "tapcon"
        }
      },
      {
        "label": "Drill into concrete or brick",
        "go": {
          "category": "drill-bits-and-hole-saws",
          "sub": "Masonry Drill Bits"
        }
      },
      {
        "label": "Drill with a hammer drill (SDS)",
        "go": {
          "category": "drill-bits-and-hole-saws",
          "q": "sds"
        }
      }
    ]
  },
  "plumb": {
    "question": "What's the job?",
    "options": [
      {
        "label": "Fix a leak or join PVC pipe",
        "go": {
          "category": "plumbing",
          "q": "pvc"
        }
      },
      {
        "label": "Drain pipes",
        "go": {
          "category": "plumbing",
          "sub": "DWV Fittings"
        }
      },
      {
        "label": "Toilet",
        "go": {
          "category": "plumbing",
          "sub": "Toilet Supplies"
        }
      },
      {
        "label": "Sink or basin",
        "go": {
          "category": "plumbing",
          "sub": "Sink Supplies"
        }
      },
      {
        "label": "Kitchen faucet",
        "go": {
          "category": "plumbing",
          "sub": "Kitchen Faucets"
        }
      },
      {
        "label": "Tub or shower",
        "go": {
          "category": "plumbing",
          "sub": "Tub Supplies"
        }
      },
      {
        "label": "Valves",
        "go": {
          "category": "plumbing",
          "q": "valve"
        }
      },
      {
        "label": "Hoses and hose clamps",
        "go": {
          "category": "plumbing",
          "q": "hose"
        }
      },
      {
        "label": "Air or compressor fittings",
        "go": {
          "category": "pneumatic-and-air-fittings"
        }
      }
    ]
  },
  "elec": {
    "question": "What do you need?",
    "options": [
      {
        "label": "Wire connectors",
        "go": {
          "category": "electrical-and-lighting",
          "sub": "Terminal Connectors"
        }
      },
      {
        "label": "Cable ties and clips",
        "go": {
          "category": "electrical-and-lighting",
          "q": "cable"
        }
      },
      {
        "label": "Switches, plates and outlets",
        "go": {
          "category": "electrical-and-lighting",
          "sub": "Electrical- Accessories"
        }
      },
      {
        "label": "Lights and bulbs",
        "go": {
          "category": "electrical-and-lighting",
          "q": "light"
        }
      },
      {
        "label": "Batteries",
        "go": {
          "category": "electrical-and-lighting",
          "sub": "Batteries"
        }
      },
      {
        "label": "Heat shrink tubing",
        "go": {
          "category": "electrical-and-lighting",
          "q": "shrink"
        }
      }
    ]
  },
  "lawn": {
    "question": "What are you working on?",
    "options": [
      {
        "label": "Weed trimmer",
        "go": {
          "category": "lawn-garden-and-engine-parts",
          "q": "trimmer"
        }
      },
      {
        "label": "Brush cutter",
        "go": {
          "category": "lawn-garden-and-engine-parts",
          "sub": "Brush Cutter Parts"
        }
      },
      {
        "label": "Lawn mower",
        "go": {
          "category": "lawn-garden-and-engine-parts",
          "sub": "Lawnmower parts"
        }
      },
      {
        "label": "Chainsaw",
        "go": {
          "category": "lawn-garden-and-engine-parts",
          "sub": "Chainsaw Parts"
        }
      },
      {
        "label": "Generator",
        "go": {
          "category": "lawn-garden-and-engine-parts",
          "sub": "Generator Parts"
        }
      },
      {
        "label": "Carburetors",
        "go": {
          "category": "lawn-garden-and-engine-parts",
          "q": "carburetor"
        }
      },
      {
        "label": "Spark plugs",
        "go": {
          "category": "lawn-garden-and-engine-parts",
          "sub": "Spark Plugs"
        }
      },
      {
        "label": "Pull-start (recoil) parts",
        "go": {
          "category": "lawn-garden-and-engine-parts",
          "sub": "Recoil Starter"
        }
      }
    ]
  },
  "drill": {
    "question": "What are you drilling into?",
    "options": [
      {
        "label": "Wood",
        "go": {
          "category": "drill-bits-and-hole-saws",
          "sub": "Wood Bits"
        }
      },
      {
        "label": "Metal or steel",
        "go": {
          "category": "drill-bits-and-hole-saws",
          "sub": "Steel Drill Bits"
        }
      },
      {
        "label": "Concrete or brick",
        "go": {
          "category": "drill-bits-and-hole-saws",
          "sub": "Masonry Drill Bits"
        }
      },
      {
        "label": "Tile or glass",
        "go": {
          "category": "drill-bits-and-hole-saws",
          "sub": "Glass Drill Bits"
        }
      },
      {
        "label": "Big round holes (hole saw)",
        "go": {
          "category": "drill-bits-and-hole-saws",
          "sub": "Bi - Metal Hole Saw"
        }
      },
      {
        "label": "I want a full set of bits",
        "go": {
          "category": "drill-bits-and-hole-saws",
          "sub": "Drill Bit Sets"
        }
      }
    ]
  },
  "tools": {
    "question": "What kind of tool?",
    "options": [
      {
        "label": "Sockets and ratchets",
        "go": {
          "category": "sockets-ratchets-and-driver-bits",
          "sub": "Sockets- Ratchets"
        }
      },
      {
        "label": "Wrenches",
        "go": {
          "category": "hand-tools",
          "q": "wrench"
        }
      },
      {
        "label": "Screwdrivers",
        "go": {
          "category": "hand-tools",
          "sub": "Screwdrivers"
        }
      },
      {
        "label": "Pliers",
        "go": {
          "category": "hand-tools",
          "sub": "Pliers"
        }
      },
      {
        "label": "Measuring tape and levels",
        "go": {
          "category": "hand-tools",
          "q": "measuring"
        }
      },
      {
        "label": "Saw blades, cutting discs, sandpaper",
        "go": {
          "category": "power-tools-blades-and-abrasives"
        }
      },
      {
        "label": "Power tools",
        "go": {
          "category": "power-tools-blades-and-abrasives",
          "sub": "Power Tools"
        }
      },
      {
        "label": "Allen (hex) keys",
        "go": {
          "category": "sockets-ratchets-and-driver-bits",
          "sub": "Hex Keys"
        }
      }
    ]
  },
  "paint": {
    "question": "What do you need?",
    "options": [
      {
        "label": "Spray paint",
        "go": {
          "category": "paint-sealants-and-adhesives",
          "sub": "Spray Paint"
        }
      },
      {
        "label": "Paint brushes",
        "go": {
          "category": "paint-sealants-and-adhesives",
          "sub": "Paint Brushes"
        }
      },
      {
        "label": "Caulk or silicone",
        "go": {
          "category": "paint-sealants-and-adhesives",
          "sub": "Caulk-Silicone"
        }
      },
      {
        "label": "Epoxy or glue",
        "go": {
          "category": "paint-sealants-and-adhesives",
          "sub": "Epoxy"
        }
      },
      {
        "label": "Sealant",
        "go": {
          "category": "paint-sealants-and-adhesives",
          "sub": "Sealant"
        }
      },
      {
        "label": "Tape",
        "go": {
          "category": "paint-sealants-and-adhesives",
          "q": "tape"
        }
      },
      {
        "label": "Solvents and thinners",
        "go": {
          "category": "paint-sealants-and-adhesives",
          "sub": "Solvent"
        }
      }
    ]
  },
  "unsure": {
    "question": "No problem. Tell us what you're trying to do and we'll point you to the right thing.",
    "contact": true,
    "options": []
  }
};
