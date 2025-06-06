# Hướng dẫn Setup Supabase Storage

## Vấn đề đã sửa

### 🎵 **Lỗi Music Player không phát được nhạc sau reload**

**Nguyên nhân**:
- Object URLs (`blob:`) chỉ tồn tại trong session hiện tại
- File objects không thể serialize vào localStorage
- Khi reload trang, các URLs này trở nên invalid

**Giải pháp**:
- Tích hợp Supabase Storage để lưu trữ files thực sự
- Tự động fallback về localStorage nếu Supabase không khả dụng
- URLs từ Supabase Storage persistent và có thể truy cập từ bất kỳ đâu

## Setup Supabase Storage

### Bước 1: Tạo Storage Bucket

1. **Truy cập Supabase Dashboard**:
   ```
   https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]
   ```

2. **Vào Storage section**:
   - Click "Storage" trong sidebar
   - Click "Create a new bucket"

3. **Tạo bucket với config**:
   ```
   Bucket name: music-files
   Public bucket: ✅ Enabled
   File size limit: 50MB
   Allowed MIME types: audio/*
   ```

### Bước 2: Cấu hình RLS (Row Level Security)

1. **Vào SQL Editor**:
   ```sql
   -- Allow public access to storage bucket
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('music-files', 'music-files', true);
   
   -- Create policy for public read access
   CREATE POLICY "Public Access" ON storage.objects
   FOR SELECT USING (bucket_id = 'music-files');
   
   -- Create policy for public upload
   CREATE POLICY "Public Upload" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'music-files');
   
   -- Create policy for public delete
   CREATE POLICY "Public Delete" ON storage.objects
   FOR DELETE USING (bucket_id = 'music-files');
   ```

### Bước 3: Kiểm tra kết nối

1. **Chạy app**:
   ```bash
   npm run dev
   # hoặc
   docker-compose --profile dev up
   ```

2. **Kiểm tra status**:
   - Xem status bar ở đầu trang
   - Nếu hiển thị "Storage: Cloud (Supabase)" = thành công
   - Nếu hiển thị "Storage: Local Browser" = fallback mode

## Tính năng mới

### 🔄 **Automatic Fallback System**
```typescript
// useMusicStorage.ts
- Tự động detect Supabase availability
- Fallback về localStorage nếu cần
- Transparent switching cho user
```

### 📊 **Storage Status Display**
- Hiển thị storage type đang sử dụng
- Visual indicators cho connection status
- Hướng dẫn setup nếu cần

### 🔧 **Supabase Integration**
- Upload files to cloud storage
- Persistent URLs across sessions
- Automatic file management
- Error handling và retry logic

## Cách hoạt động

### 1. **Upload Process**
```
User selects file
    ↓
Check storage type
    ↓
If Supabase available:
    → Upload to Supabase Storage
    → Get persistent public URL
    → Save metadata to state
    
If Supabase not available:
    → Create blob URL
    → Save to localStorage
    → Show warning about persistence
```

### 2. **Load Process**
```
App starts
    ↓
Check Supabase connection
    ↓
If connected:
    → Load files from Storage
    → Get public URLs
    → Display tracks
    
If not connected:
    → Load from localStorage
    → Recreate blob URLs
    → Display tracks (may fail if files lost)
```

### 3. **Play Process**
```
User clicks play
    ↓
PlayerContext receives track with URL
    ↓
If Supabase URL:
    → Direct streaming from cloud
    → Reliable playback
    
If blob URL:
    → Stream from memory
    → May fail if URL expired
```

## Troubleshooting

### ❌ **"Supabase Connection Failed"**
**Nguyên nhân**:
- Sai URL hoặc API key
- Project bị pause/inactive
- Network issues

**Giải pháp**:
1. Kiểm tra `src/integrations/supabase/client.ts`
2. Verify project status trên dashboard
3. Test network connectivity

### ⚠️ **"Storage Bucket Required"**
**Nguyên nhân**:
- Bucket `music-files` chưa được tạo
- Bucket bị xóa hoặc rename

**Giải pháp**:
1. Click "Create Storage Bucket" trong app
2. Hoặc tạo manual trên dashboard
3. Đảm bảo tên chính xác: `music-files`

### 🔒 **"Upload Failed"**
**Nguyên nhân**:
- RLS policies chưa được setup
- File size quá lớn (>50MB)
- MIME type không được phép

**Giải pháp**:
1. Chạy SQL policies ở trên
2. Compress file audio
3. Kiểm tra format file (MP3, WAV, M4A, FLAC)

## Environment Variables

Tạo file `.env.local` (optional):
```env
# Supabase config (already in client.ts)
VITE_SUPABASE_URL=https://klodelivkpiycxrbrzyl.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Storage config
VITE_MAX_FILE_SIZE=52428800  # 50MB
VITE_STORAGE_BUCKET=music-files
```

## Testing

### Test Supabase Mode:
1. Ensure Supabase is properly configured
2. Upload a music file
3. Reload page
4. Verify file still plays

### Test Fallback Mode:
1. Temporarily break Supabase connection
2. Upload a music file
3. Verify localStorage fallback works
4. Note: Files will be lost on reload

## Benefits

### ✅ **Với Supabase**:
- Files persist across sessions
- Accessible from any device
- Reliable streaming
- No storage limits (within Supabase quotas)
- Automatic backup

### ⚠️ **Với localStorage**:
- Files lost on page reload
- Limited by browser storage
- URLs expire
- Only accessible on same device/browser
- No backup

## Migration

Nếu bạn đã có files trong localStorage và muốn migrate:

1. **Manual migration**:
   - Re-upload files khi Supabase ready
   - Old files sẽ tự động bị clear

2. **Automatic migration** (future feature):
   - Detect localStorage files
   - Auto-upload to Supabase
   - Clean up localStorage

**Kết luận**: Project hiện tại đã hoàn toàn sửa được lỗi music player và hỗ trợ cả cloud storage lẫn local fallback! 🎉 