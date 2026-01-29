# ImageProcessor - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Architecture](#project-architecture)
4. [Backend Explanation](#backend-explanation)
5. [Frontend Explanation](#frontend-explanation)
6. [How Frontend Connects to Backend](#how-frontend-connects-to-backend)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Authentication Flow](#authentication-flow)
10. [Image Processing Flow](#image-processing-flow)

---

## Project Overview

ImageProcessor is a full-stack web application that allows users to:
- Upload images (up to 10MB)
- Apply various transformations (resize, crop, rotate, filters)
- Remove backgrounds
- Convert between formats (JPEG, PNG, WebP)
- Save processed images to a personal gallery
- Share images via public links
- Download processed images

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React.js | UI Library for building components |
| Vite | Build tool and dev server |
| Chakra UI | Component library for styled UI |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime |
| Express.js | Web framework for REST API |
| MongoDB | NoSQL database |
| Mongoose | MongoDB ODM (Object Document Mapper) |
| Sharp.js | Image processing library |
| Multer | File upload middleware |
| JWT | JSON Web Tokens for authentication |
| bcrypt | Password hashing |

### Deployment
| Service | Purpose |
|---------|---------|
| Render | Backend hosting |
| Vercel | Frontend hosting |
| MongoDB Atlas | Cloud database |

---

## Project Architecture

```
ImageProcessor/
├── backend/                    # Node.js + Express API
│   ├── index.js               # Entry point, server setup
│   ├── models/                # Mongoose schemas
│   │   ├── User.js            # User model
│   │   └── Image.js           # Image model
│   ├── routes/                # API route handlers
│   │   ├── auth.js            # Authentication routes
│   │   └── image.js           # Image processing routes
│   ├── uploads/               # Temporary uploaded files
│   ├── processed/             # Temporary processed files
│   ├── gallery/               # Saved user images
│   └── .env                   # Environment variables
│
├── frontend/                  # React + Vite application
│   ├── src/
│   │   ├── App.jsx            # Main app with auth context
│   │   ├── components/
│   │   │   ├── Login.jsx      # Login page
│   │   │   ├── Signup.jsx     # Signup page
│   │   │   ├── ImageProcessor.jsx  # Main editor
│   │   │   └── Dashboard.jsx  # User gallery
│   │   └── main.jsx           # React entry point
│   └── .env                   # Frontend env variables
│
└── .gitignore                 # Git ignore rules
```

---

## Backend Explanation

### 1. Entry Point (`backend/index.js`)

```javascript
// What it does:
// 1. Loads environment variables from .env
// 2. Creates Express app
// 3. Sets up middleware (CORS, JSON parsing)
// 4. Creates upload directories if they don't exist
// 5. Connects to MongoDB
// 6. Starts the server

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(cors());                    // Allow cross-origin requests
app.use(express.json());            // Parse JSON bodies

// Routes
app.use("/api/auth", authRoutes);   // Authentication endpoints
app.use("/api/image", imageRoutes); // Image processing endpoints

mongoose.connect(MONGO_URI)         // Connect to MongoDB
    .then(() => app.listen(PORT))   // Start server after DB connects
```

**Key Concept:** The backend runs on port 3000 and exposes REST API endpoints that the frontend calls.

---

### 2. User Model (`backend/models/User.js`)

```javascript
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },  // Hashed with bcrypt
    createdAt: { type: Date, default: Date.now }
});
```

**Purpose:** Defines the structure of user documents stored in MongoDB.

---

### 3. Image Model (`backend/models/Image.js`)

```javascript
const imageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    filename: String,           // Stored filename
    originalName: String,       // Original upload name
    path: String,              // Server path to file
    size: Number,              // File size in bytes
    width: Number,             // Image dimensions
    height: Number,
    format: String,            // jpeg, png, webp
    createdAt: { type: Date, default: Date.now }
});
```

**Purpose:** Tracks saved images in the gallery, linked to users via `userId`.

---

### 4. Authentication Routes (`backend/routes/auth.js`)

#### Signup Endpoint
```javascript
router.post("/signup", async (req, res) => {
    // 1. Extract name, email, password from request body
    // 2. Validate all fields are present
    // 3. Check if email already exists in database
    // 4. Hash password using bcrypt (12 salt rounds)
    // 5. Create new User document in MongoDB
    // 6. Generate JWT token (valid for 7 days)
    // 7. Return token and user info to frontend
});
```

#### Login Endpoint
```javascript
router.post("/login", async (req, res) => {
    // 1. Extract email, password from request body
    // 2. Find user by email in database
    // 3. Compare password with stored hash using bcrypt
    // 4. If match, generate new JWT token
    // 5. Return token and user info to frontend
});
```

#### Verify Token Endpoint
```javascript
router.get("/verify", async (req, res) => {
    // 1. Extract token from Authorization header
    // 2. Verify token using JWT secret
    // 3. Find user by ID from decoded token
    // 4. Return user info (used on page refresh)
});
```

**Key Concept:** JWT tokens are stored in the frontend's localStorage and sent with every authenticated request.

---

### 5. Image Processing Routes (`backend/routes/image.js`)

#### File Upload Setup (Multer)
```javascript
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),  // Save to /uploads
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.random().toString(36).slice(2);
        cb(null, unique + path.extname(file.originalname));  // Unique filename
    }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
```

**Purpose:** Multer handles multipart/form-data (file uploads) and saves files to disk.

---

#### Upload Endpoint
```javascript
router.post("/upload", upload.single("image"), async (req, res) => {
    // 1. Multer saves file to /uploads directory
    // 2. Use Sharp to read image metadata (width, height, format)
    // 3. Return file info to frontend (filename, path, dimensions)
});
```

---

#### Resize Endpoint
```javascript
router.post("/resize/:filename", async (req, res) => {
    // 1. Get original file from /uploads
    // 2. Extract width, height from request body
    // 3. Use Sharp to resize: sharp(file).resize(width, height)
    // 4. Save to /processed directory with new filename
    // 5. Read metadata of new file
    // 6. Return new file info to frontend
});
```

---

#### Crop Endpoint
```javascript
router.post("/crop/:filename", async (req, res) => {
    // 1. Extract left, top, width, height from request body
    // 2. Use Sharp: sharp(file).extract({ left, top, width, height })
    // 3. Save cropped image to /processed
    // 4. Return new file info
});
```

---

#### Rotate Endpoint
```javascript
router.post("/rotate/:filename", async (req, res) => {
    // 1. Extract angle from request body
    // 2. Use Sharp: sharp(file).rotate(angle, { background: "#000" })
    // 3. Save rotated image
    // 4. Return new file info
});
```

---

#### Filter Endpoint
```javascript
router.post("/filter/:filename", async (req, res) => {
    // 1. Extract filter name from request body
    // 2. Apply corresponding Sharp transformation:
    //    - grayscale: .grayscale()
    //    - sepia: .recomb([[...sepia matrix...]])
    //    - invert: .negate()
    //    - blur: .blur(3)
    //    - sharpen: .sharpen()
    //    - warm/cool/vivid: .modulate({ saturation, hue })
    // 3. Save filtered image
    // 4. Return new file info
});
```

---

#### Adjust Endpoint (Brightness/Saturation)
```javascript
router.post("/adjust/:filename", async (req, res) => {
    // 1. Extract brightness, saturation values
    // 2. Use Sharp: .modulate({ brightness, saturation })
    // 3. Save adjusted image
    // 4. Return new file info
});
```

---

#### Convert Format Endpoint
```javascript
router.post("/convert/:filename", async (req, res) => {
    // 1. Extract target format and quality
    // 2. Use Sharp:
    //    - .jpeg({ quality }) for JPEG
    //    - .png({ compressionLevel }) for PNG
    //    - .webp({ quality }) for WebP
    // 3. Save converted image with new extension
    // 4. Return new file info
});
```

---

#### Remove Background Endpoint
```javascript
router.post("/remove-bg/:filename", async (req, res) => {
    // 1. Read image as raw pixel data using Sharp
    // 2. Get background color from corner pixels
    // 3. Loop through all pixels
    // 4. If pixel color is similar to background (within tolerance),
    //    set alpha channel to 0 (transparent)
    // 5. Create new PNG with transparency
    // 6. Return new file info
});
```

**Note:** This is a simple algorithm that works best with solid-color backgrounds.

---

#### Save to Gallery Endpoint
```javascript
router.post("/save/:filename", async (req, res) => {
    // 1. Check if user has reached save limit (3 for free)
    // 2. Copy file from /processed to /gallery with unique name
    // 3. Create Image document in MongoDB with userId
    // 4. Return updated save count
});
```

---

#### Gallery Endpoints
```javascript
// Get all images for a user
router.get("/gallery/:userId", async (req, res) => {
    // Query MongoDB for all Images where userId matches
});

// Delete an image
router.delete("/gallery/:imageId", async (req, res) => {
    // 1. Find image in database
    // 2. Delete file from disk
    // 3. Delete document from MongoDB
});

// Public access to image (for sharing)
router.get("/public/:imageId", async (req, res) => {
    // Find image by ID and serve the file
});
```

---

## Frontend Explanation

### 1. App Component (`frontend/src/App.jsx`)

```javascript
// Creates authentication context for the entire app
const AuthContext = createContext(null);

function App() {
    const [user, setUser] = useState(null);      // Current user
    const [token, setToken] = useState(...);      // JWT token from localStorage
    const [currentPage, setCurrentPage] = useState('processor');  // Navigation

    // On mount, verify token with backend
    useEffect(() => {
        fetch('/api/auth/verify', { headers: { Authorization: `Bearer ${token}` }})
            .then(res => res.json())
            .then(data => setUser(data.user));
    }, [token]);

    // Provide auth context to all child components
    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {user ? <MainApp /> : <LoginOrSignup />}
        </AuthContext.Provider>
    );
}
```

**Key Concept:** The `AuthContext` allows any component to access user info and auth functions without prop drilling.

---

### 2. Login Component (`frontend/src/components/Login.jsx`)

```javascript
function Login({ onToggle }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();  // From AuthContext

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);  // Show loading overlay

        // Call backend API
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
            login(data.user, data.token);  // Store in context + localStorage
        }
        setLoading(false);
    };

    return (
        <>
            {loading && <LoadingOverlay text="Signing In..." />}
            <form onSubmit={handleSubmit}>
                {/* Email and password inputs */}
                <Button type="submit">Sign In</Button>
            </form>
        </>
    );
}
```

---

### 3. ImageProcessor Component (`frontend/src/components/ImageProcessor.jsx`)

This is the main editor component. Here's how it works:

```javascript
function ImageProcessor() {
    const [uploadedImage, setUploadedImage] = useState(null);   // Original image
    const [processedImage, setProcessedImage] = useState(null); // After edits
    const [activeTab, setActiveTab] = useState('resize');       // Current tool
    const [loading, setLoading] = useState(false);              // Loading state

    // Generic API call helper
    const apiCall = async (url, method, body) => {
        setLoading(true);
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        setLoading(false);
        return data;
    };

    // Upload handler
    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData  // No Content-Type header for FormData
        });
        const data = await res.json();
        setUploadedImage(data.file);  // Store uploaded image info
    };

    // Resize handler
    const handleResize = async () => {
        const data = await apiCall(
            `${API_URL}/resize/${uploadedImage.filename}`,
            'POST',
            { width: resizeWidth, height: resizeHeight }
        );
        setProcessedImage(data.file);  // Update preview
    };

    // Similar handlers for crop, rotate, filter, etc.
    // Each calls the corresponding backend endpoint
    // and updates processedImage state

    return (
        <>
            {loading && <LoadingOverlay text="Processing..." />}

            {/* Tool tabs (Resize, Crop, Filters, etc.) */}
            <ToolTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Left panel: Tool-specific controls */}
            <ToolPanel activeTab={activeTab} />

            {/* Center: Side-by-side image preview */}
            <ImagePreview
                original={uploadedImage}
                processed={processedImage}
            />

            {/* Right panel: Stats and actions (Save, Download) */}
            <ActionsPanel />
        </>
    );
}
```

---

### 4. Dashboard/Gallery Component (`frontend/src/components/Dashboard.jsx`)

```javascript
function Gallery() {
    const [images, setImages] = useState([]);
    const { user } = useAuth();

    // Fetch user's saved images on mount
    useEffect(() => {
        fetch(`${API_URL}/gallery/${user.id}`)
            .then(res => res.json())
            .then(data => setImages(data.images));
    }, [user.id]);

    // Delete image
    const handleDelete = async (imageId) => {
        await fetch(`${API_URL}/gallery/${imageId}`, { method: 'DELETE' });
        setImages(images.filter(img => img._id !== imageId));
    };

    // Copy share link to clipboard
    const handleShare = (imageId) => {
        navigator.clipboard.writeText(`${API_URL}/public/${imageId}`);
    };

    return (
        <Grid>
            {images.map(img => (
                <ImageCard
                    image={img}
                    onDelete={handleDelete}
                    onShare={handleShare}
                />
            ))}
        </Grid>
    );
}
```

---

## How Frontend Connects to Backend

### 1. API URL Configuration

```javascript
// In each frontend component:
const BASE_URL = import.meta.env.VITE_API_URL || 'https://imageprocessor-zypx.onrender.com';
const API_URL = `${BASE_URL}/api/image`;
```

- In development: Uses `.env` file with `VITE_API_URL=http://localhost:3000`
- In production: Uses the Render backend URL

### 2. CORS (Cross-Origin Resource Sharing)

```javascript
// backend/index.js
app.use(cors());  // Allows requests from any origin
```

This allows the frontend (on Vercel) to make API calls to the backend (on Render).

### 3. Request Flow Example

```
User clicks "Apply Resize" button
        ↓
Frontend: handleResize() called
        ↓
Frontend: fetch(`${API_URL}/resize/${filename}`, { method: 'POST', body: {...} })
        ↓
HTTP Request travels over internet
        ↓
Backend: Express receives request at /api/image/resize/:filename
        ↓
Backend: Sharp processes image, saves to /processed
        ↓
Backend: res.json({ file: { path, width, height, ... } })
        ↓
HTTP Response travels back
        ↓
Frontend: setProcessedImage(data.file)
        ↓
React re-renders with new image URL
        ↓
Browser requests image from backend static path
        ↓
User sees processed image
```

---

## Database Schema

### Users Collection
```json
{
    "_id": "ObjectId",
    "name": "John Doe",
    "email": "john@example.com",
    "password": "$2b$12$...",  // bcrypt hash
    "createdAt": "2024-01-28T00:00:00.000Z"
}
```

### Images Collection
```json
{
    "_id": "ObjectId",
    "userId": "ObjectId (reference to Users)",
    "filename": "abc123_1706428800_image.jpg",
    "originalName": "photo.jpg",
    "path": "/gallery/abc123_1706428800_image.jpg",
    "size": 245760,
    "width": 1920,
    "height": 1080,
    "format": "jpeg",
    "createdAt": "2024-01-28T00:00:00.000Z"
}
```

---

## API Endpoints Summary

### Authentication (`/api/auth`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /signup | Create new user |
| POST | /login | Authenticate user |
| GET | /verify | Verify JWT token |

### Image Processing (`/api/image`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /upload | Upload image |
| POST | /resize/:filename | Resize image |
| POST | /crop/:filename | Crop image |
| POST | /rotate/:filename | Rotate image |
| POST | /filter/:filename | Apply filter |
| POST | /adjust/:filename | Adjust brightness/saturation |
| POST | /convert/:filename | Convert format |
| POST | /remove-bg/:filename | Remove background |
| POST | /save/:filename | Save to gallery |
| GET | /gallery/:userId | Get user's images |
| GET | /gallery/count/:userId | Get save count |
| DELETE | /gallery/:imageId | Delete image |
| GET | /public/:imageId | Public image access |
| GET | /uploads/:filename | Serve uploaded file |
| GET | /processed/:filename | Serve processed file |

---

## Authentication Flow

```
1. User enters email/password → clicks Sign Up
2. Frontend sends POST /api/auth/signup with credentials
3. Backend hashes password with bcrypt
4. Backend creates User document in MongoDB
5. Backend generates JWT token with userId
6. Frontend receives token, stores in localStorage
7. Frontend sets user in AuthContext
8. App re-renders, shows ImageProcessor

On page refresh:
1. App reads token from localStorage
2. Frontend sends GET /api/auth/verify with token in header
3. Backend decodes JWT, finds user in database
4. Frontend sets user in AuthContext
5. User remains logged in
```

---

## Image Processing Flow

```
1. User selects file → triggers handleUpload
2. Frontend creates FormData, sends POST /api/image/upload
3. Backend (Multer) saves file to /uploads
4. Backend returns file info (filename, dimensions)
5. Frontend stores as uploadedImage state

6. User adjusts resize values → clicks Apply
7. Frontend sends POST /api/image/resize/:filename
8. Backend (Sharp) reads from /uploads, processes, saves to /processed
9. Backend returns new file info
10. Frontend stores as processedImage state
11. Frontend displays both images side-by-side

12. User clicks Save
13. Frontend sends POST /api/image/save/:filename with userId
14. Backend copies from /processed to /gallery
15. Backend creates Image document in MongoDB
16. Frontend updates save count

17. User goes to Gallery
18. Frontend fetches GET /api/image/gallery/:userId
19. Backend queries MongoDB for user's images
20. Frontend renders image grid with share/delete options
```

---

## Key Concepts Used

1. **REST API Design**: Stateless, resource-based endpoints
2. **JWT Authentication**: Secure, stateless user sessions
3. **File Handling**: Multer for uploads, Sharp for processing
4. **Database Relations**: Images linked to Users via ObjectId
5. **Environment Variables**: Secure configuration management
6. **CORS**: Enabling cross-origin frontend-backend communication
7. **React Context**: Global state management for auth
8. **Async/Await**: Modern JavaScript for handling promises
9. **Component Architecture**: Modular, reusable UI components
10. **Responsive Design**: Mobile-friendly with Chakra UI

---

## Deployment Architecture

```
┌─────────────────┐      HTTPS       ┌─────────────────┐
│                 │  ──────────────> │                 │
│  User Browser   │                  │    Vercel       │
│                 │ <────────────────│  (Frontend)     │
└─────────────────┘   Static Files   └─────────────────┘
        │                                    │
        │ API Requests                       │ Build from
        ▼                                    ▼
┌─────────────────┐                  ┌─────────────────┐
│                 │                  │                 │
│     Render      │ <───────────────>│    GitHub       │
│   (Backend)     │    Deploy Hook   │   Repository    │
│                 │                  │                 │
└─────────────────┘                  └─────────────────┘
        │
        │ Database Connection
        ▼
┌─────────────────┐
│                 │
│  MongoDB Atlas  │
│   (Database)    │
│                 │
└─────────────────┘
```

---

## Conclusion

This ImageProcessor project demonstrates:
- Full-stack JavaScript development
- RESTful API design
- Secure authentication patterns
- Server-side image processing
- Cloud deployment practices
- Modern React patterns

It serves as an excellent portfolio piece showcasing end-to-end web development skills.
