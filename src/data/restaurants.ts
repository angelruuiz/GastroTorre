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
  googlePlaceId?: string;
  isVerified?: boolean;
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
    isTemporarilyClosed?: boolean;
    closedReason?: string;
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
    id: "a1000000-0000-0000-0000-000000000001",
    slug: "asador-los-jarales",
    name: "Asador Los Jarales",
    tagline: "Brasas de encina, carnes maduradas y cocina castellana",
    description: "Referente gastronómico en Torrelodones desde 1998. Especialistas en chuletón de vaca rubia gallega madurada a la brasa, lechazo asado y verduras de la huerta de temporada en nuestra terraza ajardinada.",
    cuisine: "Asador & Carnes a la Brasa",
    category: "carnes",
    priceLevel: "€€€",
    rating: 4.8,
    reviewCount: 422,
    capacity: 95,
    coverImage: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000&auto=format&fit=crop",
    logoImage: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=300&auto=format&fit=crop",
    address: "Camino de Valladolid, 14, 28250 Torrelodones (Pueblo)",
    zone: "Torrelodones Pueblo",
    googleMapsUrl: "https://maps.google.com/?q=Asador+Los+Jarales+Torrelodones",
    phone: "+34 918 59 12 34",
    whatsapp: "+34 600 111 222",
    bookingType: "phone",
    dailyMenu: {
      isActive: true,
      price: 16.50,
      firstCourses: [
        "Salmorejo cordobés con jamón ibérico y huevo duro",
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
      scheduleNotes: "Disponible de Martes a Viernes de 13:30 a 16:30."
    },
    schedule: {
      days: "Martes a Domingo",
      lunch: "13:00 - 17:00",
      dinner: "20:30 - 23:45",
      isTemporarilyClosed: false
    },
    features: ["Carnes a la Brasa", "Terraza ajardinada", "Chuletero a la vista", "Parking gratuito", "Opciones Celíacos"],
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
        id: "c1000000-0000-0000-0000-000000000001",
        name: "Entrantes & Huerta",
        description: "Para compartir al centro de mesa",
        dishes: [
          {
            id: "d1000000-0000-0000-0000-000000000001",
            name: "Jamón Ibérico 100% Bellota D.O. Dehesa de Extremadura",
            description: "Cortado a cuchillo al momento con pan de cristal y tomate rallado con AOVE.",
            price: 24.50,
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
            allergens: [],
            isSpecialty: true,
            isAvailable: true,
            isGlutenFree: true
          },
          {
            id: "d1000000-0000-0000-0000-000000000002",
            name: "Croquetas Cremosas de Cecina de León y Boletus (6 uds)",
            description: "Bechamel suave con leche fresca de la sierra de Guadarrama y rebozado crujiente panko.",
            price: 14.50,
            image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten", "lactosa", "huevo"],
            isSpecialty: false,
            isAvailable: true
          },
          {
            id: "d1000000-0000-0000-0000-000000000003",
            name: "Ensalada de Tomate Rosa de la Sierra con Ventresca de Bonito del Norte",
            description: "Tomate de temporada, cebolla morada dulce, piparras y aceite de oliva virgen extra de Madrid.",
            price: 15.50,
            image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=600&auto=format&fit=crop",
            allergens: ["pescado"],
            isSpecialty: false,
            isAvailable: true,
            isGlutenFree: true
          },
          {
            id: "d1000000-0000-0000-0000-000000000004",
            name: "Mollejas de Cordero Lechal Salteadas al Ajillo con Ajos Tiernos",
            description: "Doradas a fuego vivo con ajo tierno, reducción de vino blanco de Madrid y perejil fresco.",
            price: 16.00,
            image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop",
            allergens: [],
            isSpecialty: false,
            isAvailable: true,
            isGlutenFree: true
          },
          {
            id: "d1000000-0000-0000-0000-000000000005",
            name: "Alcachofas a la Brasa de Encina con Flor de Sal Maldon y Lascas de Ibérico",
            description: "Confitadas primero y pasadas por la brasa viva para un toque ahumado crujiente.",
            price: 16.50,
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop",
            allergens: [],
            isSpecialty: true,
            isAvailable: true,
            isGlutenFree: true
          }
        ]
      },
      {
        id: "c1000000-0000-0000-0000-000000000002",
        name: "Brasas de Encina & Carnes Maduradas",
        description: "Cortes nobles con maduración controlada",
        dishes: [
          {
            id: "d1000000-0000-0000-0000-000000000006",
            name: "Chuletón de Vaca Rubia Gallega Madurada (45 días) - 1kg",
            description: "Servido sobre plato refractario caliente con sal marina en escamas y pimientos de Guernica.",
            price: 68.00,
            image: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=600&auto=format&fit=crop",
            allergens: [],
            isSpecialty: true,
            isAvailable: true,
            isGlutenFree: true
          },
          {
            id: "d1000000-0000-0000-0000-000000000007",
            name: "Entrecot de Ternera de Guadarrama IGP (350g) a la Brasa",
            description: "Corte tierno y jugoso con guarnición de patatas rústicas y pimientos asados a la leña.",
            price: 24.50,
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
            allergens: [],
            isSpecialty: false,
            isAvailable: true,
            isGlutenFree: true
          },
          {
            id: "d1000000-0000-0000-0000-000000000008",
            name: "Cuarto de Cordero Lechal Asado en Horno de Leña Tradicional",
            description: "Cocción lenta de 4 horas estilo Aranda con ensalada verde de la huerta.",
            price: 32.00,
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
            allergens: [],
            isSpecialty: true,
            isAvailable: true,
            isGlutenFree: true
          },
          {
            id: "d1000000-0000-0000-0000-000000000009",
            name: "Secreto Ibérico de Bellota a las Brasas con Patatas al Romero",
            description: "Carne infiltrada y muy jugosa con pimientos de padrón y sal escamada.",
            price: 21.50,
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
            allergens: [],
            isSpecialty: false,
            isAvailable: true,
            isGlutenFree: true
          }
        ]
      },
      {
        id: "c1000000-0000-0000-0000-000000000003",
        name: "Pescados & Platos de Temporada",
        description: "Pescados frescos del día a la parrilla",
        dishes: [
          {
            id: "d1000000-0000-0000-0000-000000000010",
            name: "Lubina Salvaje a la Espalda al Fuego de Encina con Refrito Bilbaíno",
            description: "Pescado fresco del día abierto en mariposa con ajos dorados, guindilla y vinagre de sidra.",
            price: 25.50,
            image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600&auto=format&fit=crop",
            allergens: ["pescado"],
            isSpecialty: true,
            isAvailable: true,
            isGlutenFree: true
          },
          {
            id: "d1000000-0000-0000-0000-000000000011",
            name: "Pulpo de Roca a la Brasa sobre Parmentier de Patata y Pimentón de la Vera",
            description: "Pata de pulpo crujiente por fuera y tierna por dentro con AOVE virgen extra.",
            price: 23.00,
            image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=600&auto=format&fit=crop",
            allergens: ["moluscos", "lactosa"],
            isSpecialty: false,
            isAvailable: true,
            isGlutenFree: true
          }
        ]
      },
      {
        id: "c1000000-0000-0000-0000-000000000004",
        name: "Postres Artesanos",
        description: "Elaborados diariamente por nuestro obrador",
        dishes: [
          {
            id: "d1000000-0000-0000-0000-000000000012",
            name: "Tarta de Queso Fluida al Horno con Queso de Cabra de Guadarrama",
            description: "Centro cremoso fundente, base de galleta artesana y coulis de frutos del bosque.",
            price: 7.50,
            image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten", "lactosa", "huevo"],
            isSpecialty: true,
            isAvailable: true,
            isVegetarian: true
          },
          {
            id: "d1000000-0000-0000-0000-000000000013",
            name: "Torrija Caramelizada en Pan Brioche con Helado de Leche Merengada",
            description: "Empapada 24h en infusión de leche fresca, canela y cítricos, dorada con azúcar moreno.",
            price: 7.00,
            image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten", "lactosa", "huevo"],
            isSpecialty: false,
            isAvailable: true,
            isVegetarian: true
          }
        ]
      }
    ]
  },
  {
    id: "a1000000-0000-0000-0000-000000000002",
    slug: "la-tavola",
    name: "La Tavola di Torrelodones",
    tagline: "Auténtica trattoria italiana con horno de leña napolitano",
    description: "Una pequeña Italia en el corazón de la Colonia de Torrelodones. Pastas frescas amasadas a mano cada mañana, pizzas napolitanas de fermentación lenta 72h e ingredientes 100% con denominación de origen protegida.",
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
    googleMapsUrl: "https://maps.google.com/?q=La+Tavola+Torrelodones",
    phone: "+34 918 59 45 67",
    whatsapp: "+34 699 888 777",
    bookingType: "whatsapp",
    dailyMenu: {
      isActive: true,
      price: 15.50,
      firstCourses: [
        "Insalata Caprese con Mozzarella di Bufala DOP y Albahaca Fresca",
        "Minestrone Tradicional de Verduras de Temporada con Pesto",
        "Carpaccio de Calabacín con Parmigiano y Piñones"
      ],
      secondCourses: [
        "Rigatoni all’Amatriciana con Guanciale Crujiente",
        "Pizza Margherita Napolitana con Fior di Latte",
        "Escalope Milanesa de Pollo Campero con Patatas Rústicas"
      ],
      desserts: [
        "Tiramisú Clásico Casero de Treviso",
        "Panna Cotta con Frutos Rojos",
        "Café Espresso Italiano"
      ],
      includes: "Incluye primer plato, segundo plato, pan casero, 1 bebida y postre o café.",
      scheduleNotes: "Disponible de Miércoles a Viernes de 13:00 a 16:30."
    },
    schedule: {
      days: "Miércoles a Domingo",
      lunch: "13:00 - 16:30",
      dinner: "20:00 - 23:45",
      isTemporarilyClosed: false
    },
    features: ["Horno de leña", "Masa madre 72h", "Terraza climatizada", "Carta de vinos italianos", "Opciones Celíacos"],
    featured: true,
    stats: {
      monthlyViews: 480,
      monthlyBookings: 32,
      weeklyGrowth: 18,
      topDishes: [
        { name: "Tagliatelle al Tartufo Nero", views: 210 },
        { name: "Pizza Tartufata & Prosciutto", views: 195 },
        { name: "Tiramisú Clásico", views: 160 },
      ],
      scansByDay: [
        { day: "Lun", count: 0 },
        { day: "Mar", count: 0 },
        { day: "Mié", count: 48 },
        { day: "Jue", count: 72 },
        { day: "Vie", count: 110 },
        { day: "Sáb", count: 155 },
        { day: "Dom", count: 95 },
      ],
    },
    menu: [
      {
        id: "c2000000-0000-0000-0000-000000000001",
        name: "Antipasti & Entrantes Italianos",
        description: "Sabores directos del sur y norte de Italia",
        dishes: [
          {
            id: "d2000000-0000-0000-0000-000000000001",
            name: "Burrata di Puglia DOP con Tomates Confitados y Pesto Genovese",
            description: "Corazón cremoso de stracciatella fresca, piñones tostados, rúcula salvaje y focaccia caliente.",
            price: 16.50,
            image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?q=80&w=600&auto=format&fit=crop",
            allergens: ["lactosa", "frutos-secos", "gluten"],
            isSpecialty: true,
            isAvailable: true,
            isVegetarian: true
          },
          {
            id: "d2000000-0000-0000-0000-000000000002",
            name: "Carpaccio de Solomillo de Ternera con Parmigiano Reggiano 24 Meses",
            description: "Láminas finísimas de ternera marinada con emulsión de mostaza dijon, alcaparras baby y AOVE.",
            price: 16.00,
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
            allergens: ["lactosa"],
            isSpecialty: false,
            isAvailable: true,
            isGlutenFree: true
          },
          {
            id: "d2000000-0000-0000-0000-000000000003",
            name: "Vitello Tonnato Piamontés Tradicional",
            description: "Finas lonchas de redondo de ternera lechal con cremosa salsa de atún, alcaparras y anchoas del Cantábrico.",
            price: 15.50,
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
            allergens: ["pescado", "huevo"],
            isSpecialty: false,
            isAvailable: true
          }
        ]
      },
      {
        id: "c2000000-0000-0000-0000-000000000002",
        name: "Pastas Frescas Hechas a Mano",
        description: "Elaboradas diariamente en nuestro laboratorio artesano",
        dishes: [
          {
            id: "d2000000-0000-0000-0000-000000000004",
            name: "Tagliatelle al Tartufo Nero Fresco y Rueda de Parmigiano",
            description: "Pasta al huevo fresca elaborada cada mañana, mantecada con crema de trufa negra y mantequilla alpina.",
            price: 21.50,
            image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten", "lactosa", "huevo"],
            isSpecialty: true,
            isAvailable: true,
            isVegetarian: true
          },
          {
            id: "d2000000-0000-0000-0000-000000000005",
            name: "Spaghetti alla Carbonara Auténtica con Guanciale Crujiente",
            description: "Receta romana auténtica: yema de huevo de corral, queso Pecorino Romano DOP y pimienta negra molida (sin nata).",
            price: 17.00,
            image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten", "lactosa", "huevo"],
            isSpecialty: false,
            isAvailable: true
          },
          {
            id: "d2000000-0000-0000-0000-000000000006",
            name: "Ravioloni Rellenos de Ricotta de Búfala y Espinacas con Salvia",
            description: "Salsa suave de mantequilla avellanada, salvia fresca y lluvia de nueces de Sorrento tostadas.",
            price: 18.50,
            image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten", "lactosa", "huevo", "frutos-secos"],
            isSpecialty: false,
            isAvailable: true,
            isVegetarian: true
          }
        ]
      },
      {
        id: "c2000000-0000-0000-0000-000000000003",
        name: "Pizzas Napolitanas (Horno de Leña)",
        description: "Harina tipo 00, fermentación 72 horas y cocción a 480°C",
        dishes: [
          {
            id: "d2000000-0000-0000-0000-000000000007",
            name: "Pizza Margherita Verace DOP",
            description: "Tomate San Marzano ecológico, mozzarella Fior di Latte fresca, albahaca recién cortada y AOVE.",
            price: 14.50,
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten", "lactosa"],
            isSpecialty: false,
            isAvailable: true,
            isVegetarian: true
          },
          {
            id: "d2000000-0000-0000-0000-000000000008",
            name: "Pizza Tartufata & Prosciutto di Parma 24 Meses",
            description: "Base de mozzarella di bufala, crema de trufa negra, boletus edulis y jamón de Parma añadido tras el horno.",
            price: 19.00,
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten", "lactosa"],
            isSpecialty: true,
            isAvailable: true
          },
          {
            id: "d2000000-0000-0000-0000-000000000009",
            name: "Pizza Diavola & Nduja Calabresa Artesanal",
            description: "Tomate San Marzano, mozzarella, spianata picante di Calabria, toque de nduja y gotas de miel de azahar.",
            price: 16.50,
            image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten", "lactosa"],
            isSpecialty: false,
            isAvailable: true
          }
        ]
      },
      {
        id: "c2000000-0000-0000-0000-000000000004",
        name: "Dolci Tradizionali",
        description: "Postres clásicos de la tradición italiana",
        dishes: [
          {
            id: "d2000000-0000-0000-0000-000000000010",
            name: "Tiramisú Clásico Casero de Treviso",
            description: "Bizcocho Savoiardi bañado en café Illy espresso con crema sedosa de mascarpone y cacao amargo Valrhona.",
            price: 7.00,
            image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten", "lactosa", "huevo"],
            isSpecialty: true,
            isAvailable: true,
            isVegetarian: true
          },
          {
            id: "d2000000-0000-0000-0000-000000000011",
            name: "Cannoli Siciliani Rellenos de Ricotta Dulce y Pistacho de Bronte",
            description: "Masa crujiente frita al momento, crema de ricotta de oveja con naranja confitada y pepitas de chocolate.",
            price: 7.50,
            image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten", "lactosa", "frutos-secos"],
            isSpecialty: false,
            isAvailable: true,
            isVegetarian: true
          }
        ]
      }
    ]
  },
  {
    id: "a1000000-0000-0000-0000-000000000003",
    slug: "el-olivo-bistro",
    name: "Bistró El Olivo & Arroces",
    tagline: "Cocina mediterránea de autor, producto de mercado y arroces en llanda",
    description: "Espacio gastronómico íntimo y acogedor en la Plaza de la Constitución. Arroces melosos en llanda, mariscos y pescados salvajes del Cantábrico y más de 80 referencias de vino seleccionadas por sumiller.",
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
    googleMapsUrl: "https://maps.google.com/?q=Bistro+El+Olivo+Torrelodones",
    phone: "+34 918 59 78 90",
    whatsapp: "+34 644 112 233",
    bookingType: "online",
    bookingUrl: "https://gastrotorre.es/reservas/el-olivo",
    dailyMenu: {
      isActive: true,
      price: 18.00,
      firstCourses: [
        "Crema de boletus con huevo poché y crujiente de ibérico",
        "Tartar de tomate de la huerta con burrata y aguacate",
        "Arroz meloso de verduras y calamar de potera"
      ],
      secondCourses: [
        "Lomo de corvina a la plancha sobre salteado de bimi y tirabeques",
        "Carrillera de ternera guisada al vino tinto de Madrid",
        "Tataki de atún rojo con sésamo tostado y wakame"
      ],
      desserts: [
        "Milhojas crujiente de crema diplomática",
        "Sorbete de mandarina al cava",
        "Café o infusión natural"
      ],
      includes: "Incluye primer plato, segundo plato, pan artesano, copa de vino D.O. Madrid o cerveza y postre.",
      scheduleNotes: "Disponible de Martes a Viernes de 13:30 a 16:30."
    },
    schedule: {
      days: "Martes a Domingo",
      lunch: "13:30 - 16:30",
      dinner: "20:30 - 23:30",
      isTemporarilyClosed: false
    },
    features: ["Terraza en plaza peatonal", "Arroces en llanda", "Sommelier en sala", "Pescados Salvajes", "Opciones Celíacos"],
    featured: true,
    stats: {
      monthlyViews: 610,
      monthlyBookings: 45,
      weeklyGrowth: 22,
      topDishes: [
        { name: "Arroz Meloso de Bogavante", views: 280 },
        { name: "Tartar de Atún Rojo Balfegó", views: 240 },
        { name: "Milhojas Crujiente", views: 185 },
      ],
      scansByDay: [
        { day: "Lun", count: 10 },
        { day: "Mar", count: 38 },
        { day: "Mié", count: 55 },
        { day: "Jue", count: 75 },
        { day: "Vie", count: 135 },
        { day: "Sáb", count: 165 },
        { day: "Dom", count: 132 },
      ],
    },
    menu: [
      {
        id: "c3000000-0000-0000-0000-000000000001",
        name: "Entrantes de Mercado & Mar",
        description: "Platos frescos elaborados con producto de lonja y huerta",
        dishes: [
          {
            id: "d3000000-0000-0000-0000-000000000001",
            name: "Tartar de Atún Rojo Balfegó sobre Brioche de Mantequilla y Yema Curada",
            description: "Aliñado con sésamo tostado, soja añeja, cebollino fresco y emulsión de wasabi suave.",
            price: 22.50,
            image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=600&auto=format&fit=crop",
            allergens: ["pescado", "soja", "gluten", "huevo"],
            isSpecialty: true,
            isAvailable: true
          },
          {
            id: "d3000000-0000-0000-0000-000000000002",
            name: "Zamburiñas Gallegas a la Plancha con Emulsión de Albariño y Lima (8 uds)",
            description: "Doradas a fuego vivo con crujiente de jamón ibérico y flor de sal.",
            price: 19.00,
            image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=600&auto=format&fit=crop",
            allergens: ["moluscos"],
            isSpecialty: false,
            isAvailable: true,
            isGlutenFree: true
          },
          {
            id: "d3000000-0000-0000-0000-000000000003",
            name: "Alcachofas Confitadas a la Plancha con Láminas de Foie Fresco",
            description: "Corazones tiernos de alcachofa de Tudela con reducción de Pedro Ximénez y escamas de sal.",
            price: 18.50,
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop",
            allergens: ["lactosa"],
            isSpecialty: false,
            isAvailable: true,
            isGlutenFree: true
          }
        ]
      },
      {
        id: "c3000000-0000-0000-0000-000000000002",
        name: "Arroces en Llanda & Paellas (Mín. 2 pers)",
        description: "Elaborados con arroz bomba valenciano y fondos marinos de 8 horas",
        dishes: [
          {
            id: "d3000000-0000-0000-0000-000000000004",
            name: "Arroz del Senyoret con Sepia, Calamar de Playa, Gambón y Rape (ración)",
            description: "Todo el marisco pelado listo para comer con capa fina socarrat y alioli casero de azafrán.",
            price: 23.50,
            image: "https://images.unsplash.com/photo-1536392706976-e486e2ba97af?q=80&w=600&auto=format&fit=crop",
            allergens: ["pescado", "crustaceos", "moluscos", "huevo"],
            isSpecialty: true,
            isAvailable: true,
            isGlutenFree: true
          },
          {
            id: "d3000000-0000-0000-0000-000000000005",
            name: "Arroz Meloso de Bogavante del Cantábrico con Fondo Marino Reducido (ración)",
            description: "Caldo intenso cocinado 8h a fuego lento con medio bogavante por comensal.",
            price: 27.00,
            image: "https://images.unsplash.com/photo-1536392706976-e486e2ba97af?q=80&w=600&auto=format&fit=crop",
            allergens: ["crustaceos", "pescado"],
            isSpecialty: true,
            isAvailable: true,
            isGlutenFree: true
          },
          {
            id: "d3000000-0000-0000-0000-000000000006",
            name: "Arroz de Presa Ibérica de Bellota, Boletus Edulis y Foie a la Brasa (ración)",
            description: "Fondo de carne noble con setas de la sierra y lascas de foie caramelizado.",
            price: 24.00,
            image: "https://images.unsplash.com/photo-1536392706976-e486e2ba97af?q=80&w=600&auto=format&fit=crop",
            allergens: ["lactosa"],
            isSpecialty: false,
            isAvailable: true,
            isGlutenFree: true
          }
        ]
      },
      {
        id: "c3000000-0000-0000-0000-000000000003",
        name: "Pescados Salvajes & Carnes Nobles",
        description: "Elaboraciones cuidadas con guarniciones de temporada",
        dishes: [
          {
            id: "d3000000-0000-0000-0000-000000000007",
            name: "Rodaballo Salvaje a la Plancha con Refrito de Ajos Tiernos y Verduras Confitadas",
            description: "Pescado blanco noble con bilbaína suave y patatas panadera al horno.",
            price: 26.50,
            image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600&auto=format&fit=crop",
            allergens: ["pescado"],
            isSpecialty: true,
            isAvailable: true,
            isGlutenFree: true
          },
          {
            id: "d3000000-0000-0000-0000-000000000008",
            name: "Presa Ibérica de Bellota con Chutney de Manzana Asada y Ciruelas",
            description: "Marcada en brasa de encina con guarnición de puré fino de boniato.",
            price: 23.50,
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop",
            allergens: [],
            isSpecialty: false,
            isAvailable: true,
            isGlutenFree: true
          }
        ]
      },
      {
        id: "c3000000-0000-0000-0000-000000000004",
        name: "Repostería Creativa",
        description: "Postres caseros de autor",
        dishes: [
          {
            id: "d3000000-0000-0000-0000-000000000009",
            name: "Milhojas Crujiente de Crema Diplomática con Frambuesas Frescas",
            description: "Hojaldre de mantequilla caramelizado hecho a diario en nuestro obrador con crema suave de vainilla natural.",
            price: 7.50,
            image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten", "lactosa", "huevo"],
            isSpecialty: true,
            isAvailable: true,
            isVegetarian: true
          },
          {
            id: "d3000000-0000-0000-0000-000000000010",
            name: "Tarta Fina de Manzana Reineta Horneada con Helado de Vainilla Bourbon",
            description: "Masa sable fina y crujiente con compota casera y láminas de manzana doradas.",
            price: 8.00,
            image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600&auto=format&fit=crop",
            allergens: ["gluten", "lactosa", "huevo"],
            isSpecialty: false,
            isAvailable: true,
            isVegetarian: true
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
    googleMapsUrl: "https://maps.google.com/?q=Torre+Smash+Torrelodones",
    phone: "+34 918 59 99 11",
    whatsapp: "+34 600 777 888",
    bookingType: "walkin",
    schedule: {
      days: "Lunes a Domingo",
      lunch: "13:00 - 16:30",
      dinner: "19:30 - 00:00",
      isTemporarilyClosed: false
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
    googleMapsUrl: "https://maps.google.com/?q=La+Huerta+Torrelodones",
    phone: "+34 918 59 33 22",
    whatsapp: "+34 611 223 344",
    bookingType: "phone",
    schedule: {
      days: "Martes a Domingo",
      lunch: "08:30 - 17:00",
      isTemporarilyClosed: false
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
