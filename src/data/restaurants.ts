export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  allergens: string[]; // ['gluten', 'lactosa', 'huevo', 'frutos-secos', 'pescado', 'crustaceos', 'soja']
  isSpecialty?: boolean;
  isAvailable: boolean;
  isVegan?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  dishes: Dish[];
}

export interface DailyMenu {
  isActive: boolean;
  price: number;
  firstCourses: string[];
  secondCourses: string[];
  desserts?: string[];
  includes?: string;
  scheduleNotes?: string;
}

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  cuisine: string;
  category: 'carnes' | 'italiana' | 'mediterranea' | 'burgers' | 'brunch';
  priceLevel: '€' | '€€' | '€€€';
  rating: number;
  reviewCount: number;
  coverImage: string;
  logoImage: string;
  address: string;
  zone: string; // e.g., 'Torrelodones Pueblo' | 'Torrelodones Colonia'
  googleMapsUrl: string;
  phone: string;
  whatsapp: string;
  bookingType: 'phone' | 'whatsapp' | 'online' | 'walkin';
  bookingUrl?: string;
  capacity?: number; // Aforo / Capacidad máxima de comensales
  dailyMenu?: DailyMenu;
  schedule: {
    days: string;
    lunch: string;
    dinner?: string;
  };
  features: string[]; // ['Terraza exterior', 'Parking cercano', 'Pet Friendly', 'Opciones Celíacos', 'WiFi']
  featured: boolean;
  menu: MenuCategory[];
  stats?: {
    monthlyViews: number;
    monthlyQrScans?: number;
    monthlyWebReads?: number;
    uniqueVisitors?: number;
    monthlyBookings: number;
    phoneCalls?: number;
    whatsappClicks?: number;
    directionsClicks?: number;
    googleReviewsClicks?: number;
    sharesCount?: number;
    weeklyGrowth: number;
    conversionRate?: number;
    avgReadTimeSeconds?: number;
    lunchServicePercent?: number;
    dinnerServicePercent?: number;
    mobileDevicePercent?: number;
    estimatedRevenueEuros?: number;
    topDishes: { name: string; views: number; category?: string; price?: number; percentage?: number }[];
    scansByDay: { day: string; count: number; isPeak?: boolean }[];
    popularFilters?: { filter: string; percentage: number }[];
  };
}

