# 3DModel-Block-Stack

## Overview

3DModel-Block-Stack is a web application built using JavaScript, React, and Three.js. This project allows users to interact with 3D blocks within a browser environment. Users can stack and view 3D blocks, creating an engaging and interactive experience.

## Features

- **Block Manipulation**: Add, remove, and move blocks within the 3D space.
- **Real-time Rendering**: Smooth and real-time rendering of 3D models using Three.js.
- **Responsive Design**: Optimized for various screen sizes and devices.

## Installation

### Prerequisites

Ensure you have the following installed on your machine:
- Node.js (v12 or higher)
- npm (v6 or higher)

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sireyuu/3DModel-Block-Stac.git
   cd 3DModel-Block-Stack
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open the application**:
   Open your browser and navigate to `http://localhost:3000`.

## Usage

Once the application is running, you can interact with the 3D model environment:

- **Adding Blocks**: Use the interface buttons to add new blocks to the scene.
- **Moving Blocks**: Click and drag blocks to move them around the space.
- **Removing Blocks**: Select a block and use the remove option to delete it from the scene.
- **Camera Controls**: Use mouse or touch inputs to rotate, zoom, and pan the camera view.

## Technologies Used

- **JavaScript**: Core programming language for logic and functionality.
- **React**: Library for building the user interface and managing state.
- **Three.js**: Library for creating and displaying 3D graphics in the browser.

## Project Structure

```plaintext
3DModel-Block-Stack/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/
│   │   ├── Block.js
│   │   ├── Scene.js
│   │   └── ...
│   ├── App.js
│   ├── index.js
│   └── ...
├── package.json
├── README.md
└── ...
```

- **public/**: Contains static files including the HTML template.
- **src/**: Contains the React components and application logic.
  - **components/**: Contains React components like Block and Scene.
  - **App.js**: Main application component.
  - **index.js**: Entry point for the React application.


---

Thank you for using 3DModel-Block-Stack!
