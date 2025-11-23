# Database Schema Summary

## Overview

This document summarizes the database schema design for the RooMe React Native application. The schema is designed to support apartment listings (rental, shared, and sublet), user management, messaging, open houses, and roommate matching features.

## Main Entities

### 1. Users
**Table:** `users`

Stores user account information including profile details, preferences, and authentication data.

**Key Fields:**
- `user_id` (PK)
- `email` (unique)
- `password_hash`
- `full_name`
- `profile_picture_url`
- `gender`, `birth_date`
- `own_pet`, `smoke`
- `job_status`
- `push_token` (for notifications)

**Relationships:**
- One-to-many with `apartments` (as creator)
- One-to-many with `messages` (as sender/receiver)
- One-to-one with `roommate_preferences`
- Many-to-many with `apartments` via `saved_apartments`
- Many-to-many with `users` via `friendships`
- Many-to-many with `open_houses` via `open_house_registrations`

---

### 2. Apartments
**Table:** `apartments`

Main apartment listings with three types:
- **Type 0 (Rental):** Long-term rental apartments
- **Type 1 (Shared):** Shared living spaces with roommates
- **Type 2 (Sublet):** Short-term sublet arrangements

**Key Fields:**
- `apartment_id` (PK)
- `creator_id` (FK → users)
- `apartment_type` (0, 1, or 2)
- `property_type_id` (FK → property_types)
- `address`, `latitude`, `longitude`
- `price`, `amount_of_rooms`, `floor`
- `description`
- `allow_pet`, `allow_smoking`, `parking_space`
- `entry_date`, `exit_date`
- Type-specific fields (rental, shared, sublet)
- `num_of_likes` (denormalized count)

**Relationships:**
- Many-to-one with `users` (creator)
- Many-to-one with `property_types`
- One-to-many with `apartment_images`
- One-to-many with `roommates` (for shared apartments)
- One-to-many with `open_houses`
- Many-to-many with `apartment_labels` via `apartment_label_junction`
- Many-to-many with `users` via `saved_apartments`

---

### 3. Apartment Images
**Table:** `apartment_images`

Stores image URLs for apartments with ordering support.

**Key Fields:**
- `image_id` (PK)
- `apartment_id` (FK → apartments)
- `image_url`
- `display_order`

---

### 4. Property Types
**Table:** `property_types`

Lookup table for property categories (e.g., Apartment, House, Studio).

**Key Fields:**
- `property_type_id` (PK)
- `name`
- `description`

---

### 5. Apartment Labels
**Table:** `apartment_labels`

Lookup table for apartment amenities/features (e.g., "balcony", "elevator", "fridge").

**Key Fields:**
- `label_id` (PK)
- `label_key` (unique identifier)
- `label_name_hebrew`, `label_name_english`
- `icon_name`

**Relationships:**
- Many-to-many with `apartments` via `apartment_label_junction`

---

### 6. Saved Apartments
**Table:** `saved_apartments`

Junction table for users saving apartments (many-to-many).

**Key Fields:**
- `user_id` (FK → users)
- `apartment_id` (FK → apartments)
- `saved_at`

**Composite Primary Key:** (user_id, apartment_id)

---

### 7. Roommates
**Table:** `roommates`

Stores roommate information for shared apartments (ApartmentType = 1).

**Key Fields:**
- `roommate_id` (PK)
- `apartment_id` (FK → apartments)
- `name`, `gender`, `job`, `birth_date`
- `profile_image_url`
- `display_order`

---

### 8. Open Houses
**Table:** `open_houses`

Scheduled open house events for apartments.

**Key Fields:**
- `open_house_id` (PK)
- `apartment_id` (FK → apartments)
- `date`, `start_time`, `end_time`
- `location_address` (optional override)
- `amount_of_people` (capacity)
- `total_registrations` (denormalized count)

**Relationships:**
- Many-to-one with `apartments`
- One-to-many with `open_house_registrations`

---

### 9. Open House Registrations
**Table:** `open_house_registrations`

User registrations for open house events.

**Key Fields:**
- `registration_id` (PK)
- `open_house_id` (FK → open_houses)
- `user_id` (FK → users)
- `confirmed` (boolean)
- `registered_at`

**Unique Constraint:** (open_house_id, user_id) - prevents duplicate registrations

---

### 10. Friendships
**Table:** `friendships`

Many-to-many relationship for user friendships.

**Key Fields:**
- `friendship_id` (PK)
- `user_id_1`, `user_id_2` (both FK → users)
- `created_at`

**Constraints:**
- Unique constraint on (user_id_1, user_id_2)
- Check constraint: user_id_1 < user_id_2 (prevents duplicate friendships)

---

### 11. Messages
**Table:** `messages`

Chat messages between users.

**Key Fields:**
- `message_id` (PK)
- `from_user_id` (FK → users)
- `to_user_id` (FK → users)
- `content`
- `sent_at`
- `is_read`, `read_at`

**Indexes:**
- On (from_user_id, to_user_id, sent_at) for conversation queries

---

