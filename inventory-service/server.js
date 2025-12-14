import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const parts = [
  // 🔧 Filters
  { id: "p1", name: "Engine Oil Filter (Both)", stock: 50, price: 250 },
  { id: "p2", name: "Air Filter (Both)", stock: 40, price: 300 },
  { id: "p3", name: "Fuel Filter (4W)", stock: 30, price: 450 },
  { id: "p4", name: "Oil Strainer (2W)", stock: 40, price: 180 },

  // 🛑 Brakes
  { id: "p5", name: "Front Brake Pad Set (Both)", stock: 25, price: 1200 },
  { id: "p6", name: "Rear Brake Shoe Set (2W)", stock: 35, price: 600 },
  { id: "p7", name: "Disc Brake Rotor (4W)", stock: 15, price: 3200 },
  { id: "p8", name: "Brake Caliper Kit (4W)", stock: 10, price: 2800 },
  { id: "p9", name: "Brake Fluid DOT 3 (Both)", stock: 60, price: 350 },
  { id: "p10", name: "Brake Fluid DOT 4 (4W)", stock: 50, price: 450 },

  // 🔥 Ignition
  { id: "p11", name: "Spark Plug (Both)", stock: 100, price: 150 },
  { id: "p12", name: "Ignition Coil (Both)", stock: 25, price: 1800 },
  { id: "p13", name: "CDI Unit (2W)", stock: 20, price: 2200 },
  { id: "p14", name: "Glow Plug (4W Diesel)", stock: 30, price: 900 },

  // 🛞 Tyres & Wheels
  { id: "p15", name: "Front Tyre (2W)", stock: 20, price: 2200 },
  { id: "p16", name: "Rear Tyre (2W)", stock: 20, price: 2600 },
  { id: "p17", name: "Car Tyre 14 inch (4W)", stock: 25, price: 4200 },
  { id: "p18", name: "Car Tyre 15 inch (4W)", stock: 25, price: 5200 },
  { id: "p19", name: "Alloy Wheel Nut (4W)", stock: 100, price: 120 },
  { id: "p20", name: "Wheel Bearing (Both)", stock: 40, price: 950 },

  // 🧴 Oils & Fluids
  { id: "p21", name: "Engine Oil 10W30 (2W)", stock: 80, price: 450 },
  { id: "p22", name: "Engine Oil 5W30 (4W)", stock: 70, price: 750 },
  { id: "p23", name: "Gear Oil (2W)", stock: 60, price: 280 },
  { id: "p24", name: "Transmission Oil (4W)", stock: 50, price: 650 },
  { id: "p25", name: "Coolant (4W)", stock: 55, price: 400 },

  // 🔋 Electrical
  { id: "p26", name: "Battery 5Ah (2W)", stock: 30, price: 1800 },
  { id: "p27", name: "Battery 35Ah (4W)", stock: 20, price: 5200 },
  { id: "p28", name: "Headlight Bulb (Both)", stock: 70, price: 300 },
  { id: "p29", name: "Indicator Bulb (Both)", stock: 90, price: 80 },
  { id: "p30", name: "Horn (Both)", stock: 40, price: 350 },

  // 🪛 Drive & Transmission
  { id: "p31", name: "Chain Sprocket Kit (2W)", stock: 25, price: 2400 },
  { id: "p32", name: "Clutch Plate Set (Both)", stock: 30, price: 3200 },
  { id: "p33", name: "Clutch Cable (2W)", stock: 50, price: 220 },
  { id: "p34", name: "Gear Lever (2W)", stock: 35, price: 300 },
  { id: "p35", name: "Drive Shaft (4W)", stock: 10, price: 6500 },

  // 🪑 Suspension
  { id: "p36", name: "Front Fork Oil Seal (2W)", stock: 40, price: 280 },
  { id: "p37", name: "Rear Shock Absorber (2W)", stock: 20, price: 2200 },
  { id: "p38", name: "Strut Assembly (4W)", stock: 15, price: 4800 },
  { id: "p39", name: "Suspension Bush Kit (4W)", stock: 25, price: 1200 },

  // 🧽 Service Items
  { id: "p40", name: "Chain Lubricant Spray (2W)", stock: 50, price: 350 },
  { id: "p41", name: "Throttle Cable (2W)", stock: 45, price: 200 },
  { id: "p42", name: "Accelerator Cable (4W)", stock: 30, price: 450 },
  { id: "p43", name: "Wiper Blade Pair (4W)", stock: 35, price: 600 },
  { id: "p44", name: "Washer Fluid (4W)", stock: 60, price: 120 },

  // 🚗 Body & Accessories
  { id: "p45", name: "Rear View Mirror (2W)", stock: 40, price: 350 },
  { id: "p46", name: "Side Mirror (4W)", stock: 30, price: 1200 },
  { id: "p47", name: "Seat Cover Set (4W)", stock: 20, price: 3500 },
  { id: "p48", name: "Helmet Lock (2W)", stock: 25, price: 450 },
  { id: "p49", name: "Floor Mat Set (4W)", stock: 20, price: 1800 },

  // 🧰 Misc (up to 100)
  { id: "p50", name: "Number Plate Frame (Both)", stock: 50, price: 200 },
  { id: "p51", name: "Fuse Kit (Both)", stock: 80, price: 150 },
  { id: "p52", name: "Relay Switch (4W)", stock: 30, price: 350 },
  { id: "p53", name: "Side Stand (2W)", stock: 35, price: 450 },
  { id: "p54", name: "Center Stand (2W)", stock: 30, price: 700 },
  { id: "p55", name: "Radiator Hose (4W)", stock: 25, price: 900 },
  { id: "p56", name: "Thermostat Valve (4W)", stock: 20, price: 850 },
  { id: "p57", name: "O-Ring Set (Both)", stock: 100, price: 120 },
  { id: "p58", name: "Grease Tube (Both)", stock: 60, price: 180 },
  { id: "p59", name: "Cleaning Cloth Pack (Both)", stock: 100, price: 90 },

  // up to p100 can be continued similarly if you want more depth
];

app.get("/api/parts/search", (req, res) => {
  const q = (req.query.q || "").toLowerCase();

  const results = parts.filter((p) => p.name.toLowerCase().includes(q));

  res.json(results);
});

app.listen(5001, () => {
  console.log("📦 Inventory Service running on http://localhost:5001");
});
