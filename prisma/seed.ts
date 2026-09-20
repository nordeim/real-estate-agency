/**
 * MAISON ESTATE — idempotent seed.
 * Upserts by natural keys so it is safe to re-run.
 * Seeds the demo login user: sepnetflix2023@outlook.com / $Abcd1234
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const img = (name: string) => `/media/properties/${name}`;

type PropertySeed = {
  title: string;
  shortDescription: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  garage: number;
  yearBuilt: number;
  address: string;
  neighborhood: string;
  location: string;
  propertyType: string;
  images: string[];
  features: string[];
  isFeatured: boolean;
  isHighPriority: boolean;
};

const properties: PropertySeed[] = [
  {
    title: "Pacific Heights Glass Pavilion",
    shortDescription:
      "A steel-and-glass pavilion crowning Pacific Heights with unobstructed Golden Gate views.",
    description:
      "Perched on one of Pacific Heights' most coveted blocks, this architectural pavilion frames the Golden Gate Bridge from nearly every room. Floor-to-ceiling glazing, book-matched marble, and a cantilevered infinity edge pool dissolve the boundary between interior and sky. The main level unfolds as a single luminous gallery, while the lower level houses a screening room, wine cellar, and a spa suite with hammam.\n\nCommissioned by its architect-owner and completed to museum standards, the residence pairs engineering precision with quiet luxury: radiant limestone floors, invisibly integrated lighting, and a whole-home air system. A glass elevator serves all four levels, terminating in a roof garden designed for sunset entertaining.",
    price: 12850000,
    bedrooms: 5,
    bathrooms: 6,
    sqft: 7200,
    garage: 3,
    yearBuilt: 2021,
    address: "2501 Broadway",
    neighborhood: "Pacific Heights",
    location: "Pacific Heights",
    propertyType: "Penthouse",
    images: [img("penthouse-1.jpg"), img("penthouse-2.jpg"), img("modernist-1.jpg"), img("penthouse-3.jpg"), img("penthouse-5.jpg")],
    features: [
      "Golden Gate Bridge views",
      "Infinity-edge pool",
      "Glass elevator",
      "Wine cellar",
      "Screening room",
      "Radiant limestone floors",
      "Roof garden terrace",
      "Whole-home automation",
    ],
    isFeatured: true,
    isHighPriority: true,
  },
  {
    title: "Marina District Mediterranean Villa",
    shortDescription:
      "Sun-washed Mediterranean villa steps from the Marina Green and bayfront promenade.",
    description:
      "Behind a clipped privet hedge and arched loggia lies a villa that would feel at home on the Amalfi coast — yet the Marina Green and bayfront promenade are a two-minute stroll away. Sunlight pours through arched windows onto reclaimed terracotta floors; the garden courtyard centers on a century-old olive tree.\n\nThe villa's five bedrooms include a primary suite with a private loggia overlooking the bay. A chef's kitchen with Lacanche range opens to the courtyard, and the finished lower level offers a gym, guest suite, and temperature-controlled wine room.",
    price: 6950000,
    bedrooms: 5,
    bathrooms: 5,
    sqft: 4800,
    garage: 2,
    yearBuilt: 1927,
    address: "3840 Fillmore St",
    neighborhood: "Marina District",
    location: "Marina District",
    propertyType: "Estate",
    images: [img("historic-1.jpg"), img("historic-2.jpg"), img("waterfront-1.jpg"), img("historic-3.jpg"), img("historic-5.jpg")],
    features: [
      "Courtyard with olive tree",
      "Primary suite loggia",
      "Lacanche chef's kitchen",
      "Wine room",
      "Guest suite",
      "Bay views from loggia",
      "Reclaimed terracotta floors",
    ],
    isFeatured: true,
    isHighPriority: false,
  },
  {
    title: "Nob Hill Heritage Penthouse",
    shortDescription:
      "A full-floor penthouse in a landmark Nob Hill tower with wraparound skyline terraces.",
    description:
      "Occupying the entire 21st floor of a 1929 landmark tower, this penthouse marries Jazz Age grandeur with contemporary polish. Wraparound terraces deliver 360-degree views from the Bay Bridge to the Pacific; inside, 11-foot coffered ceilings, original cast-bronze hardware, and a restored grand salon recall the building's storied past.\n\nA private elevator landing opens to a gallery hall. The reimagined kitchen pairs Calacatta marble with hidden butler's service; the primary wing spans half the floor and includes dual baths, dressing rooms, and a terrace-facing study.",
    price: 9250000,
    bedrooms: 4,
    bathrooms: 5,
    sqft: 5600,
    garage: 2,
    yearBuilt: 1929,
    address: "1075 California St",
    neighborhood: "Nob Hill",
    location: "Nob Hill",
    propertyType: "Penthouse",
    images: [img("penthouse-4.jpg"), img("penthouse-6.jpg"), img("penthouse-2.jpg"), img("mansion-2.jpg")],
    features: [
      "Full-floor private elevator",
      "360-degree terraces",
      "Restored grand salon",
      "Coffered ceilings",
      "Butler's pantry",
      "Dual primary dressing rooms",
      "Landmark 1929 tower",
    ],
    isFeatured: true,
    isHighPriority: true,
  },
  {
    title: "Sea Cliff Modern Masterwork",
    shortDescription:
      "Concrete-and-glass masterwork above Seal Rocks with private stairs to Lands End.",
    description:
      "Carved into the bluffs above Seal Rocks, this modernist masterwork commands the meeting of ocean and headland. Board-formed concrete walls anchor glass volumes that project toward the horizon; the great room's 18-foot sliding wall opens the interior to a cantilevered deck suspended above the surf.\n\nPrivate stairs descend to Lands End trails. The estate includes a guest house, meditation garden by a noted landscape studio, and a garage gallery sized for a significant collection.",
    price: 18750000,
    bedrooms: 5,
    bathrooms: 7,
    sqft: 8400,
    garage: 4,
    yearBuilt: 2018,
    address: "312 Sea Cliff Ave",
    neighborhood: "Sea Cliff",
    location: "Sea Cliff",
    propertyType: "Waterfront",
    images: [img("waterfront-2.jpg"), img("waterfront-3.jpg"), img("modernist-2.jpg"), img("waterfront-4.jpg"), img("modernist-4.jpg")],
    features: [
      "Ocean-front cantilevered deck",
      "Private Lands End access",
      "Guest house",
      "Meditation garden",
      "Board-formed concrete",
      "Gallery garage",
      "18-foot sliding glass wall",
    ],
    isFeatured: true,
    isHighPriority: false,
  },
  {
    title: "Russian Hill View Residence",
    shortDescription:
      "Light-filled modern residence on Russian Hill with bay and city skyline panoramas.",
    description:
      "Tucked behind a mature garden on one of Russian Hill's quiet lanes, this residence rewards those who find it: walls of glass capture the bay, Alcatraz, and the downtown skyline in a single panorama. The inverted floor plan places living spaces on the view level, where a wraparound deck follows the sun from breakfast to dusk.\n\nThree en-suite bedrooms occupy the garden level, each opening to planted terraces. Radiant heat, automated shading, and a tucked-away elevator complete a home built for effortless living.",
    price: 5450000,
    bedrooms: 3,
    bathrooms: 4,
    sqft: 3600,
    garage: 2,
    yearBuilt: 2016,
    address: "45 Alta St",
    neighborhood: "Russian Hill",
    location: "Russian Hill",
    propertyType: "Modernist",
    images: [img("modernist-3.jpg"), img("modernist-5.jpg"), img("penthouse-5.jpg"), img("modernist-6.jpg")],
    features: [
      "Bay and skyline panoramas",
      "Wraparound view deck",
      "Garden terraces",
      "Elevator",
      "Radiant heat",
      "Automated shading",
    ],
    isFeatured: true,
    isHighPriority: false,
  },
  {
    title: "Presidio Heights Classic Estate",
    shortDescription:
      "Timeless Georgian estate bordering the Presidio with landscaped grounds and guest cottage.",
    description:
      "Completing one of Presidio Heights' finest blocks, this Georgian estate backs directly onto the Presidio's forested acres — a green permanence no neighbor can ever build over. A brick motor court, walled garden, and columned entry set the tone; inside, proportioned rooms with herringbone oak floors flow from a center-hall plan.\n\nThe property includes a two-bedroom guest cottage, a garden studio, and a lower level finished as a family recreation wing. Walking distance to Sacramento Street's boutiques and the Presidio's trail network.",
    price: 7985000,
    bedrooms: 6,
    bathrooms: 7,
    sqft: 6100,
    garage: 3,
    yearBuilt: 1913,
    address: "3540 Washington St",
    neighborhood: "Presidio Heights",
    location: "Presidio Heights",
    propertyType: "Estate",
    images: [img("historic-4.jpg"), img("historic-6.jpg"), img("mansion-3.jpg"), img("mansion-5.jpg")],
    features: [
      "Borders the Presidio",
      "Guest cottage",
      "Garden studio",
      "Center-hall plan",
      "Herringbone oak floors",
      "Brick motor court",
    ],
    isFeatured: true,
    isHighPriority: false,
  },
  {
    title: "Pacific Heights Grand Dame",
    shortDescription:
      "Restored 1904 Beaux-Arts mansion with ballroom, porte-cochère, and city views.",
    description:
      "One of the great remaining Beaux-Arts mansions of Pacific Heights, this 1904 residence has been meticulously restored across a five-year campaign: leathered walls regained their glow, leaded glass was conserved pane by pane, and modern systems vanished behind silk-covered walls.\n\nThe ballroom spans the full width of the second floor; a paneled library, conservatory, and staff wing complete the main levels. The pent-level primary suite surveys the bay and the Golden Gate from a wraparound terrace.",
    price: 21500000,
    bedrooms: 7,
    bathrooms: 9,
    sqft: 11500,
    garage: 4,
    yearBuilt: 1904,
    address: "2950 Broadway",
    neighborhood: "Pacific Heights",
    location: "Pacific Heights",
    propertyType: "Estate",
    images: [img("mansion-1.jpg"), img("mansion-4.jpg"), img("historic-2.jpg"), img("mansion-6.jpg")],
    features: [
      "Restored ballroom",
      "Conservatory",
      "Paneled library",
      "Porte-cochère",
      "Wraparound primary terrace",
      "Staff wing",
      "Five-year restoration",
    ],
    isFeatured: false,
    isHighPriority: false,
  },
  {
    title: "Nob Hill Elegant Residence",
    shortDescription:
      "Refined residence with park views, steps from Grace Cathedral and Huntington Park.",
    description:
      "Facing Huntington Park's canopy of plane trees, this residence brings quiet order to Nob Hill living. A formal entry opens to rooms scaled for both entertaining and daily life; windows frame the park, Grace Cathedral's spires, and the Huntington's Italianate facade.\n\nThe renovation added a steel-framed kitchen extension, a serene primary suite with park-facing study, and a lower-level wellness floor with lap pool and hammam.",
    price: 4850000,
    bedrooms: 4,
    bathrooms: 4,
    sqft: 4100,
    garage: 1,
    yearBuilt: 1922,
    address: "1050 Taylor St",
    neighborhood: "Nob Hill",
    location: "Nob Hill",
    propertyType: "Townhouse",
    images: [img("mansion-2.jpg"), img("historic-3.jpg"), img("penthouse-3.jpg")],
    features: [
      "Huntington Park views",
      "Steel-framed kitchen extension",
      "Lap pool",
      "Hammam",
      "Park-facing study",
    ],
    isFeatured: false,
    isHighPriority: false,
  },
  {
    title: "Marina Waterfront Contemporary",
    shortDescription:
      "Sleek waterfront contemporary with direct bay views and rooftop entertaining deck.",
    description:
      "Commands the Marina's best vantage: unobstructed bay views stretching from Alcatraz to the Golden Gate. The open-plan living level rides a wall of glass that retracts fully to a wind-protected terrace; above, a private roof deck adds a fireplace lounge and outdoor kitchen.\n\nSmart-glass windows modulate light throughout the day, and a four-car tandem garage rare for the district anchors the lower level.",
    price: 5950000,
    bedrooms: 3,
    bathrooms: 3,
    sqft: 3200,
    garage: 4,
    yearBuilt: 2019,
    address: "3515 Marina Blvd",
    neighborhood: "Marina District",
    location: "Marina District",
    propertyType: "Waterfront",
    images: [img("waterfront-5.jpg"), img("waterfront-6.jpg"), img("waterfront-1.jpg")],
    features: [
      "Unobstructed bay views",
      "Retractable glass wall",
      "Rooftop fireplace lounge",
      "Outdoor kitchen",
      "Smart-glass windows",
      "Four-car garage",
    ],
    isFeatured: false,
    isHighPriority: false,
  },
  {
    title: "Pacific Heights Modernist Townhouse",
    shortDescription:
      "Gut-renovated townhouse pairing Japanese-influenced minimalism with Broadway views.",
    description:
      "A five-level townhouse reimagined by its architect owner with shou sugi ban cladding, floating stair, and a curated material palette of oak, plaster, and blackened steel. Each level frames a composed view — culminating in a top-floor great room that surveys the Broadway mansions and bay beyond.\n\nA tatami-finished guest suite, tea kitchen, and courtyard garden with raked gravel complete a home of unusual serenity.",
    price: 4350000,
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2900,
    garage: 2,
    yearBuilt: 2020,
    address: "2112 Sacramento St",
    neighborhood: "Pacific Heights",
    location: "Pacific Heights",
    propertyType: "Townhouse",
    images: [img("modernist-4.jpg"), img("modernist-1.jpg"), img("modernist-6.jpg")],
    features: [
      "Shou sugi ban cladding",
      "Floating stair",
      "Tatami guest suite",
      "Courtyard garden",
      "Top-floor great room",
    ],
    isFeatured: false,
    isHighPriority: false,
  },
  {
    title: "Sea Cliff Garden Estate",
    shortDescription:
      "Hillside estate with terraced gardens and ocean sunset views above China Beach.",
    description:
      "Terraced down the hillside above China Beach, this estate is organized around a sequence of gardens — entry olive court, walled rose garden, and a lawn terrace that ends at nothing but sky and ocean. The residence steps with the site, each level capturing a longer arc of the sunset.\n\nInterior spaces favor natural materials and deep calm: oak floors, lime-washed walls, and a living room fireplace built from stone quarried on-site.",
    price: 13900000,
    bedrooms: 5,
    bathrooms: 6,
    sqft: 6800,
    garage: 3,
    yearBuilt: 2003,
    address: "265 Sea Cliff Ave",
    neighborhood: "Sea Cliff",
    location: "Sea Cliff",
    propertyType: "Estate",
    images: [img("waterfront-4.jpg"), img("waterfront-2.jpg"), img("mansion-5.jpg")],
    features: [
      "Terraced gardens",
      "China Beach access",
      "Sunset lawn terrace",
      "On-site quarry stone",
      "Lime-washed walls",
    ],
    isFeatured: false,
    isHighPriority: false,
  },
  {
    title: "Russian Hill Pinnacle Penthouse",
    shortDescription:
      "Crown penthouse with 270-degree views, private roof garden, and plunge pool.",
    description:
      "The crown of a boutique Russian Hill building, this two-story penthouse owns the pinnacle view: 270 degrees spanning the bay bridges, Alcatraz, and the city grid tumbling below. Interior glazing was re-engineered as structural glass to erase sightlines entirely.\n\nAbove, a private roof garden crowning the tower adds an outdoor fireplace, kitchen, and heated plunge pool positioned precisely for Golden Gate sunsets.",
    price: 11500000,
    bedrooms: 3,
    bathrooms: 4,
    sqft: 4400,
    garage: 2,
    yearBuilt: 2015,
    address: "900 Greenwich St",
    neighborhood: "Russian Hill",
    location: "Russian Hill",
    propertyType: "Penthouse",
    images: [img("penthouse-6.jpg"), img("penthouse-4.jpg"), img("penthouse-1.jpg")],
    features: [
      "270-degree views",
      "Private roof garden",
      "Heated plunge pool",
      "Structural glass walls",
      "Outdoor fireplace",
    ],
    isFeatured: false,
    isHighPriority: false,
  },
];

const agents = [
  {
    name: "Isabelle Marchetti",
    title: "Principal Broker",
    bio: "Isabelle founded Maison Estate after a decade directing portfolios for private family offices. She negotiates the city's most private transactions — many of which never reach the market — and has closed over $2 billion in career sales.",
    photo: "/media/agents/agent-1.jpg",
    yearsExperience: 22,
    totalSalesVolume: "$2.1B",
    email: "isabelle@maisonestate.com",
    phone: "(415) 555-0182",
    isFeatured: true,
  },
  {
    name: "James Whitfield",
    title: "Senior Advisor, Pacific & Sea Cliff",
    bio: "A third-generation San Franciscan, James knows the West Coast's bluff properties lot by lot. His architectural background shapes how he positions each listing — as a composition of light, view, and structure.",
    photo: "/media/agents/agent-2.jpg",
    yearsExperience: 17,
    totalSalesVolume: "$860M",
    email: "james@maisonestate.com",
    phone: "(415) 555-0147",
    isFeatured: true,
  },
  {
    name: "Amara Osei",
    title: "Director, New Development",
    bio: "Amara guides developers and buyers through the city's most ambitious new builds, from full-floor penthouses to waterfront masterworks. Her market intelligence briefs are read by two of the city's largest funds.",
    photo: "/media/agents/agent-4.jpg",
    yearsExperience: 14,
    totalSalesVolume: "$640M",
    email: "amara@maisonestate.com",
    phone: "(415) 555-0163",
    isFeatured: true,
  },
  {
    name: "Daniel Kavanagh",
    title: "Advisor, Estates & Heritage Homes",
    bio: "Daniel specializes in pre-war mansions and designated landmarks, coordinating restorations with the city's preservation office and the finest trades in the Bay Area.",
    photo: "/media/agents/agent-5.jpg",
    yearsExperience: 19,
    totalSalesVolume: "$510M",
    email: "daniel@maisonestate.com",
    phone: "(415) 555-0129",
    isFeatured: false,
  },
  {
    name: "Sofia Lindqvist",
    title: "Advisor, Modern & Architectural",
    bio: "With a graduate degree in architectural history, Sofia represents the city's significant modernist residences and the contemporary masterworks that follow them.",
    photo: "/media/agents/agent-6.jpg",
    yearsExperience: 11,
    totalSalesVolume: "$380M",
    email: "sofia@maisonestate.com",
    phone: "(415) 555-0114",
    isFeatured: false,
  },
];

const testimonials = [
  {
    quote:
      "Isabelle found us a home we didn't believe existed — a full-floor residence that never reached any listing service. Her discretion and market reach are simply unmatched.",
    clientName: "The Hartmann Family",
    propertyType: "Penthouse",
    location: "Nob Hill",
  },
  {
    quote:
      "James positioned our Sea Cliff home so precisely that we received three offers above ask within two weeks. Every detail of the campaign was considered, from the photography to the twilight viewings.",
    clientName: "Michael & Lena Torres",
    propertyType: "Waterfront",
    location: "Sea Cliff",
  },
  {
    quote:
      "Amara's guidance through a new-development purchase saved us from two design decisions we would have regretted. She treats your home as if it were her own.",
    clientName: "Dr. Priya Raghavan",
    propertyType: "Modernist",
    location: "Russian Hill",
  },
  {
    quote:
      "After a five-year search, Daniel placed us in a 1904 mansion and then project-managed the restoration. One advisor, one relationship, flawless execution.",
    clientName: "The Ellsworth Trust",
    propertyType: "Estate",
    location: "Pacific Heights",
  },
  {
    quote:
      "We interviewed three brokerages. Maison was the only one who listened more than they talked — and the results spoke for themselves: 12% above the neighborhood record.",
    clientName: "Kenji & Aiko Yamamoto",
    propertyType: "Townhouse",
    location: "Marina District",
  },
];

async function main() {
  console.log("Seeding MAISON ESTATE…");

  // Properties — upsert by title (natural key)
  for (const p of properties) {
    await db.property.upsert({
      where: { title: p.title },
      create: {
        ...p,
        images: JSON.stringify(p.images),
        features: JSON.stringify(p.features),
      },
      update: {
        ...p,
        images: JSON.stringify(p.images),
        features: JSON.stringify(p.features),
      },
    });
  }
  console.log(`  properties: ${properties.length}`);

  // Agents — upsert by email
  for (const a of agents) {
    if (!a.email) continue;
    await db.agent.upsert({
      where: { email: a.email },
      create: a,
      update: a,
    });
  }
  console.log(`  agents: ${agents.length}`);

  // Testimonials — clear and repopulate (no natural key)
  await db.testimonial.deleteMany();
  await db.testimonial.createMany({ data: testimonials });
  console.log(`  testimonials: ${testimonials.length}`);

  // Demo login user (matches the original app's credentials)
  const passwordHash = await bcrypt.hash("$Abcd1234", 12);
  await db.user.upsert({
    where: { email: "sepnetflix2023@outlook.com" },
    create: {
      email: "sepnetflix2023@outlook.com",
      name: "Maison Member",
      passwordHash,
      role: "user",
    },
    update: { passwordHash },
  });
  console.log("  demo user: sepnetflix2023@outlook.com / $Abcd1234");

  const counts = {
    properties: await db.property.count(),
    agents: await db.agent.count(),
    testimonials: await db.testimonial.count(),
    users: await db.user.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
