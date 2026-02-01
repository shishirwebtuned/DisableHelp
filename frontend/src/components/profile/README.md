# Worker Profile Components

## Overview
The worker profile page has been divided into modular, reusable components organized by different sections:

## Components Structure

### 1. PersonalDetails Component
**Location:** `src/components/profile/PersonalDetails.tsx`

**Sections Included:**
- Personal Information (First Name, Last Name, DOB, Gender)
- Contact Details (Email, Phone, Address, State, Postcode)
- Bio & About Me

**Features:**
- Real-time data logging to console
- Form validation
- State management for all personal data
- Callback function `onSave` to send data to parent component

### 2. ProfessionalDetails Component
**Location:** `src/components/profile/ProfessionalDetails.tsx`

**Sections Included:**
- Experience (Years, Total Hours, Specializations)
- Work History (Position, Organization, Duration, Description)
- Education & Training (Qualifications, Institution, Year)
- Credentials & Certifications (Name, Number, Expiry Date)

**Features:**
- Add/Edit/Delete functionality for work history, education, and credentials
- Modal dialogs for adding new entries
- Real-time console logging
- Comprehensive professional data management

### 3. JobDetails Component
**Location:** `src/components/profile/JobDetails.tsx`

**Sections Included:**
- Preferred Hours (Day-wise time slot selection)
- Indicative Rates (Standard, Weekend, Evening, Overnight)
- Services Offered (Checkboxes for various services)

**Features:**
- Interactive time slot selection with visual feedback
- Day enable/disable toggles
- Dynamic rate setting
- Service multi-select
- Auto-logging of changes

### 4. AdditionalDetails Component
**Location:** `src/components/profile/AdditionalDetails.tsx`

**Sections Included:**
- Languages (Add/Remove languages)
- Interests & Hobbies (Visual icon-based selection)
- Cultural Background (Background, Religion, Smoking, Pet Friendly)
- Work Preferences (Client Age, Gender, Travel Distance)
- Bank Account Details (Account Name, BSB, Account Number)

**Features:**
- Dynamic language management
- Icon-based interest selection
- Preference modal dialog
- Secure bank details handling
- Complete additional information capture

### 5. ProfileImageEditor Component
**Location:** `src/components/profile/ProfileImageEditor.tsx`

**Features:**
- Image upload functionality
- **Advanced Image Cropping:**
  - Zoom control (0.5x - 3x)
  - Rotation control (0° - 360°)
  - Drag to reposition
  - Visual canvas editor
  - Real-time preview
- **Binary Image Handling:**
  - Converts image to Base64 for preview
  - Stores image as Blob for API upload
  - Proper MIME type handling
- Image guidelines display
- Remove photo option

## Main Profile Page
**Location:** `src/app/(worker)/worker/profile/page.tsx`

The main page orchestrates all components and provides:
- Sidebar navigation between sections
- Progress tracking (completion percentage)
- Centralized state management
- **Comprehensive Console Logging:**
  - Logs data when each section is saved
  - Complete profile data logging
  - Binary image metadata logging
  - FormData preparation demonstration
- Submit all functionality
- Preview profile link

## Data Flow

1. **Component Level:** Each component manages its own state
2. **Parent Callback:** Components call `onSave()` with typed data
3. **Main Page:** Aggregates all data into `allProfileData` state
4. **Console Logging:** All data changes are logged automatically
5. **API Ready:** FormData preparation shown for binary image upload

## Console Logging Features

### Automatic Logging
- Each component logs data changes via `useEffect`
- Format: `ComponentName Data: { ...data }`

### Save Actions
- Each save action logs complete data
- Format: `=== COMPLETE PROFILE DATA ===`

### Image Handling
- Base64 preview (first 100 chars shown)
- Binary metadata (size, type, availability)
- FormData preparation log

### Submit All
- Comprehensive final data dump
- Shows how to prepare data for API
- Demonstrates FormData for file upload

## Usage Example

```typescript
// In page.tsx
const handlePersonalDetailsSave = (data: PersonalDetailsData) => {
  const updatedData = { ...allProfileData, personalDetails: data };
  setAllProfileData(updatedData);
  console.log('=== COMPLETE PROFILE DATA ===');
  console.log(JSON.stringify(updatedData, null, 2));
};

// In component
<PersonalDetails onSave={handlePersonalDetailsSave} />
```

## API Integration Ready

The profile data is structured for easy API submission:

```typescript
// Example API call structure
const formData = new FormData();
formData.append('profileImage', imageBinary, 'profile.png');
formData.append('profileData', JSON.stringify({
  personalDetails: {...},
  professionalDetails: {...},
  jobDetails: {...},
  additionalDetails: {...}
}));

await fetch('/api/worker/profile', { 
  method: 'POST', 
  body: formData 
});
```

## Image Binary Handling

The image is handled in two formats:
1. **Base64 String:** For preview and display in UI
2. **Binary Blob:** For efficient upload to server

```typescript
profileImage: {
  base64: string;  // For display
  binary: Blob | null;  // For upload
}
```

## Type Safety

All components export their data types:
- `PersonalDetailsData`
- `ProfessionalDetailsData`
- `JobDetailsData`
- `AdditionalDetailsData`

Import from `@/components/profile` for type safety.

## Testing Console Output

1. Navigate to worker profile page
2. Fill in any section
3. Click "Save" button
4. Open browser console (F12)
5. See structured data output
6. Click "Submit All Data" to see complete profile

## Dependencies

- React (useState, useEffect)
- shadcn/ui components
- Lucide icons
- @radix-ui/react-slider (for image editor)

## Notes

- All data is logged in JSON format for easy debugging
- Binary image handling ensures efficient file uploads
- Components are fully modular and reusable
- Type-safe interfaces for all data structures
- Console logging can be disabled in production by removing console.log statements
