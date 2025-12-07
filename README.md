# Hi there! Welcome to Pokémon Explorer

A React Native mobile application built with Expo that allows users to explore and discover Pokémon from the PokeAPI. This project was developed as a learning exercise to gain hands-on experience with React Native, TypeScript, and mobile app development.

## Overview

Pokémon Explorer is a cross-platform mobile application that provides an intuitive interface for browsing Pokémon data. Users can search, filter, and view detailed information about their favorite Pokémon, including stats, types, forms, and physical attributes.

## Features

- **Pokémon List View**: Browse a curated list of Pokémon with visual cards displaying names and sprites
- **Search Functionality**: Search Pokémon by name or National Pokédex number
- **Advanced Filtering**: Filter and sort Pokémon by:
  - Name (alphabetical)
  - Type (grouped by primary type)
  - Power (sorted by base experience)
- **Detailed Pokémon View**: Access comprehensive information including:
  - Official artwork and multiple sprite forms
  - Type classifications with color-coded themes
  - Base statistics with visual progress bars
  - Physical attributes (height and weight)
  - Flavor text descriptions
- **Responsive Design**: Clean, modern UI with type-based color theming for an enhanced user experience
- **Error Handling**: Graceful error handling with user-friendly messages
- **Loading States**: Smooth loading indicators during data fetching

## Technologies Used

- **React Native** (0.81.5) - Cross-platform mobile framework
- **Expo** (~54.0.23) - Development platform and toolchain
- **TypeScript** (~5.9.2) - Type-safe JavaScript
- **Expo Router** (~6.0.14) - File-based routing system
- **React Navigation** - Navigation library for screen transitions
- **PokeAPI** - External REST API for Pokémon data

## Project Structure

```
app/
  ├── _layout.tsx      # Root layout with navigation configuration
  ├── index.tsx        # Main Pokémon list screen
  └── pok_details.tsx  # Pokémon detail view screen
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager
- Expo CLI (optional, can use npx)
- iOS Simulator (for macOS) or Android Emulator, or Expo Go app on a physical device

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Pokemon-Explorer-React-Native
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Run on your preferred platform:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan the QR code with Expo Go app on your physical device
   - Press `w` to open in web browser

## Development

This project uses Expo's file-based routing system. The main application screens are located in the `app/` directory:

- `app/index.tsx` - Entry point displaying the Pokémon list
- `app/pok_details.tsx` - Detail screen for individual Pokémon information

### Key Learning Concepts Demonstrated

- React Hooks (useState, useEffect, useMemo)
- TypeScript interfaces and type safety
- API integration with async/await and error handling
- React Native components (ScrollView, Image, TouchableOpacity, etc.)
- Navigation with Expo Router
- State management and data filtering
- Responsive styling with StyleSheet
- Loading and error state management

## API Integration

This application integrates with the [PokeAPI](https://pokeapi.co/), a free RESTful API that provides comprehensive Pokémon data. The app fetches:

- Pokémon list with pagination
- Individual Pokémon details including sprites, stats, types, and species information
- Error handling for network failures and API errors

## Future Enhancements

Potential improvements for future iterations:
- Pagination for loading more Pokémon
- Favorites/bookmarking functionality
- Offline data caching
- Animation transitions
- Additional filtering options
- Comparison feature between Pokémon

## License

This project is for educational purposes and personal learning.

## Acknowledgments

- [PokeAPI](https://pokeapi.co/) for providing the comprehensive Pokémon data API
- [Expo](https://expo.dev/) for the excellent development platform and documentation
- [React Native Tutorial](https://www.youtube.com/watch?v=BUXnASp_WyQ) - Tutorial that helped guide the learning process for this project
- [Mobile Pokedex App Design](https://dribbble.com/shots/16833947-Mobile-Pokedex-App-Design-Exploration) - Design inspiration and reference from Dribbble
