// @context/ApartmentsContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

// ---------- Types ----------
export type Apartment = {
  ApartmentID: number;
  Creator_ID: number;
  Creator_FullName: string;
  Creator_ProfilePicture: string;
  Images: string[];
  ApartmentType: 0 | 1 | 2; // 0=rental, 1=shared, 2=sublet
  Location: string; // stringified JSON { address: string }
  Price: number;
  Description: string;
  AmountOfRooms: number;
  AllowPet: boolean;
  AllowSmoking: boolean;
  ParkingSpace: number;
  EntryDate: string;
  ExitDate: string | null;
  Rental_ContractLength: number | null;
  Rental_ExtensionPossible: boolean;
  Shared_NumberOfRoommates: number | null;
  Roommates: string; // pipe-separated string
  Sublet_CanCancelWithoutPenalty: boolean;
  Sublet_IsWholeProperty: boolean;
  LabelsJson: string; // stringified array of { value: string }
  NumOfLikes: number;
  IsLikedByUser: boolean;
};

export type Filters = {
  minPrice?: number;
  maxPrice?: number;
  entryDate?: string; // ISO
  apartmentType?: number; // 0=rent,1=roommates,2=sublet
  genders?: string[];
  features?: string[]; // ["balcony","elevator"]
  queryText?: string; // free-text
};

export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

// ---------- Store shape ----------
type Entities = Record<string, Apartment>; // key = String(ApartmentID)

type HomeFeedState = {
  ids: string[]; // String(ApartmentID) in order
  cursor: string | null; // pagination cursor (index in mock)
  hasMore: boolean;
  loading: boolean;
  error?: string;
};

type SearchState = {
  lastFilters: Filters | null;
  page: number;
  pageSize: number;
  total: number;
  ids: string[]; // all current search result ids
  loading: boolean;
  error?: string;
};

type MapState = {
  bounds: MapBounds | null;
  filters: Filters;
  ids: string[]; // up to 50 best ids
  loading: boolean;
  error?: string;
};

// ---------- Context ----------
type ApartmentsContextValue = {
  entities: Entities;

  home: HomeFeedState;
  loadHomeFirstPage: () => Promise<void>;
  loadHomeNextPage: () => Promise<void>;

  search: SearchState;
  runSearch: (filters: Filters, reset?: boolean) => Promise<void>;
  loadNextSearchPage: () => Promise<void>;
  getSearchSlice: (offset: number, limit: number) => Apartment[];

  map: MapState;
  setMapBounds: (bounds: MapBounds) => void;
  setMapFilters: (filters: Filters) => void;
  refreshMap: () => Promise<void>;

  getApartmentsByIds: (ids: string[]) => Apartment[];
  upsertApartments: (items: Apartment[]) => void;
  clearAll: () => void;

  initializeOnLogin: () => Promise<void>;
};

const ApartmentsContext = createContext<ApartmentsContextValue | null>(null);

