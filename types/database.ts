// =====================================================
// Database Type Definitions
// Aligned with db-schema.sql
// =====================================================

// =====================================================
// 1. USER TYPES
// =====================================================

export type User = {
  user_id: number;
  email: string;
  password_hash?: string; // Never expose in frontend
  full_name: string;
  phone_number?: string | null;
  profile_picture_url?: string | null;
  gender?: "M" | "F" | "O" | null;
  birth_date?: string | null; // ISO date string
  own_pet: boolean;
  smoke: boolean;
  job_status?: string | null;
  push_token?: string | null;
  created_at?: string;
  updated_at?: string;
  is_active: boolean;
};

// Frontend-friendly user profile (without sensitive fields)
export type UserProfile = {
  id: number | string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
  gender?: "M" | "F" | "O" | string;
  birthDate?: string | Date;
  ownPet?: boolean;
  smoke?: boolean;
  jobStatus?: string;
  token?: string; // For auth token, not push token
};

// =====================================================
// 2. APARTMENT TYPES
// =====================================================

export type ApartmentType = 0 | 1 | 2; // 0=rental, 1=shared, 2=sublet

export type Apartment = {
  ApartmentID: number; // Maps to apartment_id
  Creator_ID: number; // Maps to creator_id
  Creator_FullName: string; // Denormalized from users table
  Creator_ProfilePicture: string; // Denormalized from users table
  Images: string[]; // Array of image URLs from apartment_images table
  ApartmentType: ApartmentType;
  Location: string; // JSON string: { address: string, latitude?: number, longitude?: number }
  Price: number;
  Description: string;
  AmountOfRooms: number;
  AllowPet: boolean;
  AllowSmoking: boolean;
  ParkingSpace: number;
  EntryDate: string; // ISO date string
  ExitDate: string | null; // ISO date string or null
  Rental_ContractLength: number | null; // Only for ApartmentType = 0
  Rental_ExtensionPossible: boolean; // Only for ApartmentType = 0
  Shared_NumberOfRoommates: number | null; // Only for ApartmentType = 1
  Roommates: string; // Pipe-separated string or JSON array of roommate info
  Sublet_CanCancelWithoutPenalty: boolean; // Only for ApartmentType = 2
  Sublet_IsWholeProperty: boolean; // Only for ApartmentType = 2
  LabelsJson: string; // JSON string array of label values: [{"value":"balcony"},...]
  NumOfLikes: number; // Denormalized count
  IsLikedByUser: boolean; // Computed based on saved_apartments table
};