### 12. Roommate Preferences
**Table:** `roommate_preferences`

User preferences for finding compatible roommates.

**Key Fields:**
- `preference_id` (PK)
- `user_id` (FK → users, unique)
- `preferred_gender`, `preferred_min_age`, `preferred_max_age`
- `allow_smoking`, `allow_pets`
- `cleanliness_level`, `sleep_schedule`, `social_level`
- `work_hours`, `work_from_home`
- `has_pet`, `pet_type`
- `relationship_status`, `social_style`
- `open_to_friendship`
- `notes`

---

## Relationship Diagram

```
Users (1) ──< (N) Apartments (creator_id)
Users (1) ──< (N) Messages (from_user_id, to_user_id)
Users (1) ──< (1) RoommatePreferences (user_id)
Users (N) ──< (M) SavedApartments ──> (N) Apartments
Users (N) ──< (M) Friendships ──> (N) Users
Users (N) ──< (M) OpenHouseRegistrations ──> (N) OpenHouses

Apartments (1) ──< (N) ApartmentImages
Apartments (1) ──< (N) Roommates
Apartments (1) ──< (N) OpenHouses
Apartments (N) ──< (M) ApartmentLabelJunction ──> (N) ApartmentLabels
Apartments (N) ──< (M) SavedApartments ──> (N) Users

PropertyTypes (1) ──< (N) Apartments

OpenHouses (1) ──< (N) OpenHouseRegistrations
```

## Key Design Decisions

### 1. Denormalization
- **`apartments.num_of_likes`**: Denormalized count of saved apartments for performance
- **`open_houses.total_registrations`**: Denormalized count of registrations
- **`apartments` includes denormalized creator info** (Creator_FullName, Creator_ProfilePicture) in frontend, but normalized in DB

### 2. JSON Fields
- **`apartments.Location`**: Stored as normalized `address`, `latitude`, `longitude` in DB, but serialized as JSON string in API responses
- **`apartments.LabelsJson`**: Stored in normalized `apartment_label_junction` table, but serialized as JSON array in API responses
- **`apartments.Roommates`**: Stored in normalized `roommates` table, but serialized as pipe-separated string in API responses

### 3. Type-Specific Fields
Apartment type-specific fields are stored in the same table with NULL values when not applicable:
- Rental fields: `rental_contract_length`, `rental_extension_possible`
- Shared fields: `shared_number_of_roommates`
- Sublet fields: `sublet_can_cancel_without_penalty`, `sublet_is_whole_property`

### 4. Indexes
Comprehensive indexing strategy:
- Foreign keys are indexed
- Frequently queried fields (price, entry_date, apartment_type) are indexed
- Composite indexes for common query patterns (conversations, saved apartments)

### 5. Triggers
- Auto-update `updated_at` timestamps
- Auto-update denormalized counts (`num_of_likes`, `total_registrations`)

## TypeScript Type Alignment

All TypeScript types have been aligned with the database schema:

- **Unified types file**: `types/database.ts`
- **Backward compatibility**: Existing type exports maintained in context files
- **DTO types**: Request/Response DTOs defined for API communication

### Type Mapping

| Database Column | TypeScript Property | Notes |
|----------------|-------------------|-------|
| `apartment_id` | `ApartmentID` | PascalCase in frontend |
| `creator_id` | `Creator_ID` | PascalCase in frontend |
| `apartment_type` | `ApartmentType` | Enum: 0, 1, 2 |
| `num_of_likes` | `NumOfLikes` | Denormalized count |
| `is_liked_by_user` | `IsLikedByUser` | Computed field |

## Files Modified

### Created Files
1. **`docs/db-schema.sql`**: Complete database schema with CREATE TABLE statements, indexes, triggers
2. **`types/database.ts`**: Unified TypeScript type definitions aligned with schema
3. **`docs/database-schema-summary.md`**: This documentation file

### Modified Files
1. **`context/ApartmentsContext.tsx`**: Updated to import types from unified types file
2. **`hooks/profileHooks/useUserProfile.ts`**: Updated to use unified UserProfile type
3. **`hooks/profileHooks/useFriends.tsx`**: Updated to use unified Friend type
4. **`hooks/profileHooks/useOpenHouses.ts`**: Updated to use unified OpenHouse type
5. **`components/apartment/apartmentDetails.tsx`**: Updated to use unified Apartment type

## Next Steps

1. **Backend Implementation**: Use `docs/db-schema.sql` to create the database
2. **API Layer**: Implement endpoints using DTO types from `types/database.ts`
3. **Data Migration**: If migrating from existing data, create migration scripts
4. **Testing**: Test all relationships and constraints
5. **Performance**: Monitor query performance and adjust indexes as needed

## Notes

- The schema uses PostgreSQL syntax but can be adapted to MySQL/SQL Server
- All timestamps use `TIMESTAMP` type (can be changed to `TIMESTAMPTZ` for timezone support)
- String lengths are reasonable defaults; adjust based on actual data requirements
- The schema supports the existing frontend data shapes while maintaining normalization

