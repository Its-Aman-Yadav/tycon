export interface ProductVariant {
  model: string
  diameter?: string
  rotorRpm?: string
  hammers?: number
  mainMotorHp?: string
  blowerMotorHp?: string
  rotaryValveMotorHp?: string
  capacity?: string
  power?: string
  description: string
}

export interface PerformanceSpec {
  material: string
  fineness: string
  outputRange: string
}

export interface MeshMicronData {
  mesh: string
  microns: string
}

export interface TechnicalSpecRow {
  parameter: string
  values: string[]
}

export interface AdditionalRequirement {
  title: string
  items: string[]
}

export interface Product {
  id: string
  category: string
  name: string
  model: string
  tagline: string
  shortSummary: string
  description: string
  overview: string
  specs: string[]
  features: {
    title: string
    description: string
    icon: string
  }[]
  applications: string[]
  industries: string[]
  // New structured technical specs table
  technicalSpecsTable?: {
    headers: string[]
    rows: TechnicalSpecRow[]
  }
  // Legacy key-value specs
  technicalSpecs?: Record<string, string>
  performanceData: PerformanceSpec[]
  meshMicronTable?: MeshMicronData[]
  additionalRequirements?: AdditionalRequirement[]
  variants: ProductVariant[]
  relatedClients: string[]
  image: string
}

