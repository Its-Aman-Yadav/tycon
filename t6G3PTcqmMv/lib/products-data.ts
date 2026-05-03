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

export interface GalleryItem {
  title: string
  description: string
  image: string
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
  hasBrochure?: boolean
  // New structured technical specs table
  technicalSpecsTable?: {
    headers: string[]
    rows: TechnicalSpecRow[]
  }
  // Legacy key-value specs
  technicalSpecs?: Record<string, string>
  performanceData: PerformanceSpec[]
  performanceTable?: {
    headers: string[]
    rows: TechnicalSpecRow[]
  }
  performanceNote?: string
  meshMicronTable?: MeshMicronData[]
  additionalRequirements?: AdditionalRequirement[]
  productGallery?: GalleryItem[]
  variants: ProductVariant[]
  relatedClients: string[]
  image: string
  brochures?: { title: string; url: string }[]
}

export interface Client {
  id: number
  name: string
  logo: string
  products: string[]
}

export const clients: Client[] = [
  { id: 4, name: "Tata Steel", logo: "/clients/Tata%20Steel%20Logo.png", products: ["automatic-weighing-bagging-machine"] },
  { id: 6, name: "SAIL", logo: "/clients/Sail%20Logio.png", products: ["automatic-weighing-bagging-machine"] },
  { id: 7, name: "Jindal Steel", logo: "/clients/Jindal_Steel_Limited_Logo.png", products: ["automatic-weighing-bagging-machine"] },
  { id: 8, name: "Dabur India", logo: "/clients/Dabur%20logo.png", products: ["pulveriser"] },
  { id: 9, name: "Hindustan Unilever", logo: "/clients/Hindustan_Unilever_Logo%201.png", products: ["automatic-weighing-bagging-machine"] },
  { id: 10, name: "Aarti Industries", logo: "/clients/Arti%20logo.png", products: ["pulveriser"] },
  { id: 12, name: "Himalaya Wellness", logo: "/clients/Himalaya%20logo.png", products: ["pulveriser"] },
  { id: 13, name: "HIL Limited", logo: "/clients/HIL%20Limited%20logo.jfif", products: ["pulveriser"] },
  { id: 14, name: "AWL Agri Business", logo: "/clients/AWL_Agri_Business_Logo_COLOUR_RGB-2.png", products: ["automatic-weighing-bagging-machine"] },
  { id: 15, name: "Arya Vaidya Pharmacy", logo: "/clients/AVP%20logo.jfif", products: ["pulveriser"] },
  { id: 16, name: "Kores India", logo: "/clients/Kores%20Logo.jfif", products: ["air-classifier"] },
  { id: 17, name: "Usha Martin", logo: "/clients/Usha%20Martin%20Logo.png", products: ["automatic-weighing-bagging-machine"] },
  { id: 18, name: "RHI Magnesita", logo: "/clients/RHI%20Magnesita%20Logo.png", products: ["pulveriser", "air-classifier"] },
  { id: 21, name: "Kisanveer Satara", logo: "/clients/Kisanveer%20Satara%20SSKL.png", products: ["automatic-weighing-bagging-machine"] },
  { id: 22, name: "Maithan Ceramic", logo: "/clients/Maithan%20Ceramic%20Ltd.png", products: ["automatic-weighing-bagging-machine"] },
  { id: 23, name: "Natural Remedies", logo: "/clients/Natural%20remedies%20logo.jfif", products: ["pulveriser"] },
  { id: 24, name: "Oushadhi", logo: "/clients/Oushadhi%20logo.jfif", products: ["pulveriser"] },
  { id: 25, name: "TRL Krosaki", logo: "/clients/trl_krosaki_refractories_limited%20logo.jfif", products: ["air-classifier"] },
  { id: 26, name: "Shilpa Steel", logo: "/clients/Shilpa%20Steel%20Logo.png", products: ["automatic-weighing-bagging-machine"] },
  { id: 27, name: "Welspun", logo: "/clients/Welspun_Energy_Logo.png", products: ["automatic-weighing-bagging-machine"] },
  { id: 28, name: "Sanghvi Food", logo: "/clients/Sanghvi%20food%20logo.webp", products: ["pulveriser"] },
  { id: 29, name: "Zenex (Ayurvet)", logo: "/clients/Zenex%20Logo%20(Ayurvet%20Ltd).png", products: ["pulveriser"] },
  { id: 30, name: "Adhunik Group", logo: "/clients/adhuniklogo.png", products: ["automatic-weighing-bagging-machine"] },
  { id: 31, name: "Hira Group", logo: "/clients/hira-logo.png", products: ["automatic-weighing-bagging-machine"] },
  { id: 32, name: "Parakh Agro", logo: "/clients/parakh-agro%20logo.png", products: ["pulveriser"] },
  { id: 33, name: "KCI", logo: "/clients/kci-logo.png", products: ["pulveriser"] },
  { id: 34, name: "ECOF", logo: "/clients/ecof-logo.png", products: ["jaw-crusher"] },
  { id: 35, name: "Rashmi Group", logo: "/clients/Rashmi%20Grp%20Logo.png", products: ["automatic-weighing-bagging-machine"] },
  { id: 36, name: "Monnet Group", logo: "/clients/Monnet%20Grp%20logo.jpg", products: ["automatic-weighing-bagging-machine"] },
  { id: 37, name: "Tamilnadu Magnesite", logo: "/clients/Tamilnadu%20magnesite%20logo.jfif", products: ["pulveriser"] },
  { id: 38, name: "Arya Vaidya Sala", logo: "/clients/Arya%20Vaidya%20sala%20kottakkal.jfif", products: ["pulveriser"] },
  { id: 39, name: "ACB India Ltd", logo: "/clients/ACB%20logo.jfif", products: ["electromagnetic-vibrator"] },
  { id: 40, name: "Indian Herbs", logo: "/clients/Indian%20Herbs%20logo.jfif", products: ["pulveriser"] },
  { id: 41, name: "Pan Brand", logo: "/clients/Pan%20brand%20logo.jfif", products: ["pulveriser"] },
  { id: 42, name: "SP Group", logo: "/clients/SP%20Logo.png", products: ["jaw-crusher"] },
  { id: 43, name: "IOCL", logo: "", products: ["pulveriser", "air-classifier"] },
  { id: 44, name: "Hyderabad Industries Limited", logo: "/clients/HIL%20logo.jfif", products: ["pulveriser"] },
  { id: 45, name: "Lakshini Mineral Indus", logo: "", products: ["pulveriser"] },
  { id: 46, name: "Raja Mineral Industry", logo: "", products: ["pulveriser"] },
  { id: 47, name: "Narasemha Mineral Indus", logo: "", products: ["pulveriser"] },
  { id: 48, name: "Shridhar Mineral Indus", logo: "", products: ["pulveriser"] },
  { id: 49, name: "Sri Balaji Minerals", logo: "", products: ["pulveriser"] },
  { id: 50, name: "Modern Industries", logo: "", products: ["pulveriser"] },
  { id: 51, name: "Shankar Industries", logo: "", products: ["pulveriser"] },
  { id: 52, name: "Shree Bhagyalaxmi Foods", logo: "", products: ["pulveriser"] },
  { id: 53, name: "ITC Limited", logo: "", products: ["pulveriser"] },
  { id: 54, name: "Sri Gowrishankar Industries", logo: "", products: ["pulveriser"] },
  { id: 55, name: "Rajdhani Flour Mills", logo: "", products: ["pulveriser"] },
  { id: 56, name: "Abhijeet", logo: "", products: ["automatic-weighing-bagging-machine"] },
  { id: 57, name: "Adani", logo: "", products: ["automatic-weighing-bagging-machine"] },
  { id: 58, name: "Bhushan", logo: "", products: ["automatic-weighing-bagging-machine"] },
  { id: 59, name: "Graphite India Limited", logo: "", products: ["automatic-weighing-bagging-machine"] },
  { id: 60, name: "Vine Engineers", logo: "", products: ["automatic-weighing-bagging-machine"] },
  { id: 61, name: "Visa Steel and Power Limited", logo: "", products: ["automatic-weighing-bagging-machine"] },
  { id: 62, name: "Vizag Refractories Private Limited", logo: "", products: ["automatic-weighing-bagging-machine"] },
  { id: 63, name: "Welspun Steel & Power Ltd", logo: "", products: ["automatic-weighing-bagging-machine"] },
  { id: 64, name: "Dimple chemicals and Services Pvt Ltd", logo: "", products: ["automatic-weighing-bagging-machine"] },
  { id: 65, name: "Asian paint", logo: "", products: ["automatic-weighing-bagging-machine"] },
  { id: 66, name: "Bihar Foundary", logo: "", products: ["automatic-weighing-bagging-machine"] },
  { id: 67, name: "Chemical Construction International", logo: "", products: ["automatic-weighing-bagging-machine"] },
  { id: 68, name: "Kanoria C", logo: "", products: ["jaw-crusher"] },
  { id: 69, name: "TVS", logo: "", products: ["jaw-crusher"] },
  { id: 70, name: "Grasim", logo: "", products: ["electromagnetic-vibrator"] },
]