// ---------- Provider ----------
export const ApartmentsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [entities, setEntities] = useState<Entities>({});

  const [home, setHome] = useState<HomeFeedState>({
    ids: [],
    cursor: null,
    hasMore: true,
    loading: false,
  });

  const [search, setSearch] = useState<SearchState>({
    lastFilters: null,
    page: 1,
    pageSize: 20,
    total: 0,
    ids: [],
    loading: false,
  });

  const [map, setMap] = useState<MapState>({
    bounds: null,
    filters: {},
    ids: [],
    loading: false,
  });

  // --- Helpers ---
  const upsertApartments = useCallback((items: Apartment[]) => {
    if (!items || items.length === 0) return;
    setEntities((prev) => {
      const next = { ...prev };
      for (const a of items) {
        const key = String(a.ApartmentID);
        next[key] = { ...(prev[key] || ({} as Apartment)), ...a };
      }
      return next;
    });
  }, []);

  const getApartmentsByIds = useCallback(
    (ids: string[]) =>
      ids.map((id) => entities[id]).filter(Boolean) as Apartment[],
    [entities]
  );

  const clearAll = useCallback(() => {
    setEntities({});
    setHome({ ids: [], cursor: null, hasMore: true, loading: false });
    setSearch({
      lastFilters: null,
      page: 1,
      pageSize: 20,
      total: 0,
      ids: [],
      loading: false,
    });
    setMap({ bounds: null, filters: {}, ids: [], loading: false });
  }, []);

  // --- Mocked data calls (DEV) ---
  // (1) Data
  const allApartments: Apartment[] = [
    {
      ApartmentID: 101,
      Creator_ID: 1,
      Creator_FullName: "Daniel Cohen",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=12",
      Images: [
        "https://picsum.photos/800/400?random=1",
        "https://picsum.photos/800/400?random=2",
      ],
      ApartmentType: 1,
      Location: '{"address": "Dizengoff 100, Tel Aviv"}',
      Price: 5200,
      Description:
        "Modern apartment in the city center, fully furnished with balcony and elevator.",
      AmountOfRooms: 3,
      AllowPet: true,
      AllowSmoking: false,
      ParkingSpace: 1,
      EntryDate: "2025-11-15T00:00:00",
      ExitDate: null,
      Rental_ContractLength: 12,
      Rental_ExtensionPossible: true,
      Shared_NumberOfRoommates: 2,
      Roommates:
        "Name:Noa|Gender:Female|Job:Designer|BirthDate:1998-09-01|Image:https://i.pravatar.cc/100?img=45||Name:Omer|Gender:Male|Job:Engineer|BirthDate:1997-05-10|Image:https://i.pravatar.cc/100?img=32",
      Sublet_CanCancelWithoutPenalty: false,
      Sublet_IsWholeProperty: false,
      LabelsJson:
        '[{"value":"balcony"},{"value":"fridge"},{"value":"air conditioner"},{"value":"elevator"}]',
      NumOfLikes: 5,
      IsLikedByUser: false,
    },
    {
      ApartmentID: 102,
      Creator_ID: 2,
      Creator_FullName: "Yael Levy",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=30",
      Images: [
        "https://picsum.photos/800/400?random=3",
        "https://picsum.photos/800/400?random=4",
      ],
      ApartmentType: 0,
      Location: '{"address": "Ben Gurion Blvd 15, Herzlya"}',
      Price: 7500,
      Description:
        "Spacious 4-room apartment near the beach, with private parking and garden.",
      AmountOfRooms: 4,
      AllowPet: false,
      AllowSmoking: true,
      ParkingSpace: 2,
      EntryDate: "2025-12-01T00:00:00",
      ExitDate: null,
      Rental_ContractLength: 24,
      Rental_ExtensionPossible: false,
      Shared_NumberOfRoommates: null,
      Roommates: "",
      Sublet_CanCancelWithoutPenalty: false,
      Sublet_IsWholeProperty: false,
      LabelsJson:
        '[{"value":"garden"},{"value":"parking"},{"value":"oven"},{"value":"dishwasher"}]',
      NumOfLikes: 12,
      IsLikedByUser: true,
    },
    {
      ApartmentID: 103,
      Creator_ID: 3,
      Creator_FullName: "Nadav Ben Ari",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=58",
      Images: [
        "https://picsum.photos/800/400?random=5",
        "https://picsum.photos/800/400?random=6",
      ],
      ApartmentType: 2,
      Location: '{"address": "HaNeviim 22, Jerusalem"}',
      Price: 4200,
      Description:
        "Short-term sublet for 3 months in a cozy 2-room apartment near city center.",
      AmountOfRooms: 2,
      AllowPet: false,
      AllowSmoking: false,
      ParkingSpace: 0,
      EntryDate: "2025-11-10T00:00:00",
      ExitDate: "2026-02-10T00:00:00",
      Rental_ContractLength: null,
      Rental_ExtensionPossible: false,
      Shared_NumberOfRoommates: null,
      Roommates: "",
      Sublet_CanCancelWithoutPenalty: true,
      Sublet_IsWholeProperty: true,
      LabelsJson:
        '[{"value":"fridge"},{"value":"microwave"},{"value":"oven"},{"value":"tv"}]',
      NumOfLikes: 3,
      IsLikedByUser: false,
    },
    {
      ApartmentID: 104,
      Creator_ID: 4,
      Creator_FullName: "Lior Katz",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=70",
      Images: [
        "https://picsum.photos/800/400?random=7",
        "https://picsum.photos/800/400?random=8",
      ],
      ApartmentType: 1,
      Location: '{"address": "Hertzl 12, Ramat Gan"}',
      Price: 4800,
      Description:
        "Shared apartment close to university, suitable for students. Includes WiFi and AC.",
      AmountOfRooms: 3,
      AllowPet: true,
      AllowSmoking: true,
      ParkingSpace: 0,
      EntryDate: "2025-11-20T00:00:00",
      ExitDate: null,
      Rental_ContractLength: 12,
      Rental_ExtensionPossible: true,
      Shared_NumberOfRoommates: 1,
      Roommates:
        "Name:Eden|Gender:Female|Job:Student|BirthDate:2000-03-15|Image:https://i.pravatar.cc/100?img=47",
      Sublet_CanCancelWithoutPenalty: false,
      Sublet_IsWholeProperty: false,
      LabelsJson:
        '[{"value":"balcony"},{"value":"air conditioner"},{"value":"washing machine"},{"value":"lamp"}]',
      NumOfLikes: 8,
      IsLikedByUser: false,
    },

    // === דירות נוספות (105–120) ===

    {
      ApartmentID: 105,
      Creator_ID: 5,
      Creator_FullName: "Amit Shalev",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=15",
      Images: [
        "https://picsum.photos/800/400?random=9",
        "https://picsum.photos/800/400?random=10",
      ],
      ApartmentType: 0,
      Location: '{"address": "Allenby 50, Tel Aviv"}',
      Price: 6900,
      Description: "Renovated 3-room rental near Rothschild, bright and quiet.",
      AmountOfRooms: 3,
      AllowPet: false,
      AllowSmoking: false,
      ParkingSpace: 0,
      EntryDate: "2025-11-25T00:00:00",
      ExitDate: null,
      Rental_ContractLength: 18,
      Rental_ExtensionPossible: true,
      Shared_NumberOfRoommates: null,
      Roommates: "",
      Sublet_CanCancelWithoutPenalty: false,
      Sublet_IsWholeProperty: false,
      LabelsJson: '[{"value":"elevator"},{"value":"ac"},{"value":"balcony"}]',
      NumOfLikes: 6,
      IsLikedByUser: false,
    },
    {
      ApartmentID: 106,
      Creator_ID: 6,
      Creator_FullName: "Roni Bar",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=22",
      Images: [
        "https://picsum.photos/800/400?random=11",
        "https://picsum.photos/800/400?random=12",
      ],
      ApartmentType: 1,
      Location: '{"address": "Weizmann 7, Ra\'anana"}',
      Price: 3800,
      Description: "Shared 4-room flat, large living room, friendly roommates.",
      AmountOfRooms: 4,
      AllowPet: true,
      AllowSmoking: false,
      ParkingSpace: 1,
      EntryDate: "2025-11-18T00:00:00",
      ExitDate: null,
      Rental_ContractLength: 12,
      Rental_ExtensionPossible: true,
      Shared_NumberOfRoommates: 3,
      Roommates:
        "Name:Gal|Gender:Male|Job:QA|BirthDate:1996-11-10|Image:https://i.pravatar.cc/100?img=15||Name:Lihi|Gender:Female|Job:Teacher|BirthDate:1995-04-22|Image:https://i.pravatar.cc/100?img=25||Name:Ron|Gender:Male|Job:Student|BirthDate:2002-08-01|Image:https://i.pravatar.cc/100?img=35",
      Sublet_CanCancelWithoutPenalty: false,
      Sublet_IsWholeProperty: false,
      LabelsJson:
        '[{"value":"parking"},{"value":"balcony"},{"value":"wifi"},{"value":"tv"}]',
      NumOfLikes: 10,
      IsLikedByUser: false,
    },
    {
      ApartmentID: 107,
      Creator_ID: 7,
      Creator_FullName: "Maayan Azulay",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=27",
      Images: [
        "https://picsum.photos/800/400?random=13",
        "https://picsum.photos/800/400?random=14",
      ],
      ApartmentType: 2,
      Location: '{"address": "Jaffa 20, Haifa"}',
      Price: 3500,
      Description:
        "Sublet in the German Colony, sea breeze, great for remote workers.",
      AmountOfRooms: 2,
      AllowPet: true,
      AllowSmoking: false,
      ParkingSpace: 0,
      EntryDate: "2025-11-12T00:00:00",
      ExitDate: "2026-01-12T00:00:00",
      Rental_ContractLength: null,
      Rental_ExtensionPossible: false,
      Shared_NumberOfRoommates: null,
      Roommates: "",
      Sublet_CanCancelWithoutPenalty: true,
      Sublet_IsWholeProperty: true,
      LabelsJson: '[{"value":"fridge"},{"value":"oven"},{"value":"wifi"}]',
      NumOfLikes: 7,
      IsLikedByUser: false,
    },
    {
      ApartmentID: 108,
      Creator_ID: 8,
      Creator_FullName: "Shir Mor",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=38",
      Images: [
        "https://picsum.photos/800/400?random=15",
        "https://picsum.photos/800/400?random=16",
      ],
      ApartmentType: 0,
      Location: '{"address": "King George 80, Tel Aviv"}',
      Price: 8400,
      Description:
        "Penthouse, skyline views, huge terrace, elevator & parking.",
      AmountOfRooms: 4,
      AllowPet: false,
      AllowSmoking: false,
      ParkingSpace: 1,
      EntryDate: "2025-12-05T00:00:00",
      ExitDate: null,
      Rental_ContractLength: 24,
      Rental_ExtensionPossible: true,
      Shared_NumberOfRoommates: null,
      Roommates: "",
      Sublet_CanCancelWithoutPenalty: false,
      Sublet_IsWholeProperty: false,
      LabelsJson:
        '[{"value":"terrace"},{"value":"elevator"},{"value":"parking"},{"value":"dishwasher"}]',
      NumOfLikes: 20,
      IsLikedByUser: true,
    },
    {
      ApartmentID: 109,
      Creator_ID: 9,
      Creator_FullName: "Oded Tal",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=41",
      Images: [
        "https://picsum.photos/800/400?random=17",
        "https://picsum.photos/800/400?random=18",
      ],
      ApartmentType: 1,
      Location: '{"address": "Bar Ilan 5, Ramat Gan"}',
      Price: 4100,
      Description:
        "Student-friendly shared flat, bills included, near campus and transit.",
      AmountOfRooms: 3,
      AllowPet: false,
      AllowSmoking: true,
      ParkingSpace: 0,
      EntryDate: "2025-11-22T00:00:00",
      ExitDate: null,
      Rental_ContractLength: 12,
      Rental_ExtensionPossible: true,
      Shared_NumberOfRoommates: 2,
      Roommates:
        "Name:Tom|Gender:Male|Job:Student|BirthDate:2001-02-02|Image:https://i.pravatar.cc/100?img=52||Name:Noya|Gender:Female|Job:Student|BirthDate:2002-07-09|Image:https://i.pravatar.cc/100?img=53",
      LabelsJson: '[{"value":"wifi"},{"value":"balcony"},{"value":"ac"}]',
      Sublet_CanCancelWithoutPenalty: false,
      Sublet_IsWholeProperty: false,
      NumOfLikes: 9,
      IsLikedByUser: false,
    },

    // 110–120 נוספות

    {
      ApartmentID: 110,
      Creator_ID: 10,
      Creator_FullName: "Tom Harel",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=65",
      Images: [
        "https://picsum.photos/800/400?random=19",
        "https://picsum.photos/800/400?random=20",
      ],
      ApartmentType: 0,
      Location: '{"address": "Ibn Gvirol 120, Tel Aviv"}',
      Price: 7600,
      Description: "Bright rental apartment, 5 min walk from Sarona Market.",
      AmountOfRooms: 3,
      AllowPet: false,
      AllowSmoking: false,
      ParkingSpace: 1,
      EntryDate: "2025-12-10T00:00:00",
      ExitDate: null,
      Rental_ContractLength: 12,
      Rental_ExtensionPossible: true,
      Shared_NumberOfRoommates: null,
      Roommates: "",
      Sublet_CanCancelWithoutPenalty: false,
      Sublet_IsWholeProperty: true,
      LabelsJson:
        '[{"value":"balcony"},{"value":"wifi"},{"value":"microwave"}]',
      NumOfLikes: 13,
      IsLikedByUser: false,
    },
    {
      ApartmentID: 111,
      Creator_ID: 11,
      Creator_FullName: "Dana Sharabi",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=62",
      Images: [
        "https://picsum.photos/800/400?random=21",
        "https://picsum.photos/800/400?random=22",
      ],
      ApartmentType: 1,
      Location: '{"address": "HaArbaa 16, Tel Aviv"}',
      Price: 3900,
      Description:
        "Room in shared apartment in TLV, near Azrieli & Hashalom station.",
      AmountOfRooms: 4,
      AllowPet: true,
      AllowSmoking: false,
      ParkingSpace: 0,
      EntryDate: "2025-12-15T00:00:00",
      ExitDate: null,
      Rental_ContractLength: 12,
      Rental_ExtensionPossible: true,
      Shared_NumberOfRoommates: 2,
      Roommates:
        "Name:Yarden|Gender:Female|Job:Designer|BirthDate:1999-05-11|Image:https://i.pravatar.cc/100?img=17||Name:Alon|Gender:Male|Job:Developer|BirthDate:1996-07-03|Image:https://i.pravatar.cc/100?img=18",
      Sublet_CanCancelWithoutPenalty: false,
      Sublet_IsWholeProperty: false,
      LabelsJson:
        '[{"value":"wifi"},{"value":"tv"},{"value":"air conditioner"}]',
      NumOfLikes: 5,
      IsLikedByUser: false,
    },
    {
      ApartmentID: 112,
      Creator_ID: 12,
      Creator_FullName: "Matan Mor",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=23",
      Images: [
        "https://picsum.photos/800/400?random=23",
        "https://picsum.photos/800/400?random=24",
      ],
      ApartmentType: 0,
      Location: '{"address": "Norther Bashan 8, Eilat"}',
      Price: 5400,
      Description: "Full sea view apartment, 2 min from promenade.",
      AmountOfRooms: 3,
      AllowPet: false,
      AllowSmoking: true,
      ParkingSpace: 1,
      EntryDate: "2025-10-01T00:00:00",
      ExitDate: null,
      Rental_ContractLength: 6,
      Rental_ExtensionPossible: true,
      Shared_NumberOfRoommates: null,
      Roommates: "",
      Sublet_CanCancelWithoutPenalty: false,
      Sublet_IsWholeProperty: false,
      LabelsJson: '[{"value":"balcony"},{"value":"parking"}]',
      NumOfLikes: 18,
      IsLikedByUser: false,
    },
    {
      ApartmentID: 113,
      Creator_ID: 13,
      Creator_FullName: "Noam David",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=13",
      Images: [
        "https://picsum.photos/800/400?random=25",
        "https://picsum.photos/800/400?random=26",
      ],
      ApartmentType: 1,
      Location: '{"address": "HaShalom 6, Givatayim"}',
      Price: 4300,
      Description: "Room in shared central apartment, smart-home features.",
      AmountOfRooms: 4,
      AllowPet: true,
      AllowSmoking: false,
      ParkingSpace: 1,
      EntryDate: "2025-10-10T00:00:00",
      ExitDate: null,
      Rental_ContractLength: 12,
      Rental_ExtensionPossible: true,
      Shared_NumberOfRoommates: 2,
      Roommates:
        "Name:Lior|Gender:Female|Job:Marketing|BirthDate:1998-01-01|Image:https://i.pravatar.cc/100?img=19||Name:Or|Gender:Male|Job:Developer|BirthDate:1997-08-10|Image:https://i.pravatar.cc/100?img=12",
      Sublet_CanCancelWithoutPenalty: false,
      Sublet_IsWholeProperty: false,
      LabelsJson: '[{"value":"wifi"},{"value":"tv"},{"value":"parking"}]',
      NumOfLikes: 11,
      IsLikedByUser: true,
    },
    {
      ApartmentID: 114,
      Creator_ID: 14,
      Creator_FullName: "Yuval Peretz",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=14",
      Images: [
        "https://picsum.photos/800/400?random=27",
        "https://picsum.photos/800/400?random=28",
      ],
      ApartmentType: 2,
      Location: '{"address": "Derech Hebron 120, Jerusalem"}',
      Price: 3000,
      Description: "Short sublet — close to old city.",
      AmountOfRooms: 2,
      AllowPet: true,
      AllowSmoking: false,
      ParkingSpace: 0,
      EntryDate: "2025-09-01T00:00:00",
      ExitDate: "2025-11-01T00:00:00",
      Rental_ContractLength: null,
      Rental_ExtensionPossible: false,
      Shared_NumberOfRoommates: null,
      Roommates: "",
      Sublet_CanCancelWithoutPenalty: true,
      Sublet_IsWholeProperty: true,
      LabelsJson: '[{"value":"wifi"},{"value":"microwave"}]',
      NumOfLikes: 4,
      IsLikedByUser: false,
    },
    {
      ApartmentID: 115,
      Creator_ID: 15,
      Creator_FullName: "Shaked Azulay",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=50",
      Images: [
        "https://picsum.photos/800/400?random=29",
        "https://picsum.photos/800/400?random=30",
      ],
      ApartmentType: 0,
      Location: '{"address": "Hameyasdim 6, Rishon Lezion"}',
      Price: 6200,
      Description: "Family rental, quiet neighborhood, close to mall.",
      AmountOfRooms: 3,
      AllowPet: true,
      AllowSmoking: false,
      ParkingSpace: 1,
      EntryDate: "2025-12-12T00:00:00",
      ExitDate: null,
      Rental_ContractLength: 12,
      Rental_ExtensionPossible: true,
      Shared_NumberOfRoommates: null,
      Roommates: "",
      Sublet_CanCancelWithoutPenalty: false,
      Sublet_IsWholeProperty: false,
      LabelsJson: '[{"value":"parking"},{"value":"ac"},{"value":"balcony"}]',
      NumOfLikes: 5,
      IsLikedByUser: false,
    },
    {
      ApartmentID: 116,
      Creator_ID: 16,
      Creator_FullName: "Eyal Sagi",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=46",
      Images: [
        "https://picsum.photos/800/400?random=31",
        "https://picsum.photos/800/400?random=32",
      ],
      ApartmentType: 1,
      Location: '{"address": "Rothschild 80, Tel Aviv"}',
      Price: 4900,
      Description: "Shared apartment in Rothschild, gym in building.",
      AmountOfRooms: 4,
      AllowPet: false,
      AllowSmoking: false,
      ParkingSpace: 0,
      EntryDate: "2025-12-22T00:00:00",
      ExitDate: null,
      Rental_ContractLength: 12,
      Rental_ExtensionPossible: true,
      Shared_NumberOfRoommates: 2,
      Roommates:
        "Name:Chen|Gender:Female|Job:Designer|BirthDate:1998-10-03|Image:https://i.pravatar.cc/100?img=9||Name:Adam|Gender:Male|Job:Product Manager|BirthDate:1995-03-02|Image:https://i.pravatar.cc/100?img=16",
      Sublet_CanCancelWithoutPenalty: false,
      Sublet_IsWholeProperty: false,
      LabelsJson: '[{"value":"tv"},{"value":"wifi"},{"value":"ac"}]',
      NumOfLikes: 14,
      IsLikedByUser: true,
    },
    {
      ApartmentID: 117,
      Creator_ID: 17,
      Creator_FullName: "Adi Iluz",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=18",
      Images: [
        "https://picsum.photos/800/400?random=33",
        "https://picsum.photos/800/400?random=34",
      ],
      ApartmentType: 2,
      Location: '{"address": "HaShikma 3, Netanya"}',
      Price: 2800,
      Description: "Short sublet, beach view, perfect for vacations.",
      AmountOfRooms: 2,
      AllowPet: true,
      AllowSmoking: false,
      ParkingSpace: 0,
      EntryDate: "2025-08-01T00:00:00",
      ExitDate: "2025-10-01T00:00:00",
      Rental_ContractLength: null,
      Rental_ExtensionPossible: false,
      Shared_NumberOfRoommates: null,
      Roommates: "",
      Sublet_CanCancelWithoutPenalty: true,
      Sublet_IsWholeProperty: true,
      LabelsJson: '[{"value":"ac"},{"value":"wifi"}]',
      NumOfLikes: 3,
      IsLikedByUser: false,
    },
    {
      ApartmentID: 118,
      Creator_ID: 18,
      Creator_FullName: "Gil Ben Nun",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=42",
      Images: [
        "https://picsum.photos/800/400?random=35",
        "https://picsum.photos/800/400?random=36",
      ],
      ApartmentType: 1,
      Location: '{"address": "Haatzmaut 9, Beer Sheva"}',
      Price: 3500,
      Description: "Shared student apartment next to Ben Gurion University.",
      AmountOfRooms: 3,
      AllowPet: false,
      AllowSmoking: true,
      ParkingSpace: 0,
      EntryDate: "2025-09-15T00:00:00",
      ExitDate: null,
      Rental_ContractLength: 12,
      Rental_ExtensionPossible: false,
      Shared_NumberOfRoommates: 2,
      Roommates:
        "Name:Shir|Gender:Female|Job:Student|BirthDate:2001-05-01|Image:https://i.pravatar.cc/100?img=59||Name:Omer|Gender:Male|Job:Student|BirthDate:2000-10-10|Image:https://i.pravatar.cc/100?img=61",
      Sublet_CanCancelWithoutPenalty: false,
      Sublet_IsWholeProperty: false,
      LabelsJson: '[{"value":"wifi"},{"value":"ac"}]',
      NumOfLikes: 6,
      IsLikedByUser: false,
    },
    {
      ApartmentID: 119,
      Creator_ID: 19,
      Creator_FullName: "Tal Ravid",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=49",
      Images: [
        "https://picsum.photos/800/400?random=37",
        "https://picsum.photos/800/400?random=38",
      ],
      ApartmentType: 0,
      Location: '{"address": "Emek Refaim 90, Jerusalem"}',
      Price: 5600,
      Description: "Quiet rental apartment, lots of natural light.",
      AmountOfRooms: 3,
      AllowPet: false,
      AllowSmoking: false,
      ParkingSpace: 1,
      EntryDate: "2025-10-05T00:00:00",
      ExitDate: null,
      Rental_ContractLength: 12,
      Rental_ExtensionPossible: true,
      Shared_NumberOfRoommates: null,
      Roommates: "",
      Sublet_CanCancelWithoutPenalty: false,
      Sublet_IsWholeProperty: false,
      LabelsJson: '[{"value":"parking"},{"value":"balcony"}]',
      NumOfLikes: 8,
      IsLikedByUser: false,
    },
    {
      ApartmentID: 120,
      Creator_ID: 20,
      Creator_FullName: "Eden Azulay",
      Creator_ProfilePicture: "https://i.pravatar.cc/150?img=63",
      Images: [
        "https://picsum.photos/800/400?random=39",
        "https://picsum.photos/800/400?random=40",
      ],
      ApartmentType: 2,
      Location: '{"address": "HaPalmach 30, Haifa"}',
      Price: 3200,
      Description: "Short sublet in Carmel Center, ocean view.",
      AmountOfRooms: 2,
      AllowPet: true,
      AllowSmoking: false,
      ParkingSpace: 0,
      EntryDate: "2025-07-01T00:00:00",
      ExitDate: "2025-09-01T00:00:00",
      Rental_ContractLength: null,
      Rental_ExtensionPossible: false,
      Shared_NumberOfRoommates: null,
      Roommates: "",
      Sublet_CanCancelWithoutPenalty: true,
      Sublet_IsWholeProperty: true,
      LabelsJson: '[{"value":"wifi"},{"value":"tv"}]',
      NumOfLikes: 9,
      IsLikedByUser: true,
    },
  ];

  // (2) Helpers (used by filters)
  const getAddressFromLocation = (locStr: string) => {
    try {
      const obj = JSON.parse(locStr || "{}");
      return obj.address || "";
    } catch {
      return "";
    }
  };

  const getLabelValues = (labelsJson: string) => {
    try {
      const arr = JSON.parse(labelsJson || "[]") as Array<{ value: string }>;
      return arr.map((x) => x.value.toLowerCase());
    } catch {
      return [];
    }
  };

  // (3) Mock "API"
  async function fetchHomeFeedPage(
    limit: number,
    cursor?: string | null
  ): Promise<{ ids: string[]; cursor: string | null }> {
    const sorted = [...allApartments].sort(
      (a, b) => b.NumOfLikes - a.NumOfLikes || a.ApartmentID - b.ApartmentID
    );
    const startIdx = cursor ? parseInt(cursor, 10) : 0;
    const slice = sorted.slice(startIdx, startIdx + limit);
    const nextIdx = startIdx + slice.length;
    // --- simulate network delay (random 800–1200ms) ---
    await new Promise((resolve) =>
      setTimeout(resolve, 3000 + Math.random() * 400)
    );

    return {
      ids: slice.map((a) => String(a.ApartmentID)),
      cursor: nextIdx < sorted.length ? String(nextIdx) : null,
    };
  }

  async function fetchApartmentsByIds(
    ids: string[]
  ): Promise<{ apartments: Apartment[] }> {
    const mapById = new Map(
      allApartments.map((a) => [String(a.ApartmentID), a])
    );
    const items = ids
      .map((id) => mapById.get(id))
      .filter(Boolean) as Apartment[];
    return { apartments: items };
    // אין מיפוי – עובדים ישירות עם Apartment המורחב
  }

  function applyFilters(list: Apartment[], filters: Filters): Apartment[] {
    const {
      minPrice,
      maxPrice,
      apartmentType,
      entryDate,
      genders,
      features,
      queryText,
    } = filters || {};
    const q = (queryText || "").trim().toLowerCase();
    const featureSet = new Set((features || []).map((f) => f.toLowerCase()));

    return list.filter((a) => {
      if (typeof minPrice === "number" && a.Price < minPrice) return false;
      if (typeof maxPrice === "number" && a.Price > maxPrice) return false;
      if (
        typeof apartmentType === "number" &&
        a.ApartmentType !== apartmentType
      )
        return false;

      if (entryDate) {
        const want = new Date(entryDate).getTime();
        const has = new Date(a.EntryDate).getTime();
        if (isFinite(want) && isFinite(has) && has < want) return false;
      }

      if (genders && genders.length > 0 && a.Roommates) {
        const lower = a.Roommates.toLowerCase();
        const ok = genders.some((g) =>
          lower.includes(`gender:${g.toLowerCase()}`)
        );
        if (!ok) return false;
      }

      if (featureSet.size > 0) {
        const labels = getLabelValues(a.LabelsJson);
        const hasAll = [...featureSet].every((f) => labels.includes(f));
        if (!hasAll) return false;
      }

      if (q) {
        const hay = `${a.Description} ${getAddressFromLocation(a.Location)} ${
          a.Creator_FullName
        }`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }

  async function searchApartmentIds(
    filters: Filters,
    page: number,
    pageSize: number
  ): Promise<{ ids: string[]; total: number }> {
    const filtered = applyFilters(allApartments, filters);
    const sorted = filtered.sort(
      (a, b) => b.NumOfLikes - a.NumOfLikes || b.Price - a.Price
    );
    const total = sorted.length;
    const start = Math.max((page - 1) * pageSize, 0);
    const slice = sorted.slice(start, start + pageSize);
    return { ids: slice.map((a) => String(a.ApartmentID)), total };
  }

  async function fetchMapApartmentIds(
    _bounds: MapBounds,
    filters: Filters,
    limit = 50
  ): Promise<{ ids: string[] }> {
    const filtered = applyFilters(allApartments, filters);
    const sorted = filtered.sort(
      (a, b) => b.NumOfLikes - a.NumOfLikes || b.Price - a.Price
    );
    const top = sorted.slice(0, Math.min(limit, sorted.length));
    return { ids: top.map((a) => String(a.ApartmentID)) };
  }

  // --- Home logic ---
  const loadHomeFirstPage = useCallback(async () => {
    if (home.loading) return;
    setHome((h) => ({ ...h, loading: true, error: undefined }));

    try {
      const resp = await fetchHomeFeedPage(10, null);
      if (resp.ids.length > 0) {
        const { apartments } = await fetchApartmentsByIds(resp.ids);
        upsertApartments(apartments);
      }
      setHome({
        ids: resp.ids,
        cursor: resp.cursor,
        hasMore: !!resp.cursor,
        loading: false,
      });
    } catch (e: any) {
      setHome((h) => ({
        ...h,
        loading: false,
        error: e?.message || "home_first_page_failed",
      }));
    }
  }, [home.loading, upsertApartments]);

  const loadHomeNextPage = useCallback(async () => {
    if (home.loading || !home.hasMore) return;
    setHome((h) => ({ ...h, loading: true, error: undefined }));
    try {
      const resp = await fetchHomeFeedPage(10, home.cursor);
      if (resp.ids.length > 0) {
        const { apartments } = await fetchApartmentsByIds(resp.ids);
        upsertApartments(apartments);
      }
      setHome((h) => ({
        ids: [...h.ids, ...resp.ids],
        cursor: resp.cursor,
        hasMore: !!resp.cursor,
        loading: false,
      }));
    } catch (e: any) {
      setHome((h) => ({
        ...h,
        loading: false,
        error: e?.message || "home_next_page_failed",
      }));
    }
  }, [home.cursor, home.hasMore, home.loading, upsertApartments]);

  // --- Search logic ---
  const searchLockRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(
    async (filters: Filters, reset = true) => {
      if (search.loading) return;

      if (searchLockRef.current) clearTimeout(searchLockRef.current);

      return new Promise<void>((resolve) => {
        searchLockRef.current = setTimeout(async () => {
          try {
            setSearch((s) => ({
              ...s,
              loading: true,
              error: undefined,
              ...(reset ? { page: 1, ids: [], total: 0 } : {}),
              lastFilters: filters,
            }));

            const page = reset ? 1 : search.page;
            const resp = await searchApartmentIds(
              filters,
              page,
              search.pageSize
            );

            const sliceIds = resp.ids.slice(0, search.pageSize);
            if (sliceIds.length > 0) {
              const { apartments } = await fetchApartmentsByIds(sliceIds);
              upsertApartments(apartments);
            }

            setSearch((s) => ({
              ...s,
              loading: false,
              total: resp.total,
              page,
              ids: reset ? resp.ids : [...s.ids, ...resp.ids],
            }));
          } catch (e: any) {
            setSearch((s) => ({
              ...s,
              loading: false,
              error: e?.message || "search_failed",
            }));
          }
          resolve();
        }, 200);
      });
    },
    [search.loading, search.page, search.pageSize, upsertApartments]
  );

  const loadNextSearchPage = useCallback(async () => {
    if (search.loading || !search.lastFilters) return;

    const nextPage = search.page + 1;
    setSearch((s) => ({ ...s, loading: true, error: undefined }));

    try {
      const resp = await searchApartmentIds(
        search.lastFilters,
        nextPage,
        search.pageSize
      );

      const sliceIds = resp.ids.slice(0, search.pageSize);
      if (sliceIds.length > 0) {
        const { apartments } = await fetchApartmentsByIds(sliceIds);
        upsertApartments(apartments);
      }

      setSearch((s) => ({
        ...s,
        loading: false,
        page: nextPage,
        total: resp.total,
        ids: [...s.ids, ...resp.ids],
      }));
    } catch (e: any) {
      setSearch((s) => ({
        ...s,
        loading: false,
        error: e?.message || "search_next_page_failed",
      }));
    }
  }, [
    search.loading,
    search.lastFilters,
    search.page,
    search.pageSize,
    upsertApartments,
  ]);

  // Selector for search
  const getSearchSlice = useCallback(
    (offset: number, limit: number) => {
      const ids = search.ids.slice(offset, offset + limit);
      const missing = ids.filter((id) => !entities[id]);
      if (missing.length > 0) {
        fetchApartmentsByIds(missing)
          .then((r) => upsertApartments(r.apartments))
          .catch(() => {});
      }
      return getApartmentsByIds(ids);
    },
    [search.ids, entities, upsertApartments, getApartmentsByIds]
  );

  // --- Map logic ---
  const setMapBounds = useCallback((bounds: MapBounds) => {
    setMap((m) => ({ ...m, bounds }));
  }, []);
  const setMapFilters = useCallback((filters: Filters) => {
    setMap((m) => ({ ...m, filters }));
  }, []);

  const refreshMap = useCallback(async () => {
    if (!map.bounds) return;
    setMap((m) => ({ ...m, loading: true, error: undefined }));
    try {
      const { ids } = await fetchMapApartmentIds(map.bounds, map.filters, 50);
      if (ids.length > 0) {
        const { apartments } = await fetchApartmentsByIds(ids);
        upsertApartments(apartments);
      }
      setMap((m) => ({ ...m, loading: false, ids }));
    } catch (e: any) {
      setMap((m) => ({
        ...m,
        loading: false,
        error: e?.message || "map_refresh_failed",
      }));
    }
  }, [map.bounds, map.filters, upsertApartments]);

  // --- Login lifecycle ---
  const initializeOnLogin = useCallback(async () => {
    clearAll();
    await loadHomeFirstPage();
  }, [clearAll, loadHomeFirstPage]);

  // ---------- Value ----------
  const value = useMemo<ApartmentsContextValue>(
    () => ({
      entities,

      home,
      loadHomeFirstPage,
      loadHomeNextPage,

      search,
      runSearch,
      loadNextSearchPage,
      getSearchSlice,

      map,
      setMapBounds,
      setMapFilters,
      refreshMap,

      getApartmentsByIds,
      upsertApartments,
      clearAll,

      initializeOnLogin,
    }),
    [
      entities,
      home,
      loadHomeFirstPage,
      loadHomeNextPage,
      search,
      runSearch,
      loadNextSearchPage,
      getSearchSlice,
      map,
      setMapBounds,
      setMapFilters,
      refreshMap,
      getApartmentsByIds,
      upsertApartments,
      clearAll,
      initializeOnLogin,
    ]
  );

  return (
    <ApartmentsContext.Provider value={value}>
      {children}
    </ApartmentsContext.Provider>
  );
};

// ---------- Hook ----------
export function useApartments() {
  const ctx = useContext(ApartmentsContext);
  if (!ctx)
    throw new Error("useApartments must be used within ApartmentsProvider");
  return ctx;
}
