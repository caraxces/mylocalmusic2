# Docker Setup Guide - My Local Music

## Tổng quan
Project này đã được cấu hình để chạy trong Docker với hai môi trường:
- **Production**: Sử dụng Nginx để serve static files
- **Development**: Chạy Vite dev server với hot reload

## Cấu trúc Files Docker

### 1. `Dockerfile` (Production)
- Build React app thành static files
- Sử dụng Nginx Alpine để serve files
- Tối ưu hóa cho production

### 2. `Dockerfile.dev` (Development)
- Chạy Vite dev server
- Hỗ trợ hot reload
- Mount source code để development

### 3. `docker-compose.yml`
- Cấu hình cả production và development services
- Port mapping và environment variables

### 4. `nginx.conf`
- Cấu hình Nginx cho React SPA
- Gzip compression
- Security headers
- Client-side routing support

## Cách sử dụng

### Chạy Production Mode
```bash
# Build và chạy production container
docker-compose up --build

# Hoặc chỉ build
docker-compose build

# Chạy trong background
docker-compose up -d
```

Truy cập: http://localhost:3000

### Chạy Development Mode
```bash
# Chạy development container với hot reload
docker-compose --profile dev up --build

# Hoặc
docker-compose -f docker-compose.yml up dev --build
```

Truy cập: http://localhost:5173

### Các lệnh hữu ích

```bash
# Xem logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild từ đầu (xóa cache)
docker-compose build --no-cache

# Xóa tất cả containers và images
docker-compose down --rmi all --volumes --remove-orphans
```

## Lỗi đã sửa

### 1. **Lỗi Music Player không hoạt động**
**Vấn đề**: Khi upload nhạc thành công nhưng không thể phát được

**Nguyên nhân**:
- Component Player và MainContent không kết nối với nhau
- Audio element không có source
- Thiếu state management giữa components

**Giải pháp**:
- Tạo `PlayerContext` để quản lý state chung
- Kết nối Player với MainContent thông qua Context
- Thêm logic load và play audio files

### 2. **Lỗi ESLint và TypeScript**
- Tắt các rules không cần thiết cho project này
- Sửa lỗi `@typescript-eslint/no-require-imports` trong config files
- Sửa lỗi `@typescript-eslint/no-explicit-any` và `@typescript-eslint/no-empty-object-type`

### 3. **Lỗi Security trong Dependencies**
- Chạy `npm audit fix` để sửa các lỗ hổng bảo mật
- Cập nhật dependencies cần thiết

## Kiến trúc mới

### PlayerContext
```typescript
// src/contexts/PlayerContext.tsx
- Quản lý state của music player
- Cung cấp functions: playTrack, togglePlayPause, etc.
- Chia sẻ state giữa Player và MainContent
```

### Luồng hoạt động
1. User upload file → `useLocalMusic` hook xử lý
2. User click play → `MainContent` gọi `playTrack` từ Context
3. `PlayerContext` cập nhật state và load audio
4. `Player` component hiển thị thông tin và controls

## Environment Variables
Tạo file `.env` nếu cần:
```env
# Supabase (nếu sử dụng)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Other configs
VITE_APP_NAME=My Local Music
```

## Troubleshooting

### Lỗi thường gặp:

1. **Port đã được sử dụng**
```bash
# Thay đổi port trong docker-compose.yml
ports:
  - "3001:80"  # Thay vì 3000:80
```

2. **Audio không phát được**
- Kiểm tra browser console để xem lỗi
- Đảm bảo file audio format được hỗ trợ (MP3, WAV, M4A, FLAC)
- Kiểm tra CORS nếu load từ external source

3. **Hot reload không hoạt động**
- Đảm bảo volume mapping đúng trong docker-compose
- Restart development container

## Performance Tips

### Production
- Files được gzip compression
- Static assets được cache 1 năm
- Nginx được tối ưu cho SPA

### Development
- Hot reload enabled
- Source maps available
- Fast refresh cho React components

## Security

### Headers được thêm:
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Referrer-Policy: no-referrer-when-downgrade
- Content-Security-Policy: restrictive policy

### Best practices:
- Không expose sensitive environment variables
- Sử dụng non-root user trong containers
- Regular security updates cho base images 