export const products: Product[] = [
  {
    id: "pulveriser",
    category: "grinding",
    name: "Pulveriser",
    model: "HP Series",
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
    applications: ["Chemicals", "Minerals", "Pharmaceuticals", "Food"],
    industries: ["Chemical Processing", "Mineral Industry", "Food Processing"],
    hasBrochure: true,
    brochures: [
      { title: "Technical Specifications - Page 1", url: "/brochure/P-C-01_Pulveriser_page1.png" },
      { title: "Technical Specifications - Page 2", url: "/brochure/P-C-01_Pulveriser_page2.png" }
    ],
    technicalSpecsTable: {
      headers: ["Model", "Size of Chamber", "Number of Hammers", "Mill RPM", "Motor HP"],
      rows: [
        { parameter: "HP-8", values: ["20\"", "8", "3545", "20"] },
        { parameter: "HP-18", values: ["32\"", "18", "1770", "40/50"] },
        { parameter: "HP-34", values: ["40\"", "18", "1500", "60/75"] },
        { parameter: "HP-40", values: ["42\"", "18", "1570", "75"] }
      ]
    },
    performanceData: [],
    performanceNote: "The output capacity of Tyco Pulveriser varies widely depending on the type of material, feed size and moisture content. Given below is the table indicating the pulverizing capacity on average basis however the capacity figures will vary from case to case depending upon several factors. These figures are meant for guidance only. The output of pulverizer will reduce with the increase in fineness.",
    performanceTable: {
      headers: ["Material For Grinding", "20\"", "32\"", "40\"", "42\""],
      rows: [
        { parameter: "Bauxite", values: ["200", "500", "750", "850"] },
        { parameter: "Bentonite", values: ["300", "750", "1050", "1200"] },
        { parameter: "Besan", values: ["250", "550", "850", "1100"] },
        { parameter: "Calcite", values: ["250", "550", "800", "900"] },
        { parameter: "Chalk", values: ["250", "600", "950", "1100"] },
        { parameter: "China Clay", values: ["250", "600", "900", "1150"] },
        { parameter: "Chromites", values: ["100", "200", "300", "400"] },
        { parameter: "Coal", values: ["250", "500", "750", "850"] },
        { parameter: "Graphite", values: ["200", "500", "800", "900"] },
        { parameter: "Gypsum", values: ["250", "500", "850", "1000"] },
        { parameter: "Hydrated Lime", values: ["300", "600", "900", "1050"] },
        { parameter: "Lime Stone", values: ["300", "600", "900", "1050"] },
        { parameter: "Ochre's", values: ["250", "600", "850", "1050"] },
        { parameter: "Pyrophyllite", values: ["250", "600", "850", "1050"] },
        { parameter: "Soap Stone", values: ["300", "700", "1000", "1200"] },
        { parameter: "Magnesite", values: ["200", "500", "750", "850"] },
        { parameter: "Herbs", values: ["60", "120", "175", "220"] },
        { parameter: "Dolomite", values: ["350", "750", "1050", "1200"] },
        { parameter: "Turmeric", values: ["-", "250", "400", "450"] }
      ]
    },
    meshMicronTable: [
      { mesh: "100", microns: "149" },
      { mesh: "150", microns: "105" },
      { mesh: "200", microns: "74" },
      { mesh: "250", microns: "63" },
      { mesh: "300", microns: "53" },
      { mesh: "400", microns: "37" }
    ],
    variants: [
      { model: "HP-8", diameter: "20\"", rotorRpm: "3545", hammers: 8, mainMotorHp: "20", description: "Compact and efficient pulveriser for small to medium scale operations." },
      { model: "HP-18", diameter: "32\"", rotorRpm: "1770", hammers: 18, mainMotorHp: "40/50", description: "Versatile industrial pulveriser for various grinding applications." },
      { model: "HP-34", diameter: "40\"", rotorRpm: "1500", hammers: 18, mainMotorHp: "60/75", description: "High-capacity grinding system for industrial production lines." },
      { model: "HP-40", diameter: "42\"", rotorRpm: "1570", hammers: 18, mainMotorHp: "75", description: "Heavy-duty pulveriser designed for maximum throughput." }
    ],
    relatedClients: ["Dabur India", "Himalaya Wellness", "IOCL", "RHI Magnesita", "Zenex (Ayurvet)", "ITC Limited"],
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
    applications: ["Spices", "Food Processing", "Masala"],
    industries: ["Food Industry", "Agriculture"],
    hasBrochure: true,
    brochures: [
      { title: "Product Brochure - Page 1", url: "/brochure/P-C-08_Baginbag_page1.png" },
      { title: "Product Brochure - Page 2", url: "/brochure/P-C-08_Baginbag_page2.png" }
    ],
    technicalSpecs: {
      "Capacity": "500-600 Kg/Hour",
      "Main Shaft": "EN-8",
      "Mill RPM": "2400 RPM",
      "Motor": "50/60 HP",
      "No. of Hammers": "24",
      "Material of Main Housing": "MS",
      "Main Shaft Bearing": "SKF"
    },
    performanceData: [
      { material: "Chilli", fineness: "Standard", outputRange: "500 kg/hr" },
      { material: "Coriander", fineness: "Standard", outputRange: "650 kg/hr" },
      { material: "Cumin", fineness: "Standard", outputRange: "450 kg/hr" }
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
    applications: [
      "Fertilizer (Granular - Crystalline)",
      "Sugar",
      "Sponge Iron",
      "Plastic Powder",
      "Salt",
      "Coffee Granules",
      "Washing Powder",
      "Sand Quartz",
      "Chemicals & Minerals",
      "Plastic Granules",
      "Grain Products",
      "Tea",
      "Quartz",
      "Coarse Meal"
    ],
    industries: ["Packaging", "Chemical Processing", "Construction"],
    hasBrochure: true,
    brochures: [
      { title: "Technical Specifications - Page 1", url: "/brochure/P-C-03_Weighingandbaggingmachine_page1.png" },
      { title: "Technical Specifications - Page 2", url: "/brochure/P-C-03_Weighingandbaggingmachine_page2.png" }
    ],
    performanceData: [],
    additionalRequirements: [
      {
        title: "Tyco Weighing & Bagging Product Range Includes",
        items: [
          "Net / Gross Weigher– Electro Mechanical along with electrical control panel.",
          "Net / Gross Weigher– Electronic Microprocessosr & Load Cell based.",
          "Twin Weigher Electromechanical & Electronic Microprocessor based.",
          "Net multi-dumping weigher up to 1.5-ton capacity bags."
        ]
      },
      {
        title: "Depending upon the Application One of the Following Dosing System is Adopted",
        items: []
      },
      {
        title: "Types Of Dosing",
        items: [
          "PE – Shutter",
          "RQ - PE roller dosing",
          "VF - PE chute dosing",
          "S - PE screw dosing",
          "VD - valve dosing",
          "BD - PE belt dosing"
        ]
      },
      {
        title: "Filling Systems",
        items: [
          "OS - bag - filling spout with clamp for open mouth bags",
          "VS - screw - type filling system for valve bags",
          "SB - centrifugal belt filling system for valve bags",
          "FR - gravity tube filling system for valve bags"
        ]
      }
    ],
    variants: [
      { model: "TAWB-25", capacity: "5-25 kg bags", power: "3 HP", description: "Standard bagging for small bags" },
      { model: "TAWB-50", capacity: "25-50 kg bags", power: "5 HP", description: "Heavy-duty bagging for large bags" },
      { model: "TAWB-TWIN", capacity: "Dual line system", power: "7.5 HP", description: "High-speed dual bagging line" },
      { model: "TAWB-AUTO", capacity: "Fully automatic line", power: "10 HP", description: "Complete packaging automation" }
    ],
    relatedClients: ["Tata Steel", "SAIL", "Jindal Steel", "Hindustan Unilever", "AWL Agri Business", "Usha Martin"],
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
      { title: "Strong Construction", description: "Heavy-duty design ensuring high durability and long service life", icon: "shield" },
      { title: "Minimise Loss of Fines", description: "Efficient air flow design to prevent material loss during classification", icon: "wind" },
      { title: "Special Liners", description: "Replaceable liners for handling abrasive materials and reducing wear", icon: "layers" },
      { title: "Accurate Classification", description: "Precise cut points from 2-150 microns", icon: "target" },
      { title: "Low Energy", description: "Efficient air flow design reduces power needs", icon: "zap" },
      { title: "Minimal Maintenance", description: "Few moving parts for reliable operation", icon: "wrench" },
      { title: "Continuous Operation", description: "Non-stop classification for production lines", icon: "repeat" }
    ],
    applications: [
      "Barites",
      "Chalk",
      "China Clay",
      "Coal",
      "Fly Ash",
      "Food - Sugar, Cocoa, milk powder, corn, wheat starch, soya bean meal",
      "Gypsum",
      "Limestone",
      "Hydrated Lime",
      "Portland cement",
      "Silica Sand",
      "Soya Flour"
    ],
    industries: ["Mining", "Chemicals", "Pharmaceuticals", "Ceramics", "Cement", "Silica", "Food powders"],
    technicalSpecsTable: {
      headers: ["Motor Hp", "Feed Inlet Dia", "Approx. Overall Dimensions", "Approx. Discharge Height"],
      rows: [
        { parameter: "AC - 30", values: ["7.5", "64 mm", "1 m x 1 m x 2.3 m Ht", "1.3 Mtrs"] },
        { parameter: "AC - 72", values: ["15", "102 mm", "2.2 m x 2.2 m x 3.9 m Ht", "1.3 Mtrs"] }
      ]
    },
    technicalSpecs: {
      "Capacity Range": "100-10000 kg/hr",
      "Cut Point": "2-150 microns",
      "Classification Efficiency": "85-95%",
      "Air Volume": "1000-50000 m³/hr",
      "Construction": "MS/SS options",
      "Drive System": "Direct/Belt Drive"
    },
    performanceData: [],
    variants: [
      { model: "TAC-500", capacity: "100-500 kg/hr", power: "15-25 kW", description: "Compact classifier for small operations" },
      { model: "TAC-1500", capacity: "500-1500 kg/hr", power: "30-50 kW", description: "Mid-capacity classification" },
      { model: "TAC-3000", capacity: "1500-5000 kg/hr", power: "60-100 kW", description: "High-throughput classifier" },
      { model: "TAC-5000", capacity: "5000-10000 kg/hr", power: "100-150 kW", description: "Industrial-scale separation" }
    ],
    relatedClients: ["IOCL", "Kores India", "RHI Magnesita", "TRL Krosaki"],
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
    performanceData: [],
    variants: [
      { model: "Inclined belt conveyor", description: "A very useful material handling system for transferring Material from ground level to upper level." },
      { model: "Conveyors", description: "Modular design for logistics handling in warehouses." },
      { model: "Truck Loader and Unloader", description: "Unique design for loading and unloading of 50 kg bags." },
      { model: "Bag stacker", description: "Most useful for stacking 50 kg bags with reduced manpower." }
    ],
    relatedClients: ["Ultratech Cement", "Shree Cement", "Dalmia Cement", "JK Cement"],
    image: "/products/P-05_tyco-india-material-handling-equipments.jpg",
    productGallery: [
      {
        title: "Inclined belt conveyor",
        description: "A very useful material handling system for transferring Material from ground level to upper level. Each conveyor is designed according to their load carrying capacity.\n\nModular and light in weight with imported belt for proper grip to avoid slide down of material. Degree of Inclination varies from 1° to 45° depending on the requirement of the customer and material characteristics.\n\nCan be used for both up and down movement.",
        image: "/material/inclined-belt.jpg"
      },
      {
        title: "Conveyors",
        description: "Modular design and customised features and performance makes it a top most favorite with customers who wants to handle the logistics (50 Kg Bags of grain, Soya, DOC, Sugar etc) in the warehouse where after automatic weighing and bagging, bags are lifted, diverted, raised, lowered for either loading in trucks or for stacking in the storage areas.",
        image: "/material/conveyors.jpg"
      },
      {
        title: "Truck Loader and Unloader",
        description: "Its unique design for loading and unloading of 50 kg bags both jute and hdpe, makes it a favorite in Soya grain, sugar industries.\n\nHaving a minimum feeding height of 300 mm and a maximum 3 Meter height makes it very competent for loading to and unloading from the Trucks.\n\nEntire conveyor is mounted on an easily maneuverable trolley. A 2 HP Hydraulic Power Pack takes care of the raising and lowering. Imported German make control Panel with IP 65 enclosure and Variable Frequency Drive of reputed make ensures efficiency. Designed for 5 TPH or 100 bags of 50 kg per hour.",
        image: "/material/truck-loader.jpg"
      },
      {
        title: "Bag stacker",
        description: "Tyco Bag Stackers are most useful for stacking 50 kg Soya (seed or DOC), grains, Sugar bags either jute of hdpe.\n\nWith a top height of 15 feet it reduces the time and manpower considerably and become an indispensable part of storing activities.\n\nEasy maneuverability, short radius for turning and equipped with 2 hp hydraulic power pack, imported control panel, belt and various other user friendly features adds up its efficiency quotient.",
        image: "/material/bag-stacker.jpg"
      }
    ]
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
    applications: [
      "Gravel",
      "Blast Furnace Slag",
      "Quartz",
      "Feldspar",
      "Iron Ore",
      "Coal & Coke",
      "Stone",
      "Lime Stone",
      "Dolomite",
      "Ferro Alloys",
      "Bauxite",
      "Granite",
      "Barytes",
      "Betonies",
      "Magnesite",
      "Rock Phosphate",
      "Soap Stone"
    ],
    industries: ["Mining", "Construction", "Quarrying", "Recycling", "Infrastructure", "Roads building"],
    performanceNote: "With larger Jaw settings, corresponding higher capacities are obtained. Dimension and data given above are subject to change without notice.",
    performanceTable: {
      headers: ["Model", "Size Of Machine", "Max Feed Size", "Jaw Setting", "Capacity (MT/hr)", "Motor required", "Space requirement"],
      rows: [
        { parameter: "C 127", values: ["300mm x 175mm (12\" x 7\")", "140mm", "13 / 25 / 62 mm", "6 / 9 / 25", "20 HP", "1.36 M x 1 M x 1.18 M height"] },
        { parameter: "C 169", values: ["400mm x 225mm (16\" x 9\")", "180mm", "13 / 25 / 62 mm", "8 / 13 / 31", "25 HP", "1.56 M x 1.1 M x 1.33 M height"] },
        { parameter: "C 2213", values: ["558mm x 330mm", "250mm", "13 / 25 / 62 mm", "10 / 16 / 40", "40 HP", "1.7 M x 2.6 M x 1.9 M height"] }
      ]
    },
    performanceData: [],
    variants: [
      { model: "C 127", capacity: "6-25 TPH", power: "20 HP", description: "Compact jaw crusher for small to medium crushing operations." },
      { model: "C 169", capacity: "8-31 TPH", power: "25 HP", description: "Versatile jaw crusher for various industrial applications." },
      { model: "C 2213", capacity: "10-40 TPH", power: "40 HP", description: "High-capacity jaw crusher for heavy-duty requirements." }
    ],
    relatedClients: ["ECOF", "Kanoria C", "SP Group", "TVS"],
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
    technicalSpecsTable: {
      headers: ["Model", "Vibrations / min", "Max Input (Amps)", "Supply (50 cycles, A.C.)", "Net Weight - Vibrator", "Net Weight - Controller"],
      rows: [
        { parameter: "T 5", values: ["3000", "2.6", "220/240 volts", "25 Kgs", "15 Kgs"] },
        { parameter: "T 7", values: ["3000", "3.0", "400/440 volts", "76 Kgs", "15 Kgs"] },
        { parameter: "T 20", values: ["3000", "7.0", "400/440 volts", "127 Kgs", "15 Kgs"] }
      ]
    },
    performanceData: [],
    variants: [
      { model: "T 5", capacity: "0.1-2 TPH", power: "0.3 kW", description: "Small-scale precision feeding with 220/240V supply." },
      { model: "T 7", capacity: "1-10 TPH", power: "0.5 kW", description: "Medium-capacity feeding with 400/440V supply." },
      { model: "T 20", capacity: "10-50 TPH", power: "1.5 kW", description: "High-volume industrial feeding with 400/440V supply." }
    ],
    relatedClients: ["Grasim", "ACB India Ltd"],
    image: "/products/P-07_tyco-india-electromagnetic-vibrator.jpg"
  },
  {
    id: "packaging-equipment",
    category: "packaging",
    name: "Packaging Equipment",
    model: "TPE Series",
    tagline: "Secondary Packaging Automation",
    shortSummary: "Bulk packaging and aggregation of small pouches into large woven bags.",
    description: "Advanced secondary packaging automation for aggregating small pouches into bulk bags, designed to enhance productivity and reduce manual handling.",
    overview: "Our Packaging Equipment specializes in secondary packaging automation. It is specifically designed for the bulk packaging and aggregation of small pouches into large woven bags. This system streamlines logistics and significantly increases productivity by shifting menial, repetitive tasks to automated processes.",
    specs: ["Pouach Aggregation", "Manpower Reduction", "FMCG Optimized"],
    features: [
      { title: "Secondary Automation", description: "Seamless aggregation of small pouches into bulk units", icon: "package" },
      { title: "Productivity Boost", description: "Automation of menial tasks leading to higher throughput", icon: "trending-up" },
      { title: "Manpower Efficiency", description: "Reduces need for manual repetitive labor", icon: "users" },
      { title: "Versatile Applications", description: "Ideal for sugar, salt, pulses, rice, and besan", icon: "check-circle" }
    ],
    applications: ["Sugar Packaging", "Salt Packaging", "Pulses & Rice", "Besan aggregation", "FMCG Bulk Handling"],
    industries: ["FMCG Industry", "Food Processing", "Warehousing", "Logistics"],
    technicalSpecs: {
      "Primary Advantage": "Automation helps in reduction of manpower and shifting of menial, repetitive tasks leading to increase in productivity.",
      "Package Type": "Secondary / Bulk Packaging",
      "Aggregation": "Small pouches into large woven bags",
      "Industry Focus": "FMCG (All kind of food products)"
    },
    performanceData: [],
    variants: [
      { model: "TPE-SA", description: "Secondary Packaging Aggregator for FMCG pouches." }
    ],
    relatedClients: ["Adani Wilmar", "Tata Consumer Products", "Dawat Rice", "Fortune Foods"],
    image: "/newproduct.jpeg"
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
