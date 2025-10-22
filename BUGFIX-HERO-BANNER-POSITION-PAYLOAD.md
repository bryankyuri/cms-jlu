# 🐛 Bug Fix: Hero Banner Position Not Sent in Payload

## Issue Description
When editing a work and updating the hero banner anchor position, the position data (`hero_banner_position_x` and `hero_banner_position_y`) was **not being sent** in the API payload.

**Example of Missing Data:**
```json
{
  "title": "SEE THE UNSEEN",
  "client": "FIF GROUP",
  "hero_banner_image": "https://...",
  // ❌ Missing: hero_banner_position_x
  // ❌ Missing: hero_banner_position_y
  ...
}
```

---

## Root Cause
The `transformToAPIFormat` function in both **create** and **edit** handlers was missing the hero banner position fields when converting the frontend data format to API format.

**Affected Files:**
1. `cms-front/src/pages/works/edit/hooks/useWorkEditHandlers.js`
2. `cms-front/src/pages/works/create/hooks/useWorkCreateHandlers.js`

---

## Solution

### **Before (Missing Fields):**
```javascript
const transformToAPIFormat = (data, status = "draft") => {
  return {
    title: data.title,
    client: data.client,
    // ... other fields
    hero_banner_image: data.heroBannerImage,
    // ❌ Position fields missing
    video_project_src: data.videoProjectSrc,
    // ... rest of fields
  };
};
```

### **After (Fields Added):**
```javascript
const transformToAPIFormat = (data, status = "draft") => {
  return {
    title: data.title,
    client: data.client,
    // ... other fields
    hero_banner_image: data.heroBannerImage,
    hero_banner_position_x: data.heroBannerPositionX,  // ✅ Added
    hero_banner_position_y: data.heroBannerPositionY,  // ✅ Added
    video_project_src: data.videoProjectSrc,
    // ... rest of fields
  };
};
```

---

## Changes Made

### **1. Edit Works Handler**
**File:** `cms-front/src/pages/works/edit/hooks/useWorkEditHandlers.js`

**Lines Added (after line 18):**
```javascript
hero_banner_position_x: data.heroBannerPositionX,
hero_banner_position_y: data.heroBannerPositionY,
```

**Functions Affected:**
- `savePublish()` - Now includes position when publishing
- `saveDraft()` - Now includes position when saving draft
- `saveUpdates()` - Now includes position when saving changes

---

### **2. Create Works Handler**
**File:** `cms-front/src/pages/works/create/hooks/useWorkCreateHandlers.js`

**Lines Added (after line 16):**
```javascript
hero_banner_position_x: data.heroBannerPositionX,
hero_banner_position_y: data.heroBannerPositionY,
```

**Functions Affected:**
- `savePublish()` - Now includes position when creating and publishing
- `saveDraft()` - Now includes position when creating draft

---

## Expected Payload (After Fix)

### **Edit Work:**
```json
{
  "title": "SEE THE UNSEEN",
  "client": "FIF GROUP",
  "category": "commercial",
  "year": "2024",
  "description": "Test",
  "hero_banner_image": "https://staging-api.parallelstudio.asia/storage/images/69e19f5c-bdcc-4842-9604-72af65c32822.jpg",
  "hero_banner_position_x": "center",  // ✅ Now included
  "hero_banner_position_y": "bottom",  // ✅ Now included
  "video_project_src": "https://...",
  "video_project_poster": "https://...",
  "video_vimeo_url": "https://...",
  "video_youtube_url": "https://...",
  "video_cloudflare_url": "https://...",
  "tags": ["MOTION GRAPHIC", "VFX"],
  "status": "published",
  "credits": [...],
  "gallery_items": [...]
}
```

---

## Data Flow

### **Frontend State:**
```javascript
workData = {
  heroBannerImage: "https://...",
  heroBannerPositionX: "center",   // From position selector
  heroBannerPositionY: "bottom",   // From position selector
  // ... other fields
}
```

