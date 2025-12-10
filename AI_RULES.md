# AI Development Rules for LojaEddy

This document outlines the rules and conventions for the AI assistant (Dyad) to follow when developing and modifying this application.

## Tech Stack

- **Framework**: React 19 with TypeScript.
- **Build Tool**: Vite for fast development and bundling.
- **Styling**: Tailwind CSS for all styling. Utility-first classes are mandatory.
- **Routing**: Custom state-based routing managed within `App.tsx`.
- **State Management**: React Hooks (`useState`, `useEffect`) for local and simple global state.
- **UI Components**: A mix of custom-built components and pre-built `shadcn/ui` components.
- **Icons**: `lucide-react` for consistent and clean icons.
- **Data**: Static data is managed in `src/constants.ts`.

## Library and Convention Rules

### 1. UI Components
- **Primary Choice**: Always prioritize using components from the `shadcn/ui` library for common UI patterns (e.g., Buttons, Dialogs, Forms, etc.).
- **Custom Components**: If a `shadcn/ui` component is not suitable, create a new, single-purpose, reusable component in the `src/components/` directory.
- **Styling**: All components, whether from `shadcn/ui` or custom-built, must be styled using **Tailwind CSS**. Do not use separate CSS files or inline `style` objects unless absolutely necessary for a specific, complex case.

### 2. Icons
- **Exclusively Use `lucide-react`**: For any icon needed in the application, import it from the `lucide-react` package. This ensures visual consistency. Avoid using inline SVGs or other icon libraries.

### 3. State Management
- **Local State**: Use `useState` and `useReducer` for component-level state.
- **Global State**: The main `App.tsx` component currently manages the global state (e.g., `currentPage`, `cartItemCount`, `wishlistItems`). Continue this pattern. If state management becomes too complex, propose a simple state management library like Zustand, but do not implement it without user confirmation.

### 4. Routing
- **Current System**: The app uses a state variable (`currentPage`) in `App.tsx` to handle navigation. Adhere to this existing system.
- **Navigation**: Use the `navigateTo` function provided in `App.tsx` to change pages. Do not install or use `react-router-dom` unless explicitly requested by the user.

### 5. Code Structure
- **Components**: All reusable React components must be placed in `src/components/`.
- **Types**: All TypeScript types and interfaces should be defined in `src/types.ts`.
- **Constants**: Static data, like the product list, should be kept in `src/constants.ts`.
- **File Naming**: Use PascalCase for component files (e.g., `ProductCard.tsx`).

### 6. General Principles
- **Simplicity**: Keep the code simple, readable, and maintainable. Avoid over-engineering.
- **Responsiveness**: All new components and layouts must be fully responsive and tested on different screen sizes.
- **Immutability**: When updating state (especially arrays and objects), always create a new instance instead of mutating the existing one.