export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: "asador-los-jarales",
    slug: "asador-los-jarales",
    name: "Asador Los Jarales",
    tagline: "Brasas de encina, carnes maduradas y cocina castellana",
    description: "Referente gastronómico en Torrelodones desde 1998. Especialistas en chuletón de vaca rubia gallega madurada a la brasa, lechazo asado y verduras de la huerta de temporada en nuestra terraza ajardinada.",
    cuisine: "Asador & Carnes a la Brasa",
    category: "carnes",
    priceLevel: "€€€",
    rating: 4.8,
    reviewCount: 420,
    capacity: 95,
    coverImage: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000&auto=format&fit=crop",
    logoImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=300&auto=format&fit=crop",
    address: "Camino de Valladolid, 14, 28250 Torrelodones (Pueblo)",
    zone: "Torrelodones Pueblo",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Asador+Los+Jarales+Camino+de+Valladolid+14+Torrelodones",
    phone: "+34 918 59 12 34",
    whatsapp: "+34 612 345 678",
    bookingType: "phone",
    dailyMenu: {
      isActive: true,
      price: 15.50,
      firstCourses: [
        "Salmorejo cordobés con crujiente de ibérico y huevo duro",
        "Ensalada templada de queso de cabra con frutos rojos",
        "Pote gallego tradicional de cuchara"
      ],
      secondCourses: [
        "Entrecot de ternera a la parrilla con patatas panadera",
        "Lubina a la plancha con bilbaína suave y verduritas",
        "Secreto ibérico a las brasas con pimientos del padrón"
      ],
      desserts: [
        "Tarta de queso fluida horneada",
        "Flan casero de huevo con nata",
        "Fruta fresca de temporada o Café arábica"
      ],
      includes: "Incluye primer plato, segundo plato, pan, 1 bebida y postre o café.",
      scheduleNotes: "Disponible de Martes a Viernes de 13:30 a 16:30 (no festivos)."
    },
    schedule: {
      days: "Martes a Domingo",
      lunch: "13:30 - 16:30",
      dinner: "20:30 - 23:45"
    },
    features: ["Terraza ajardinada", "Chuletero a la vista", "Parking gratuito", "Bodega de autor"],
    featured: true,
    stats: {
      monthlyViews: 540,
      monthlyBookings: 38,
      weeklyGrowth: 24,
      topDishes: [
        { name: "Chuletón de Vaca Rubia Gallega", views: 230 },
        { name: "Jamón Ibérico 100% Bellota", views: 165 },
        { name: "Tarta de Queso Fluida", views: 145 },
      ],
      scansByDay: [
        { day: "Lun", count: 12 },
        { day: "Mar", count: 45 },
        { day: "Mié", count: 52 },
        { day: "Jue", count: 68 },
        { day: "Vie", count: 120 },
        { day: "Sáb", count: 145 },
        { day: "Dom", count: 98 },
      ],
    },
    menu: [
      {
        id: "entrantes",
        name: "Entrantes de la Casa",
        description: "Para compartir al centro de mesa",
        dishes: [
          {
            id: "j-1",
            name: "Jamón Ibérico 100% Bellota con Pan de Cristal y Tomate",
            description: "Cortado a cuchillo al momento, acompañado de aceite virgen extra de Madrid",
            price: 24.50,
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten"],
            isSpecialty: true,
            isAvailable: true
          },
          {
            id: "j-2",
            name: "Croquetas Caseras de Cecina de León y Trufa (6 uds)",
            description: "Bechamel cremosa con leche fresca de la sierra y rebozado panko extra crujiente",
            price: 14.50,
            image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten", "lactosa", "huevo"],
            isSpecialty: true,
            isAvailable: true
          },
          {
            id: "j-3",
            name: "Mollejas de Cordero Lechal Salteadas al Ajillo con Boletus",
            description: "Doradas a fuego vivo con ajo tierno, boletus edulis y reducción de Pedro Ximénez",
            price: 14.50,
            allergens: [],
            isAvailable: true,
            isGlutenFree: true
          }
        ]
      },
      {
        id: "brasas",
        name: "Nuestras Brasas de Encina",
        description: "Cortes nobles con maduración controlada",
        dishes: [
          {
            id: "j-4",
            name: "Chuletón de Vaca Rubia Gallega (Maduración 45 días) - 1kg",
            description: "Servido sobre parrilla de carbón caliente, con sal marina en escamas y pimientos de Guernica",
            price: 72.00,
            image: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=600&auto=format&fit=crop",
            allergens: [],
            isSpecialty: true,
            isAvailable: true,
            isGlutenFree: true
          },
          {
            id: "j-5",
            name: "Entrecot de Ternera de Guadarrama IGP (350g)",
            description: "Carne tierna y jugosa con guarnición de patatas rústicas y pimientos de padrón",
            price: 24.00,
            allergens: [],
            isAvailable: true,
            isGlutenFree: true
          },
          {
            id: "j-6",
            name: "Paletilla de Cordero Lechal Asada a Baja Temperatura",
            description: "14 horas de cocción lenta y golpe de horno final para piel súper crujiente",
            price: 29.50,
            allergens: [],
            isSpecialty: true,
            isAvailable: true,
            isGlutenFree: true
          }
        ]
      },
      {
        id: "postres",
        name: "Postres Artesanos",
        description: "Elaborados diariamente por nuestro obrador",
        dishes: [
          {
            id: "j-7",
            name: "Tarta de Queso Fluida al Horno con Toque de Queso de Cabra de la Sierra",
            description: "Centro fundente con base de galleta de mantequilla y helado de frutos rojos",
            price: 7.50,
            image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten", "lactosa", "huevo"],
            isSpecialty: true,
            isAvailable: false
          },
          {
            id: "j-8",
            name: "Torrija Caramelizada en Pan Brioche con Helado de Vainilla Bourbon",
            description: "Empapada en infusión de leche, canela y cítricos",
            price: 7.00,
            allergens: ["gluten", "lactosa", "huevo"],
            isAvailable: true
          }
        ]
      }
    ]
  },
  {
    id: "la-tavola",
    slug: "la-tavola",
    name: "La Tavola di Torrelodones",
    tagline: "Auténtica trattoria italiana con horno de leña napolitano",
    description: "Una pequeña Italia en el corazón de la Colonia de Torrelodones. Pastas frescas amasadas a mano cada mañana, pizzas napolitanas de fermentación 72h e ingredientes 100% con denominación de origen.",
    cuisine: "Italiana Tradicional & Pizzería Napolitana",
    category: "italiana",
    priceLevel: "€€",
    rating: 4.7,
    reviewCount: 380,
    capacity: 70,
    coverImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop",
    logoImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300&auto=format&fit=crop",
    address: "Calle Jesús Burgueño, 8, 28250 Torrelodones (Colonia)",
    zone: "Torrelodones Colonia",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=La+Tavola+di+Torrelodones+Calle+Jesus+Burgueno+8+Torrelodones",
    phone: "+34 918 59 45 67",
    whatsapp: "+34 699 888 777",
    bookingType: "whatsapp",
    schedule: {
      days: "Miércoles a Domingo",
      lunch: "13:00 - 16:00",
      dinner: "20:00 - 23:30"
    },
    features: ["Horno de leña", "Masa madre 72h", "Terraza climatizada", "Carta de vinos italianos"],
    featured: true,
    menu: [
      {
        id: "antipasti",
        name: "Antipasti (Entrantes Italianos)",
        description: "Sabores directos del sur y norte de Italia",
        dishes: [
          {
            id: "t-1",
            name: "Burrata di Puglia DOP con Pesto Genovese y Tomates Confitados",
            description: "Corazón cremoso de stracciatella, piñones tostados y focaccia artesanal",
            price: 16.00,
            image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?q=80&w=600&auto=format&fit=crop",
            allergens: ["lactosa", "frutos-secos", "gluten"],
            isSpecialty: true,
            isAvailable: true,
            isVegetarian: true
          },
          {
            id: "t-2",
            name: "Carpaccio de Solomillo de Ternera con Virutas de Parmigiano Reggiano 24 Meses",
            description: "Con rúcula fresca selvática, alcaparras y emulsión de mostaza dijon",
            price: 16.00,
            allergens: ["lactosa"],
            isAvailable: true,
            isGlutenFree: true
          }
        ]
      },
      {
        id: "paste",
        name: "Pastas Frescas al Huevo",
        description: "Elaboradas diariamente en nuestro laboratorio",
        dishes: [
          {
            id: "t-3",
            name: "Tagliatelle al Tartufo Nero y Parmigiano en Rueda",
            description: "Pasta al dente mantecada con crema de trufa negra fresca de temporada y mantequilla alpina",
            price: 21.50,
            image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten", "lactosa", "huevo"],
            isSpecialty: true,
            isAvailable: true,
            isVegetarian: true
          },
          {
            id: "t-4",
            name: "Ravioloni Rellenos de Ricotta y Espinacas con Salsa de Mantequilla y Salvia",
            description: "Toque crujiente de nueces caramelizadas",
            price: 21.50,
            allergens: ["gluten", "lactosa", "huevo", "frutos-secos"],
            isAvailable: true,
            isVegetarian: true
          }
        ]
      },
      {
        id: "pizze",
        name: "Pizzas Napolitanas",
        description: "Harina tipo 00, fermentación 72 horas y cocción a 480°C",
        dishes: [
          {
            id: "t-5",
            name: "Pizza Margherita Verace DOP",
            description: "Tomate San Marzano, mozzarella fior di latte, albahaca fresca y AOVE",
            price: 14.90,
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten", "lactosa"],
            isAvailable: true,
            isVegetarian: true
          },
          {
            id: "t-6",
            name: "Pizza Diavola & Nduja Calabresa",
            description: "Mozzarella, salami picante spianata, nduja artesanal y miel de flores",
            price: 16.50,
            allergens: ["gluten", "lactosa"],
            isSpecialty: true,
            isAvailable: true
          }
        ]
      }
    ]
  },
  {
    id: "el-olivo-bistro",
    slug: "el-olivo-bistro",
    name: "Bistró El Olivo",
    tagline: "Cocina mediterránea de autor, producto de mercado y arroces",
    description: "Espacio íntimo y acogedor donde prima el producto de temporada. Arroces melosos en llanda, pescados salvajes del Cantábrico y una cuidada selección de más de 80 referencias de vino.",
    cuisine: "Mediterránea Contemporánea & Arrocería",
    category: "mediterranea",
    priceLevel: "€€",
    rating: 4.9,
    reviewCount: 295,
    capacity: 55,
    coverImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop",
    logoImage: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=300&auto=format&fit=crop",
    address: "Plaza de la Constitución, 3, 28250 Torrelodones (Pueblo)",
    zone: "Torrelodones Pueblo",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Bistro+El+Olivo+Plaza+de+la+Constitucion+3+Torrelodones",
    phone: "+34 918 59 78 90",
    whatsapp: "+34 644 112 233",
    bookingType: "online",
    bookingUrl: "https://gastrotorre.es/reservas/el-olivo",
    schedule: {
      days: "Martes a Domingo",
      lunch: "13:30 - 16:30",
      dinner: "20:30 - 23:30"
    },
    features: ["Terraza en plaza peatonal", "Arroces por encargo", "Sommelier en sala", "Accesible"],
    featured: true,
    menu: [
      {
        id: "entrantes",
        name: "Entrantes & Platos de Mercado",
        dishes: [
          {
            id: "o-1",
            name: "Tartar de Atún Rojo Balfegó sobre Brioche de Mantequilla y Yema Curada",
            description: "Aliñado con sésamo tostado, soja añeja y emulsión de wasabi suave",
            price: 21.00,
            image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten", "pescado", "soja", "huevo"],
            isSpecialty: true,
            isAvailable: true
          },
          {
            id: "o-2",
            name: "Alcachofas Confitadas a la Plancha con Velos de Jamón y Crema de Foie",
            description: "Corazones de alcachofa de Tudela con flor de sal y crujiente ibérico",
            price: 17.50,
            allergens: ["lactosa"],
            isSpecialty: true,
            isAvailable: true,
            isGlutenFree: true
          }
        ]
      },
      {
        id: "arroces",
        name: "Nuestros Arroces (Mínimo 2 personas - Precio por ración)",
        dishes: [
          {
            id: "o-3",
            name: "Arroz Meloso de Bogavante del Cantábrico y Gamba Roja",
            description: "Fondo marino intenso de 8 horas de reducción lenta y arroz bomba valenciano",
            price: 25.00,
            image: "https://images.unsplash.com/photo-1536392706976-e486e2ba97af?q=80&w=600&auto=format&fit=crop",
            allergens: ["crustaceos", "pescado"],
            isSpecialty: true,
            isAvailable: true,
            isGlutenFree: true
          },
          {
            id: "o-4",
            name: "Arroz Negro de Chipirones de Potera con Alioli Suave de Azafrán",
            description: "Capa fina socarrat y chipirones salteados",
            price: 19.50,
            allergens: ["pescado", "huevo"],
            isAvailable: true,
            isGlutenFree: true
          }
        ]
      }
    ]
  },
  {
    id: "torre-smash",
    slug: "torre-smash",
    name: "Torre Smash & Brew",
    tagline: "Las smash burgers definitivas y cervezas artesanas",
    description: "Pasión por la técnica smash con costra caramelizada irresistible. Carne 100% de vaca madurada (Dry Aged 40 días), pan de patata brioche importado de Martin's y grifos de cerveza artesana local rotatorios.",
    cuisine: "Smash Burgers & Street Food Gourmet",
    category: "burgers",
    priceLevel: "€",
    rating: 4.9,
    reviewCount: 512,
    capacity: 48,
    coverImage: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=1000&auto=format&fit=crop",
    logoImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&auto=format&fit=crop",
    address: "Avenida de Torrelodones, 22, 28250 Torrelodones",
    zone: "Torrelodones Pueblo",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Torre+Smash+Brew+Avenida+de+Torrelodones+22+Torrelodones",
    phone: "+34 918 59 99 11",
    whatsapp: "+34 600 777 888",
    bookingType: "walkin",
    schedule: {
      days: "Lunes a Domingo",
      lunch: "13:00 - 16:30",
      dinner: "19:30 - 00:00"
    },
    features: ["Cervezas IPA en grifo", "Sin reservas (Take Away)", "Pantallas deportivas", "Música Indie"],
    featured: true,
    menu: [
      {
        id: "starters",
        name: "Starters & Dips",
        dishes: [
          {
            id: "s-1",
            name: "Patatas Trufadas con Parmigiano y Salsa Especial Torre",
            description: "Patata agria cortada a mano, aceite de trufa blanca y lluvia de queso parmesano",
            price: 7.90,
            image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?q=80&w=600&auto=format&fit=crop",
            allergens: ["lactosa"],
            isSpecialty: true,
            isAvailable: true,
            isVegetarian: true
          },
          {
            id: "s-2",
            name: "Crispy Bacon & Cheddar Bites (8 uds)",
            description: "Bocados crujientes con corazón de queso cheddar derretido y jalapeño suave",
            price: 8.50,
            allergens: ["gluten", "lactosa", "huevo"],
            isAvailable: true
          }
        ]
      },
      {
        id: "burgers",
        name: "Smash Burgers (Incluyen patatas fritas)",
        dishes: [
          {
            id: "s-3",
            name: "The King of Torre (Doble Smash)",
            description: "2 patties de 90g de vaca madurada 45 días, cuádruple queso cheddar americano, bacon ahumado crujiente y salsa secreta burger",
            price: 13.90,
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten", "lactosa", "huevo", "soja"],
            isSpecialty: true,
            isAvailable: true
          },
          {
            id: "s-4",
            name: "Truffle & Caramelized Onion Smash",
            description: "Doble carne smash, cebolla pochada 4 horas, queso gouda ahumado y mayonesa de trufa negra",
            price: 14.50,
            allergens: ["gluten", "lactosa", "huevo"],
            isSpecialty: true,
            isAvailable: true
          },
          {
            id: "s-5",
            name: "Smash Veggie Guadarrama",
            description: "Patty vegetal casero a base de setas y legumbres, queso vegano, lechuga roble y salsa tártara vegana",
            price: 12.90,
            allergens: ["gluten", "soja"],
            isAvailable: true,
            isVegan: true
          }
        ]
      }
    ]
  },
  {
    id: "la-huerta-brunch",
    slug: "la-huerta-brunch",
    name: "Café & Brunch La Huerta",
    tagline: "Specialty coffee, tostas de masa madre y desayunos todo el día",
    description: "Tu rincón de calma y buena energía en Torrelodones. Café de origen 100% arábica de tueste natural, zumos cold-pressed, repostería artesana sin azúcares refinados y opciones deliciosas para celíacos y veganos.",
    cuisine: "Brunch, Café de Especialidad & Healthy",
    category: "brunch",
    priceLevel: "€",
    rating: 4.8,
    reviewCount: 230,
    capacity: 42,
    coverImage: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=1000&auto=format&fit=crop",
    logoImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=300&auto=format&fit=crop",
    address: "Calle Real, 17, 28250 Torrelodones (Pueblo)",
    zone: "Torrelodones Pueblo",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe+Brunch+La+Huerta+Calle+Real+17+Torrelodones",
    phone: "+34 918 59 33 22",
    whatsapp: "+34 611 223 344",
    bookingType: "phone",
    schedule: {
      days: "Martes a Domingo",
      lunch: "08:30 - 17:00"
    },
    features: ["Café de especialidad", "Opciones sin gluten", "Pet friendly", "Terraza soleada", "Work-friendly WiFi"],
    featured: true,
    menu: [
      {
        id: "tostas",
        name: "Tostas en Pan de Masa Madre de Espelta",
        dishes: [
          {
            id: "h-1",
            name: "Tosta Avocado Toast & Huevos Poché Camperos",
            description: "Aguacate hass machacado con lima, dos huevos poché camperos, semillas de chía y copos de chili",
            price: 9.50,
            image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten", "huevo"],
            isSpecialty: true,
            isAvailable: true,
            isVegetarian: true
          },
          {
            id: "h-2",
            name: "Tosta de Salmón Ahumado Salvaje con Ricotta y Eneldo",
            description: "Base de queso ricotta de granja, alcaparras baby y aceite de oliva virgen extra",
            price: 11.00,
            allergens: ["gluten", "lactosa", "pescado"],
            isAvailable: true
          }
        ]
      },
      {
        id: "bowls-dulces",
        name: "Bowls Saludables & Pancakes",
        dishes: [
          {
            id: "h-3",
            name: "Açaí Bio Bowl Original con Granola Casera y Frutos Rojos",
            description: "Pulpa pura de açaí orgánico batida con plátano, topping de fresas de temporada, coco laminado y crema de cacahuete 100%",
            price: 8.90,
            image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=600&auto=format&fit=crop",
            allergens: ["frutos-secos"],
            isSpecialty: true,
            isAvailable: true,
            isVegan: true,
            isGlutenFree: true
          },
          {
            id: "h-4",
            name: "Fluffy Pancakes de Avena y Ricotta con Sirope Puro de Arce",
            description: "Torre de 3 tortitas esponjosas servidas con arándanos frescos y nueces pecana",
            price: 9.00,
            allergens: ["gluten", "lactosa", "huevo", "frutos-secos"],
            isSpecialty: true,
            isAvailable: true,
            isVegetarian: true
          }
        ]
      }
    ]
  }
];

export const initialRestaurants = INITIAL_RESTAURANTS;