// Database representation of apartment
export type ApartmentDB = {
  apartment_id: number;
  creator_id: number;
  apartment_type: ApartmentType;
  property_type_id?: number | null;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  price: number;
  amount_of_rooms: number;
  floor: number;
  description?: string | null;
  allow_pet: boolean;
  allow_smoking: boolean;
  parking_space: number;
  entry_date: string; // DATE format
  exit_date?: string | null; // DATE format
  rental_contract_length?: number | null;
  rental_extension_possible: boolean;
  shared_number_of_roommates?: number | null;
  sublet_can_cancel_without_penalty: boolean;
  sublet_is_whole_property: boolean;
  num_of_likes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// =====================================================
// 3. APARTMENT IMAGE TYPES
// =====================================================

export type ApartmentImage = {
  image_id: number;
  apartment_id: number;
  image_url: string;
  display_order: number;
  created_at: string;
};

// =====================================================
// 4. PROPERTY TYPE TYPES
// =====================================================

export type PropertyType = {
  property_type_id: number;
  name: string;
  description?: string | null;
  created_at: string;
};

// =====================================================
// 5. APARTMENT LABEL TYPES
// =====================================================

export type ApartmentLabel = {
  label_id: number;
  label_key: string; // e.g., "balcony", "elevator"
  label_name_hebrew?: string | null;
  label_name_english?: string | null;
  icon_name?: string | null;
  created_at: string;
};

// =====================================================
// 6. SAVED APARTMENT TYPES
// =====================================================

export type SavedApartment = {
  user_id: number;
  apartment_id: number;
  saved_at: string;
};

// =====================================================
// 7. ROOMMATE TYPES
// =====================================================

export type Roommate = {
  roommate_id: number;
  apartment_id: number;
  name: string;
  gender?: "M" | "F" | "O" | null;
  job?: string | null;
  birth_date?: string | null;
  profile_image_url?: string | null;
  display_order: number;
  created_at: string;
};

// Parsed roommate info from Roommates string field
export type RoommateInfo = {
  Name: string;
  Gender: "Male" | "Female" | string;
  Job: string;
  BirthDate: string;
  Image: string;
};

// =====================================================
// 8. OPEN HOUSE TYPES
// =====================================================

export type OpenHouse = {
  id: number; // Maps to open_house_id
  apartmentId: number; // Maps to apartment_id
  location: string; // Address string
  date: string; // ISO date string
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
  amountOfPeoples: number; // Maps to amount_of_people
  totalRegistrations: number;
};

export type OpenHouseDB = {
  open_house_id: number;
  apartment_id: number;
  date: string; // DATE format
  start_time: string; // TIME format
  end_time: string; // TIME format
  location_address?: string | null;
  amount_of_people: number;
  total_registrations: number;
  created_at: string;
  updated_at: string;
};

// =====================================================
// 9. OPEN HOUSE REGISTRATION TYPES
// =====================================================

export type OpenHouseRegistration = {
  registration_id: number;
  open_house_id: number;
  user_id: number;
  confirmed: boolean;
  registered_at: string;
};

// =====================================================
// 10. FRIENDSHIP TYPES
// =====================================================

export type Friend = {
  id: number | string; // Maps to user_id
  fullName: string;
  username?: string;
  profilePicture?: string;
};

export type Friendship = {
  friendship_id: number;
  user_id_1: number;
  user_id_2: number;
  created_at: string;
};

// =====================================================
// 11. MESSAGE TYPES
// =====================================================

export type Message = {
  message_id: number;
  from_user_id: number;
  to_user_id: number;
  content: string;
  sent_at: string;
  is_read: boolean;
  read_at?: string | null;
};

// Frontend-friendly message format
export type ChatMessage = {
  from: number; // from_user_id
  text: string; // content
  time: string; // Formatted time string
};

// =====================================================
// 12. ROOMMATE PREFERENCES TYPES
// =====================================================

export type RoommatePreferences = {
  preference_id: number;
  user_id: number;
  preferred_gender?: string | null;
  preferred_min_age: number;
  preferred_max_age: number;
  allow_smoking?: boolean | null;
  allow_pets?: boolean | null;
  cleanliness_level?: string | null;
  sleep_schedule?: string | null;
  social_level?: string | null;
  work_hours?: string | null;
  work_from_home?: boolean | null;
  has_pet: boolean;
  pet_type?: string | null;
  relationship_status?: string | null;
  social_style?: string | null;
  open_to_friendship?: boolean | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

// =====================================================
// 13. FILTER TYPES
// =====================================================

export type ApartmentFilters = {
  minPrice?: number;
  maxPrice?: number;
  entryDate?: string; // ISO date
  apartmentType?: ApartmentType;
  genders?: string[];
  features?: string[]; // Array of label keys
  queryText?: string; // Free-text search
};

// =====================================================
// 14. MAP BOUNDS TYPES
// =====================================================

export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

// =====================================================
// 15. API DTO TYPES (Data Transfer Objects)
// =====================================================

// Request DTOs
export type CreateApartmentDTO = {
  userID: number;
  apartmentType: ApartmentType;
  propertyTypeID?: number | null;
  location: string; // JSON string
  price: number;
  amountOfRooms: number;
  floor?: number;
  description?: string;
  allowPet: boolean;
  allowSmoking: boolean;
  parkingSpace: number;
  entryDate: string;
  exitDate?: string | null;
  // Type-specific fields
  contractLength?: number; // For rental
  extensionPossible?: boolean; // For rental
  numberOfRoommates?: number; // For shared
  canCancelWithoutPenalty?: boolean; // For sublet
  isWholeProperty?: boolean; // For sublet
};

export type UpdateApartmentDTO = CreateApartmentDTO & {
  apartment_id: number;
};

export type SaveApartmentDTO = {
  userId: number;
  apartmentId: number;
};

export type CreateOpenHouseDTO = {
  apartment_id: number;
  date: string;
  start_time: string;
  end_time: string;
  location_address?: string;
  amount_of_people: number;
};

export type RegisterOpenHouseDTO = {
  openHouseID: number;
  userID: number;
  confirmed: boolean;
};

export type SendMessageDTO = {
  fromUserId: number;
  toUserId: number;
  content: string;
};

export type CreateRoommatePreferencesDTO = {
  user_id: number;
  preferred_gender?: string;
  preferred_min_age?: number;
  preferred_max_age?: number;
  allow_smoking?: boolean;
  allow_pets?: boolean;
  cleanliness_level?: string;
  sleep_schedule?: string;
  social_level?: string;
  work_hours?: string;
  work_from_home?: boolean;
  has_pet?: boolean;
  pet_type?: string;
  relationship_status?: string;
  social_style?: string;
  open_to_friendship?: boolean;
  notes?: string;
};

// Response DTOs
export type ApartmentListResponse = {
  apartments: Apartment[];
  total: number;
  page: number;
  pageSize: number;
};

export type UserListResponse = {
  users: UserProfile[];
  total: number;
};