### **Transform to API:**
```javascript
transformToAPIFormat(workData) 
↓
{
  hero_banner_image: "https://...",
  hero_banner_position_x: "center",   // ✅ Mapped correctly
  hero_banner_position_y: "bottom",   // ✅ Mapped correctly
  // ... other fields
}
```

### **API Endpoint:**
```
POST /api/works/{id}
or
POST /api/works

Body: {
  hero_banner_position_x: "center",
  hero_banner_position_y: "bottom"
}
```

### **Database:**
```sql
UPDATE works 
SET hero_banner_position_x = 'center',
    hero_banner_position_y = 'bottom'
WHERE id = '...';
```

---

## Testing Checklist

### **Create Work:**
- [ ] Create new work with position selector
- [ ] Choose position (e.g., "Bottom Center")
- [ ] Save as draft
- [ ] Check API payload includes `hero_banner_position_x: "center"` and `hero_banner_position_y: "bottom"`
- [ ] Verify database has correct values
- [ ] Publish work
- [ ] Check API payload includes position fields

### **Edit Work:**
- [ ] Open existing work
- [ ] Change hero banner position to "Bottom Center"
- [ ] Click "Save Changes"
- [ ] Check API payload includes `hero_banner_position_x: "center"` and `hero_banner_position_y: "bottom"`
- [ ] Verify database updated with new values
- [ ] Verify public site displays hero banner with correct position

### **Position-Only Update:**
- [ ] Open existing work with hero banner
- [ ] Change only the position (don't upload new image)
- [ ] Save changes
- [ ] Verify position updated without affecting image

---

## Verification

### **Browser Console:**
```javascript
// Before save, check workData state:
console.log(workData.heroBannerPositionX); // Should show: "center", "left", or "right"
console.log(workData.heroBannerPositionY); // Should show: "top", "center", or "bottom"

// Check API payload in Network tab:
// Look for POST /api/works/{id} request
// Body should include:
{
  "hero_banner_position_x": "center",
  "hero_banner_position_y": "bottom"
}
```

### **API Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "hero_banner_position_x": "center",  // ✅ Saved
    "hero_banner_position_y": "bottom",  // ✅ Saved
    "updated_at": "2025-10-21T..."
  }
}
```

---

## Impact

### **Before Fix:**
- ❌ Position selector worked in UI
- ❌ Position state saved in frontend
- ❌ **But position NOT sent to API**
- ❌ Database never updated
- ❌ Public site always used default `center top`

### **After Fix:**
- ✅ Position selector works in UI
- ✅ Position state saved in frontend
- ✅ **Position sent to API correctly**
- ✅ Database updated with chosen position
- ✅ Public site displays with correct position

---

## Related Files

**Fixed:**
- ✅ `cms-front/src/pages/works/edit/hooks/useWorkEditHandlers.js`
- ✅ `cms-front/src/pages/works/create/hooks/useWorkCreateHandlers.js`

**Already Correct:**
- ✅ `cms-front/src/pages/works/edit/hooks/useModalHandlers.js` - Updates workData state
- ✅ `cms-front/src/pages/works/create/hooks/useModalHandlers.js` - Updates workData state
- ✅ `cms-front/src/pages/works/edit/hooks/useWorkEdit.js` - Has position state
- ✅ `cms-front/src/pages/works/create/hooks/useWorkCreate.js` - Has position state
- ✅ `laravel-backend/app/Http/Controllers/API/WorkController.php` - Handles position fields
- ✅ `laravel-backend/app/Models/Work.php` - Has fillable position fields
- ✅ Database migration - Columns exist

---

## Status
✅ **FIXED** - Both create and edit handlers now include position fields in API payload

**Date:** October 21, 2025  
**Files Modified:** 2  
**Lines Added:** 4 (2 per file)  
**Breaking Changes:** None  
**Backward Compatible:** Yes
