import { writable } from 'svelte/store';
import { SaveConstants } from "../../wailsjs/go/main/App.js";


 // Start with an empty object
const defaultConstants = {
    "conduitSizing": {
        "entries": {
            "14": 32,
            "2": 15,
            "22": 38,
            "3.5": 15,
            "38": 50,
            "5.5": 20,
            "8": 25
        }
    },
    "lightingDemandFactors": [
        [
            [
                3000,
                100
            ],
            [
                120000,
                35
            ],
            [
                null,
                25
            ]
        ],
        [
            [
                50000,
                40
            ],
            [
                null,
                20
            ]
        ],
        [
            [
                20000,
                50
            ],
            [
                100000,
                40
            ],
            [
                null,
                30
            ]
        ],
        [
            [
                12500,
                100
            ],
            [
                null,
                50
            ]
        ]
    ],
    "loadSpecificationCategories": [
        {
            "label": "Lighting",
            "types": [
                {
                    "label": "Fluorescent Lamp",
                    "unit_load": 1,
                    "value": 0
                },
                {
                    "label": "CFL",
                    "unit_load": 1,
                    "value": 1
                },
                {
                    "label": "PL",
                    "unit_load": 1,
                    "value": 2
                },
                {
                    "label": "EL",
                    "unit_load": 1,
                    "value": 3
                },
                {
                    "label": "LED",
                    "unit_load": 1,
                    "value": 4
                },
                {
                    "label": "Chandelier",
                    "unit_load": 1,
                    "value": 5
                },
                {
                    "label": "Lighting",
                    "unit_load": 1,
                    "value": 7
                },
                {
                    "label": "Others",
                    "unit_load": 1,
                    "value": 6
                }
            ],
            "value": 0
        },
        {
            "label": "Convenience outlet",
            "value": 1
        },
        {
            "label": "Kitchen Load",
            "types": [
                {
                    "label": "Electric Oven",
                    "unit_load": 1,
                    "value": 0
                },
                {
                    "label": "Electric Range",
                    "unit_load": 1,
                    "value": 1
                },
                {
                    "label": "Electric Griller",
                    "unit_load": 1,
                    "value": 2
                }
            ],
            "value": 2
        },
        {
            "label": "Motor",
            "types": [
                {
                    "label": "Air-Conditioning Unit",
                    "unit_load": 1,
                    "value": 0
                },
                {
                    "label": "Tonner ACU",
                    "unit_load": 1,
                    "value": 1
                },
                {
                    "label": "Water Pump",
                    "unit_load": 1,
                    "value": 2
                },
                {
                    "label": "Booster Pump",
                    "unit_load": 1,
                    "value": 3
                },
                {
                    "label": "Transfer Pump",
                    "unit_load": 1,
                    "value": 4
                },
                {
                    "label": "Fire Pump",
                    "unit_load": 1,
                    "value": 5
                },
                {
                    "label": "Jockey Pump",
                    "unit_load": 1,
                    "value": 6
                },
                {
                    "label": "Elevator",
                    "unit_load": 1,
                    "value": 7
                },
                {
                    "label": "Freezer",
                    "unit_load": 1,
                    "value": 8
                },
                {
                    "label": "Sump Pump",
                    "unit_load": 1,
                    "value": 9
                },
                {
                    "label": "Dishwasher",
                    "unit_load": 1,
                    "value": 10
                },
                {
                    "label": "Washing Machine",
                    "unit_load": 1,
                    "value": 11
                },
                {
                    "label": "Compressor",
                    "unit_load": 1,
                    "value": 12
                },
                {
                    "label": "Condenser",
                    "unit_load": 1,
                    "value": 13
                },
                {
                    "label": "Blower",
                    "unit_load": 1,
                    "value": 14
                },
                {
                    "label": "New Motor",
                    "unit_load": 1,
                    "value": 999
                }
            ],
            "value": 3
        },
        {
            "label": "Spare",
            "types": null,
            "value": 4
        },
        {
            "label": "Other Loads",
            "types": [
                {
                    "label": "PA",
                    "unit_load": 1,
                    "value": 0
                },
                {
                    "label": "CCTV",
                    "unit_load": 1,
                    "value": 1
                },
                {
                    "label": "FDAS",
                    "unit_load": 1,
                    "value": 2
                },
                {
                    "label": "Water Heater",
                    "unit_load": 1,
                    "value": 3
                }
            ],
            "value": 5
        }
    ],
    "occupancyTypes": [
        {
            "addons": [],
            "label": "Residential",
            "types": [
                {
                    "label": "Single Family Dwelling",
                    "lighting_df": 0,
                    "unit_load": 24,
                    "value": 0
                },
                {
                    "label": "Multiple Family Dwelling",
                    "lighting_df": 0,
                    "unit_load": 24,
                    "value": 1
                }
            ],
            "value": 0
        },
        {
            "addons": [
                {
                    "label": "Assembly halls and auditoriums",
                    "unit_load": 8,
                    "value": 0
                },
                {
                    "label": "Halls, corridors, closets, stairways",
                    "unit_load": 4,
                    "value": 1
                },
                {
                    "label": "Storage spaces",
                    "unit_load": 2,
                    "value": 2
                }
            ],
            "label": "Commercial",
            "types": [
                {
                    "label": "Armories and Auditoriums",
                    "lighting_df": null,
                    "unit_load": 8,
                    "value": 0
                },
                {
                    "label": "Banks",
                    "lighting_df": null,
                    "unit_load": 28,
                    "value": 1
                },
                {
                    "label": "Barber shops and beauty parlors",
                    "lighting_df": null,
                    "unit_load": 24,
                    "value": 2
                },
                {
                    "label": "Churches",
                    "lighting_df": null,
                    "unit_load": 8,
                    "value": 3
                },
                {
                    "label": "Clubs",
                    "lighting_df": null,
                    "unit_load": 16,
                    "value": 4
                },
                {
                    "label": "Court Rooms",
                    "lighting_df": null,
                    "unit_load": 16,
                    "value": 5
                },
                {
                    "label": "Dwelling Units",
                    "lighting_df": null,
                    "unit_load": 24,
                    "value": 6
                },
                {
                    "label": "Garages - commercial (storage)",
                    "lighting_df": null,
                    "unit_load": 4,
                    "value": 7
                },
                {
                    "label": "Hospitals",
                    "lighting_df": 1,
                    "unit_load": 16,
                    "value": 8
                },
                {
                    "label": "Hotels and motels, no cooking",
                    "lighting_df": 2,
                    "unit_load": 16,
                    "value": 9
                },
                {
                    "label": "Industrial commercial (loft) buildings",
                    "lighting_df": null,
                    "unit_load": 16,
                    "value": 10
                },
                {
                    "label": "Lodge rooms",
                    "lighting_df": null,
                    "unit_load": 12,
                    "value": 11
                },
                {
                    "label": "Office buildings",
                    "lighting_df": null,
                    "unit_load": 28,
                    "value": 12
                },
                {
                    "label": "Restaurants",
                    "lighting_df": null,
                    "unit_load": 16,
                    "value": 13
                },
                {
                    "label": "Schools",
                    "lighting_df": null,
                    "unit_load": 24,
                    "value": 14
                },
                {
                    "label": "Stores",
                    "lighting_df": null,
                    "unit_load": 24,
                    "value": 15
                },
                {
                    "label": "Warehouses (storage)",
                    "lighting_df": 3,
                    "unit_load": 2,
                    "value": 16
                }
            ],
            "value": 1
        }
    ],
    "phaseTypes": [
        {
            "label": "Single Phase",
            "value": 0
        },
        {
            "label": "Three Phase",
            "value": 1
        }
    ],
    "wireSizingData": {
        "entries": [
            {
                "Amp": 15,
                "Load Type": "Lighting",
                "Wire Size": 2,
                "Wire Type": [
                    "THHN",
                    "THWN-2"
                ]
            },
            {
                "Amp": 20,
                "Load Type": "Convenience outlet",
                "Wire Size": 3.5,
                "Wire Type": [
                    "THHN",
                    "THWN-2"
                ]
            },
            {
                "Amp": 25,
                "Load Type": "Small Appliance Circuits",
                "Wire Size": 5.5,
                "Wire Type": [
                    "THHN",
                    "THWN-2"
                ]
            },
            {
                "Amp": 30,
                "Load Type": "Air-Conditioning Unit",
                "Wire Size": 8,
                "Wire Type": [
                    "THHN",
                    "THWN-2"
                ]
            },
            {
                "Amp": 30,
                "Load Type": "Water Heater",
                "Wire Size": 8,
                "Wire Type": [
                    "THHN",
                    "THWN-2"
                ]
            },
            {
                "Amp": 50,
                "Load Type": "Electric Range",
                "Wire Size": 14,
                "Wire Type": [
                    "THHN",
                    "THWN-2"
                ]
            },
            {
                "Amp": 50,
                "Load Type": "Electric Oven",
                "Wire Size": 14,
                "Wire Type": [
                    "THHN",
                    "THWN-2"
                ]
            },
            {
                "Amp": 60,
                "Load Type": "Tonner ACU",
                "Wire Size": 22,
                "Wire Type": [
                    "THHN",
                    "THWN-2"
                ]
            },
            {
                "Amp": 20,
                "Load Type": "Motor Load (1 HP - 3 HP, 230V)",
                "Wire Size": 5.5,
                "Wire Type": [
                    "THHN",
                    "THWN-2",
                    "RHW-2"
                ]
            },
            {
                "Amp": 40,
                "Load Type": "Motor Load (5 HP - 10 HP, 230V)",
                "Wire Size": 14,
                "Wire Type": [
                    "THHN",
                    "THWN-2",
                    "RHW-2"
                ]
            },
            {
                "Amp": 80,
                "Load Type": "Motor Load (15 HP - 20 HP, 230V)",
                "Wire Size": 38,
                "Wire Type": [
                    "THHN",
                    "THWN-2",
                    "RHW-2"
                ]
            }
        ]
    }
}
const constantsStore = writable(defaultConstants);

async function loadConstants() {
    try {
        const response = await fetch('/constants.json'); // Load dynamically
        if (!response.ok) throw new Error('Failed to load constants.json');
        const data = await response.json();
        constantsStore.set({ ...defaultConstants, ...data });
    } catch (error) {
        console.error('Error loading constants:', error);
    }
}

// async function loadConstants() {
//     try {
//         const data = await LoadConstants();
//         if (data) {
//             constantsStore.set({ ...defaultConstants, ...data });
//         }
//     } catch (error) {
//         console.error("Error loading constants:", error);
//     }
// }


loadConstants();


export const constants = new Proxy({}, {
    get: (_, key) => {
        let value = undefined;
        constantsStore.subscribe(data => {
            value = data[key] ?? (key === "occupancyTypes" ? [] : undefined);
        })(); // Immediately get latest value
        return value;
    }
});

export function updateConstant(path, value) {
    constantsStore.update(current => {
        const keys = path.split('.');
        let obj = current;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!obj[key]) obj[key] = {};
            obj = obj[key];
        }

        obj[keys[keys.length - 1]] = value;

        SaveConstants(current);
        return { ...current };
    });
}