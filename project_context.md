# QR Code Scanner & Generator Project Context

## Project Overview
A responsive web-based QR code scanner and generator application built with Flask, featuring both scanning and generation capabilities with a modern dark-themed UI.

## Technical Stack
- Backend: Flask (Python)
- Frontend: HTML5, JavaScript
- Database: PostgreSQL
- UI Framework: Bootstrap with Replit dark theme
- Libraries: jsQR, QRious for QR functionality

## Current Features
1. QR Code Scanner:
   - Web-based camera access
   - Real-time QR code detection
   - Camera switching capability
   - Scan history tracking
   - Copy/Share functionality

2. QR Code Generator:
   - Custom text/URL input
   - Color customization
   - Logo embedding
   - Animation effects
   - Download capability

3. General Features:
   - Dark/Light theme toggle
   - Responsive design
   - History tracking in database
   - Error handling

## Development Decisions
1. Hosting Strategy:
   - Primary hosting on Replit
   - Limitations acknowledged:
     * Sleep after 1 hour inactivity
     * Wake on visit
     * Basic compute resources
     * Fair usage bandwidth policy

2. Code Management:
   - Primary development on Replit
   - Planned GitHub backup strategy
   - Database persistence on Replit

## Database Structure
- ScanHistory table for tracking scans:
  * id (Primary Key)
  * content (QR content)
  * scan_type
  * created_at (timestamp)

## Future Features (Pending Implementation)
1. QR code generation functionality (Implemented)
2. Scan history (Implemented)
3. Support for different QR code types
4. Barcode scanning capability

## Important Notes
1. The application is fully functional on Replit's infrastructure
2. Database data persists between sessions
3. Files and code are safely stored in Replit
4. The app is accessible via Replit's subdomain system

## Current Status
- Basic functionality is working
- Camera access and scanning are operational
- QR generation is implemented
- Database integration is complete
- Theme system is functioning

## Next Steps
1. Set up GitHub backup system (pending user access)
2. Implement remaining future features when requested
3. Continue optimizing and improving existing features

Use this context to maintain continuity across chat sessions. The project files and codebase will remain accessible, but this summary provides the discussion and decision context.