export const products: Product[] = [
  {
    id: "pulveriser",
    category: "grinding",
    name: "Pulveriser",
    model: "TPL Series",
    tagline: "Integrated Grinding and Classification System",
    shortSummary: "Industrial pulveriser for grinding and classification with flexible product fineness control, dust-free operation, and dependable performance.",
    description: "Industrial pulveriser for grinding and classification with flexible product fineness control, dust-free operation, and dependable performance.",
    overview: "The TYCO Pulveriser is designed as a rugged and efficient grinding system for multiple industrial materials. It combines grinding, classifying, and conveying in an integrated arrangement and is suited for applications requiring controlled output fineness and dependable performance.",
    specs: ["Dust-Free System", "Flexible Fineness", "High Efficiency"],
    features: [
      { title: "Rugged Construction", description: "Built for demanding industrial environments with dependable performance", icon: "shield" },
      { title: "Dust-Free System", description: "Enclosed operation prevents material loss and maintains clean environment", icon: "wind" },
      { title: "Flexible Fineness Control", description: "Adjustable output fineness to meet specific product requirements", icon: "sliders" },
      { title: "High Efficiency Operation", description: "Optimized design for maximum throughput with minimal energy", icon: "zap" },
      { title: "Low Maintenance", description: "Simple construction with easy access for routine maintenance", icon: "wrench" },
      { title: "Multiple Material Suitability", description: "Handles diverse materials from minerals to chemicals", icon: "layers" },
      { title: "Integrated System", description: "Combines grinding and classifying in single arrangement", icon: "link" }
    ],
    applications: ["Bauxite", "Bentonite", "Chemicals", "Dolomite", "Lime Stone", "Minerals", "Turmeric", "Similar Industrial Materials"],
    industries: ["Chemical", "Mineral Processing", "Food Processing", "Fertilizer", "Cement"],
    technicalSpecsTable: {
      headers: ["Model", "Diameter", "Rotor RPM", "No. of Hammers", "Main Motor HP", "Blower Motor HP", "Rotary Valve Motor HP"],
      rows: [
        { parameter: "TPL-18", values: ["18\"", "4500", "12", "7.5-10", "3-5", "0.5"] },
        { parameter: "TPL-24", values: ["24\"", "3600", "16", "15-20", "5-7.5", "1"] },
        { parameter: "TPL-30", values: ["30\"", "3000", "20", "25-40", "7.5-10", "1.5"] },
        { parameter: "TPL-36", values: ["36\"", "2800", "24", "40-60", "10-15", "2"] },
        { parameter: "TPL-42", values: ["42\"", "2400", "28", "60-100", "15-20", "3"] }
      ]
    },
    performanceData: [
      { material: "Dolomite", fineness: "200 mesh", outputRange: "300-500 kg/hr" },
      { material: "Calcium Carbite", fineness: "300 mesh", outputRange: "200-400 kg/hr" },
      { material: "Calcite", fineness: "250 mesh", outputRange: "250-450 kg/hr" },
      { material: "Bauxite", fineness: "150 mesh", outputRange: "400-600 kg/hr" },
      { material: "Chemicals", fineness: "100-300 mesh", outputRange: "150-500 kg/hr" },
      { material: "Minerals (General)", fineness: "100-400 mesh", outputRange: "100-600 kg/hr" }
    ],
    meshMicronTable: [
      { mesh: "100", microns: "149" },
      { mesh: "150", microns: "105" },
      { mesh: "200", microns: "74" },
      { mesh: "250", microns: "63" },
      { mesh: "300", microns: "53" },
      { mesh: "400", microns: "37" }
    ],
    additionalRequirements: [
      {
        title: "Electrical Requirement",
        items: [
          "Power supply: 415V, 3-Phase, 50 Hz",
          "Starter type: Star-Delta for main motor",
          "Control panel: With ammeter, voltmeter, and overload protection"
        ]
      },
      {
        title: "Space Requirement",
        items: [
          "Floor area varies by model (contact for layout drawing)",
          "Recommended headroom: Minimum 3.5 to 5 meters depending on model",
          "Allow space for maintenance access on all sides"
        ]
      },
      {
        title: "Installation Notes",
        items: [
          "Foundation: Isolated concrete foundation recommended",
          "Vibration dampening: Anti-vibration pads provided",
          "Ducting: Customer to arrange ducting from blower to bag filter",
          "Commissioning support available from TYCO engineering team"
        ]
      }
    ],
    variants: [
      { model: "TPL-18", diameter: "18\"", rotorRpm: "4500", hammers: 12, mainMotorHp: "7.5-10", blowerMotorHp: "3-5", rotaryValveMotorHp: "0.5", description: "Compact model for small-scale operations" },
      { model: "TPL-24", diameter: "24\"", rotorRpm: "3600", hammers: 16, mainMotorHp: "15-20", blowerMotorHp: "5-7.5", rotaryValveMotorHp: "1", description: "Mid-range model for medium production" },
      { model: "TPL-30", diameter: "30\"", rotorRpm: "3000", hammers: 20, mainMotorHp: "25-40", blowerMotorHp: "7.5-10", rotaryValveMotorHp: "1.5", description: "High-capacity model for larger operations" },
      { model: "TPL-36", diameter: "36\"", rotorRpm: "2800", hammers: 24, mainMotorHp: "40-60", blowerMotorHp: "10-15", rotaryValveMotorHp: "2", description: "Industrial-scale grinding system" },
      { model: "TPL-42", diameter: "42\"", rotorRpm: "2400", hammers: 28, mainMotorHp: "60-100", blowerMotorHp: "15-20", rotaryValveMotorHp: "3", description: "Heavy-duty model for maximum throughput" }
    ],
    relatedClients: ["Tata Chemicals", "Hindustan Unilever", "ITC Limited", "Pidilite Industries"],
    image: "/products/P-01_tyco-india-pulverizer.jpg"
  },
  {
    id: "spices-pulverizer",
    category: "grinding",
    name: "Spices Pulverizer",
    model: "TSP Series",
    tagline: "Cool Grinding Technology for Aroma-Preserving Spice Processing",
    shortSummary: "Specialized pulverizer designed for grinding spices while preserving aroma and essential oils.",
    description: "Specialized pulverizer designed for grinding spices while preserving aroma and essential oils. Ideal for spice processing units and food industries.",
    overview: "The TYCO Spices Pulverizer is specifically engineered for the food and spice industry where preserving volatile oils and aroma is critical. The cool grinding technology prevents heat buildup during processing, ensuring the final product retains its natural flavor profile and essential oils. Food-grade construction meets stringent hygiene standards.",
    specs: ["Aroma Retention", "Cool Grinding", "Hygienic Design"],
    features: [
      { title: "Cool Grinding", description: "Temperature-controlled grinding preserves volatile oils", icon: "thermometer" },
      { title: "Food-Grade SS", description: "SS304/SS316 construction meets food safety standards", icon: "shield" },
      { title: "Easy Sanitization", description: "Smooth surfaces and quick-release for easy cleaning", icon: "sparkles" },
      { title: "Uniform Particle Size", description: "Consistent grinding for quality end products", icon: "layers" },
      { title: "Low Heat Generation", description: "Minimal temperature rise during operation", icon: "zap" },
      { title: "Aroma Lock", description: "Special chamber design retains essential oils", icon: "droplet" }
    ],
    applications: ["Spice Processing", "Food Industry", "Masala Manufacturing", "Ayurvedic Products", "Condiments", "Herbs", "Tea Processing"],
    industries: ["Food Processing", "Spices", "Ayurveda", "Nutraceuticals", "Beverages"],
    technicalSpecs: {
      "Capacity Range": "25-1000 kg/hr",
      "Motor Power": "3-50 HP",
      "Fineness Range": "40-200 mesh",
      "Construction Material": "SS304/SS316 Food Grade",
      "Temperature Rise": "<10°C",
      "Certifications": "FSSAI Compliant"
    },
    performanceData: [
      { material: "Red Chilli", fineness: "60-80 mesh", outputRange: "100-200 kg/hr" },
      { material: "Turmeric", fineness: "80-100 mesh", outputRange: "80-150 kg/hr" },
      { material: "Coriander", fineness: "60-80 mesh", outputRange: "120-220 kg/hr" },
      { material: "Cumin", fineness: "60-80 mesh", outputRange: "100-180 kg/hr" },
      { material: "Mixed Spices", fineness: "60-100 mesh", outputRange: "80-200 kg/hr" }
    ],
    variants: [
      { model: "TSP-25", capacity: "25-75 kg/hr", power: "3-5 HP", description: "Small batch processing for artisan producers" },
      { model: "TSP-100", capacity: "75-200 kg/hr", power: "7.5-15 HP", description: "Medium capacity for spice brands" },
      { model: "TSP-300", capacity: "200-500 kg/hr", power: "20-30 HP", description: "High volume spice processing" },
      { model: "TSP-500", capacity: "500-1000 kg/hr", power: "40-50 HP", description: "Industrial spice grinding lines" }
    ],
    relatedClients: ["MDH Spices", "Everest Spices", "Catch Foods", "Eastern Condiments"],
    image: "/products/P-02_tyco-india-spices-pulverizer.jpg"
  },
  {
    id: "automatic-weighing-bagging-machine",
    category: "packaging",
    name: "Automatic Weighing & Bagging Machine",
    model: "TAWB Series",
    tagline: "High-Speed Precision Packaging for Bulk Materials",
    shortSummary: "Fully automatic weighing and bagging system for efficient packaging of powders, granules, and bulk materials.",
    description: "Fully automatic weighing and bagging system for efficient packaging of powders, granules, and other bulk materials with high accuracy.",
    overview: "The TYCO Automatic Weighing & Bagging Machine delivers precise, high-speed packaging for industrial operations. PLC-controlled automation ensures consistent accuracy while reducing labor requirements. The system handles various bag types and sizes, making it versatile for different packaging needs across industries.",
    specs: ["Auto Weighing", "High Speed", "±0.1% Accuracy"],
    features: [
      { title: "PLC Automation", description: "Fully automated operation with programmable controls", icon: "cpu" },
      { title: "Touch Screen HMI", description: "User-friendly interface for easy operation", icon: "monitor" },
      { title: "Multi-Head Weighing", description: "High accuracy through multi-point measurement", icon: "scale" },
      { title: "Auto Bag Handling", description: "Automatic bag placing, filling, and sealing", icon: "package" },
      { title: "Data Logging", description: "Production tracking and quality reporting", icon: "database" },
      { title: "Quick Changeover", description: "Fast adjustment for different bag sizes", icon: "refresh" }
    ],
    applications: ["Chemical Packaging", "Food Packaging", "Fertilizer Industry", "Cement Industry", "Agricultural Products", "Animal Feed", "Sugar Industry"],
    industries: ["Chemicals", "Food", "Agriculture", "Cement", "Fertilizer"],
    technicalSpecs: {
      "Weighing Range": "5-50 kg per bag",
      "Speed": "4-15 bags/min",
      "Accuracy": "±0.1-0.2%",
      "Bag Types": "PP/HDPE/Paper/Jute",
      "Control System": "PLC with HMI",
      "Power Supply": "415V, 3-Phase"
    },
    performanceData: [
      { material: "Powder Products", fineness: "5-25 kg bags", outputRange: "8-12 bags/min" },
      { material: "Granular Products", fineness: "10-50 kg bags", outputRange: "6-10 bags/min" },
      { material: "Free-flowing Materials", fineness: "25-50 kg bags", outputRange: "4-8 bags/min" }
    ],
    variants: [
      { model: "TAWB-25", capacity: "5-25 kg bags", power: "3 HP", description: "Standard bagging for small bags" },
      { model: "TAWB-50", capacity: "25-50 kg bags", power: "5 HP", description: "Heavy-duty bagging for large bags" },
      { model: "TAWB-TWIN", capacity: "Dual line system", power: "7.5 HP", description: "High-speed dual bagging line" },
      { model: "TAWB-AUTO", capacity: "Fully automatic line", power: "10 HP", description: "Complete packaging automation" }
    ],
    relatedClients: ["Coromandel International", "IFFCO", "Ambuja Cement", "UltraTech Cement"],
    image: "/products/P-03_tyco-india-weighing-bagging-machine.jpg"
  },
  {
    id: "air-classifier",
    category: "separation",
    name: "Air Classifier",
    model: "TAC Series",
    tagline: "Precision Particle Separation for Uniform Product Quality",
    shortSummary: "Precision air classification system for separating fine particles based on size and density.",
    description: "Precision air classification system for separating fine particles based on size and density. Essential for producing uniform particle size products.",
    overview: "The TYCO Air Classifier delivers accurate particle size separation through advanced aerodynamic principles. The system operates continuously with minimal energy consumption and maintenance requirements. It integrates seamlessly with grinding systems to create closed-loop circuits for precise product specifications.",
    specs: ["Precise Separation", "No Moving Parts", "Continuous Operation"],
    features: [
      { title: "Accurate Classification", description: "Precise cut points from 2-150 microns", icon: "target" },
      { title: "Low Energy", description: "Efficient air flow design reduces power needs", icon: "zap" },
      { title: "Minimal Maintenance", description: "Few moving parts for reliable operation", icon: "wrench" },
      { title: "Continuous Operation", description: "Non-stop classification for production lines", icon: "repeat" },
      { title: "System Integration", description: "Works with grinding systems in closed circuits", icon: "link" },
      { title: "Adjustable Cut Point", description: "Fine-tunable separation parameters", icon: "sliders" }
    ],
    applications: ["Mineral Processing", "Chemical Industry", "Pharmaceutical", "Powder Coatings", "Ceramics", "Calcium Carbonate", "Talc Processing"],
    industries: ["Mining", "Chemicals", "Pharmaceuticals", "Paints", "Ceramics"],
    technicalSpecs: {
      "Capacity Range": "100-10000 kg/hr",
      "Cut Point": "2-150 microns",
      "Classification Efficiency": "85-95%",
      "Air Volume": "1000-50000 m³/hr",
      "Construction": "MS/SS options",
      "Drive System": "Direct/Belt Drive"
    },
    performanceData: [
      { material: "Calcium Carbonate", fineness: "10 microns", outputRange: "500-1500 kg/hr" },
      { material: "Talc", fineness: "20 microns", outputRange: "400-1200 kg/hr" },
      { material: "Kaolin", fineness: "5 microns", outputRange: "300-800 kg/hr" },
      { material: "Chemical Powders", fineness: "10-50 microns", outputRange: "500-2000 kg/hr" }
    ],
    variants: [
      { model: "TAC-500", capacity: "100-500 kg/hr", power: "15-25 kW", description: "Compact classifier for small operations" },
      { model: "TAC-1500", capacity: "500-1500 kg/hr", power: "30-50 kW", description: "Mid-capacity classification" },
      { model: "TAC-3000", capacity: "1500-5000 kg/hr", power: "60-100 kW", description: "High-throughput classifier" },
      { model: "TAC-5000", capacity: "5000-10000 kg/hr", power: "100-150 kW", description: "Industrial-scale separation" }
    ],
    relatedClients: ["Tata Steel", "JSW Steel", "ACC Cement", "Birla White"],
    image: "/products/P-04_tyco-india-air-classifiers.jpg"
  },
  {
    id: "material-handling-equipments",
    category: "handling",
    name: "Material Handling Equipments",
    model: "TMH Series",
    tagline: "Complete Material Flow Solutions for Process Industries",
    shortSummary: "Complete range of material handling solutions including conveyors, elevators, and feeders.",
    description: "Complete range of material handling solutions including conveyors, elevators, feeders, and storage systems for efficient material flow.",
    overview: "TYCO Material Handling Equipments provide end-to-end solutions for moving bulk materials through industrial processes. From bucket elevators and screw conveyors to belt systems and pneumatic conveying, our equipment is designed for reliability and efficiency in demanding environments. Custom engineering ensures optimal integration with existing facilities.",
    specs: ["Modular Design", "Heavy Duty", "Custom Solutions"],
    features: [
      { title: "Bucket Elevators", description: "Efficient vertical transport of bulk materials", icon: "arrow-up" },
      { title: "Screw Conveyors", description: "Horizontal and inclined material movement", icon: "move-horizontal" },
      { title: "Belt Conveyors", description: "High-capacity bulk material transport", icon: "layers" },
      { title: "Pneumatic Systems", description: "Dust-free enclosed conveying", icon: "wind" },
      { title: "Custom Engineering", description: "Tailored solutions for specific needs", icon: "cog" },
      { title: "Modular Design", description: "Easy installation and expansion", icon: "puzzle" }
    ],
    applications: ["Bulk Material Handling", "Process Industries", "Mining", "Food Processing", "Cement Plants", "Power Plants", "Steel Industry"],
    industries: ["Cement", "Steel", "Mining", "Power", "Food Processing"],
    technicalSpecs: {
      "Conveyor Length": "Up to 100m",
      "Elevator Height": "Up to 40m",
      "Capacity": "1-500 TPH",
      "Construction Material": "MS/SS",
      "Drive Options": "Geared Motor/VFD",
      "Control": "Manual/PLC"
    },
    performanceData: [
      { material: "Bulk Powders", fineness: "Bucket Elevator", outputRange: "10-100 TPH" },
      { material: "Granules", fineness: "Screw Conveyor", outputRange: "5-50 TPH" },
      { material: "Aggregates", fineness: "Belt Conveyor", outputRange: "50-500 TPH" }
    ],
    variants: [
      { model: "TMH-BE", capacity: "Bucket Elevator", power: "2-50 HP", description: "Vertical material transport systems" },
      { model: "TMH-SC", capacity: "Screw Conveyor", power: "1-30 HP", description: "Horizontal/inclined material movement" },
      { model: "TMH-BC", capacity: "Belt Conveyor", power: "2-100 HP", description: "Long-distance bulk transport" },
      { model: "TMH-PC", capacity: "Pneumatic Conveying", power: "10-100 HP", description: "Enclosed dust-free conveying" }
    ],
    relatedClients: ["Ultratech Cement", "Shree Cement", "Dalmia Cement", "JK Cement"],
    image: "/products/P-05_tyco-india-material-handling-equipments.jpg"
  },
  {
    id: "jaw-crusher",
    category: "crushing",
    name: "Jaw Crusher",
    model: "TJC Series",
    tagline: "Heavy-Duty Primary Crushing for Hard Materials",
    shortSummary: "Heavy-duty jaw crusher for primary crushing of hard materials in mining and quarrying.",
    description: "Heavy-duty jaw crusher for primary crushing of hard materials. Designed for mining, quarrying, and recycling applications.",
    overview: "The TYCO Jaw Crusher is engineered for demanding primary crushing applications where reliability and throughput are critical. Hardened manganese steel jaws provide extended wear life, while the robust frame construction ensures stable operation under heavy loads. Adjustable discharge settings allow precise control of product size.",
    specs: ["High Reduction Ratio", "Robust Design", "Easy Maintenance"],
    features: [
      { title: "Manganese Jaws", description: "Hardened steel for extended wear life", icon: "shield" },
      { title: "Adjustable Discharge", description: "Variable output size from 10-300mm", icon: "sliders" },
      { title: "Toggle Protection", description: "Safety system prevents damage from uncrushables", icon: "alert-triangle" },
      { title: "Heavy-Duty Bearings", description: "Industrial bearings for continuous operation", icon: "cog" },
      { title: "Reversible Plates", description: "Double-sided jaw plates extend service life", icon: "refresh" },
      { title: "Easy Access", description: "Quick maintenance access points", icon: "wrench" }
    ],
    applications: ["Mining", "Quarrying", "Construction", "Recycling", "Aggregate Production", "Road Building", "Concrete Production"],
    industries: ["Mining", "Construction", "Quarrying", "Recycling", "Infrastructure"],
    technicalSpecs: {
      "Feed Size": "100-1200 mm",
      "Output Size": "10-300 mm",
      "Capacity": "1-500 TPH",
      "Motor Power": "7.5-200 HP",
      "Jaw Material": "Mn13 Steel",
      "Weight Range": "1-50 tons"
    },
    performanceData: [
      { material: "Granite", fineness: "40mm discharge", outputRange: "50-150 TPH" },
      { material: "Limestone", fineness: "50mm discharge", outputRange: "80-200 TPH" },
      { material: "Basalt", fineness: "60mm discharge", outputRange: "60-180 TPH" }
    ],
    variants: [
      { model: "TJC-1510", capacity: "1-10 TPH", power: "7.5-15 HP", description: "Small-scale crushing operations" },
      { model: "TJC-2515", capacity: "10-50 TPH", power: "20-40 HP", description: "Medium crushing requirements" },
      { model: "TJC-3624", capacity: "50-150 TPH", power: "50-100 HP", description: "Large quarry operations" },
      { model: "TJC-4830", capacity: "150-500 TPH", power: "125-200 HP", description: "Heavy-duty mining applications" }
    ],
    relatedClients: ["L&T", "Afcons Infrastructure", "NCC Limited", "KEC International"],
    image: "/products/P-06_tyco-india-jaw-crusher.jpg"
  },
  {
    id: "electromagnetic-vibrator",
    category: "feeding",
    name: "Electromagnetic Vibrator",
    model: "TEV Series",
    tagline: "Precision Feeding for Controlled Material Flow",
    shortSummary: "Precision electromagnetic vibrating feeder for controlled feeding of bulk materials.",
    description: "Precision electromagnetic vibrating feeder for controlled feeding of bulk materials. Provides accurate and consistent material flow.",
    overview: "The TYCO Electromagnetic Vibrator delivers precise, controlled feeding of bulk materials with instant start/stop capability. With no rotating parts, the system offers maintenance-free operation and exceptional reliability. Stepless speed control enables fine-tuning of feed rates for optimal process performance.",
    specs: ["Variable Speed", "No Rotating Parts", "Instant Start/Stop"],
    features: [
      { title: "Stepless Control", description: "Infinitely variable speed adjustment", icon: "sliders" },
      { title: "No Moving Parts", description: "Maintenance-free electromagnetic drive", icon: "check-circle" },
      { title: "Instant Response", description: "Immediate start/stop for precise control", icon: "zap" },
      { title: "Low Power", description: "Energy-efficient electromagnetic design", icon: "battery" },
      { title: "Silent Operation", description: "Quiet running with minimal vibration transfer", icon: "volume-x" },
      { title: "Long Life", description: "Simple construction ensures reliability", icon: "clock" }
    ],
    applications: ["Feeding Systems", "Dosing Applications", "Process Control", "Batching Systems", "Packaging Lines", "Foundry", "Glass Industry"],
    industries: ["Manufacturing", "Foundry", "Glass", "Pharmaceuticals", "Food Processing"],
    technicalSpecs: {
      "Feed Rate": "0.1-50 TPH",
      "Tray Width": "150-1200 mm",
      "Tray Length": "300-2000 mm",
      "Amplitude": "0-3 mm adjustable",
      "Control": "0-100% variable",
      "Power": "0.1-3 kW"
    },
    performanceData: [
      { material: "Fine Powders", fineness: "Small tray", outputRange: "0.1-1 TPH" },
      { material: "Granules", fineness: "Medium tray", outputRange: "1-10 TPH" },
      { material: "Coarse Materials", fineness: "Large tray", outputRange: "10-50 TPH" }
    ],
    variants: [
      { model: "TEV-150", capacity: "0.1-2 TPH", power: "0.1-0.3 kW", description: "Small-scale precision feeding" },
      { model: "TEV-300", capacity: "1-5 TPH", power: "0.3-0.5 kW", description: "Medium-capacity feeding" },
      { model: "TEV-600", capacity: "5-20 TPH", power: "0.5-1 kW", description: "High-volume feeding" },
      { model: "TEV-1200", capacity: "20-50 TPH", power: "1-3 kW", description: "Heavy-duty industrial feeding" }
    ],
    relatedClients: ["Saint-Gobain", "Asahi India Glass", "Hindalco", "Vedanta"],
    image: "/products/P-07_tyco-india-electromagnetic-vibrator.jpg"
  }
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.id === slug)
}

export function getRelatedProducts(currentId: string, category: string, limit: number = 3): Product[] {
  const sameCategory = products.filter(p => p.category === category && p.id !== currentId)
  const others = products.filter(p => p.id !== currentId && p.category !== category)
  return [...sameCategory, ...others].slice(0, limit)
}
